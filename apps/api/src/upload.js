// Recebimento de arquivos. O binário vai para data/uploads/<tipo>/ com nome aleatório;
// o nome original fica só no banco, o que evita colisão e path traversal.
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import multer from "multer";
import { config, TIPOS, EXTENSOES, MIMES } from "./config.js";

/** Define a pasta de destino quando a rota não tem o parâmetro :tipo (ex.: estatuto). */
export const destinoFixo = (tipo) => (req, _res, next) => {
  req.tipoUpload = tipo;
  next();
};

const armazenamento = multer.diskStorage({
  destination(req, _file, cb) {
    const tipo = TIPOS[req.tipoUpload || req.params.tipo];
    if (!tipo) return cb(new Error("Tipo de documento inválido."));
    fs.mkdir(tipo.pasta, { recursive: true }, (erro) => cb(erro, tipo.pasta));
  },
  filename(_req, file, cb) {
    cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase());
  },
});

function filtro(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!EXTENSOES.includes(ext)) {
    return cb(new Error(`Formato não aceito. Envie: ${EXTENSOES.join(", ")}`));
  }
  if (!MIMES.has(file.mimetype) && file.mimetype !== "application/octet-stream") {
    return cb(new Error("O conteúdo do arquivo não corresponde à extensão."));
  }
  cb(null, true);
}

export const upload = multer({
  storage: armazenamento,
  fileFilter: filtro,
  // Sem isto o multer lê o nome do arquivo como latin1 e "relatório.pdf" chega quebrado.
  defParamCharset: "utf8",
  limits: { fileSize: config.uploadMaxBytes, files: 1 },
});

/** Middleware que aceita um único arquivo no campo "arquivo" e traduz os erros do multer. */
export function receberArquivo(obrigatorio = true) {
  const um = upload.single("arquivo");
  return (req, res, next) =>
    um(req, res, (erro) => {
      if (erro) {
        const limite = erro.code === "LIMIT_FILE_SIZE";
        return res.status(400).json({
          erro: limite
            ? `Arquivo acima do limite de ${Math.round(config.uploadMaxBytes / 1024 / 1024)} MB.`
            : erro.message || "Falha ao receber o arquivo.",
        });
      }
      if (obrigatorio && !req.file) return res.status(400).json({ erro: "Nenhum arquivo enviado." });
      next();
    });
}

/** Metadados que ficam guardados no banco. */
export const descreverArquivo = (file) => ({
  nome: path.basename(file.originalname),
  nomeArmazenado: file.filename,
  tamanho: file.size,
  mime: file.mimetype,
  enviadoEm: new Date().toISOString(),
});
