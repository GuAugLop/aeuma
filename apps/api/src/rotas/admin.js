// Endpoints protegidos usados pelo painel administrativo.
import fs from "node:fs";
import { Router } from "express";
import { TIPOS_DOCUMENTO } from "../config.js";
import { CHAVES_CATEGORIA, MESES, rotuloCategoria } from "../catalogo.js";
import {
  achar,
  agora,
  apagarArquivoDoDisco,
  calculosOrdenados,
  colecao,
  db,
  documentosOrdenados,
  estatuto,
  novoId,
  salvar,
} from "../db.js";
import { serializar } from "../serializar.js";
import { descreverArquivo, receberArquivo } from "../upload.js";
import { exigirAdmin } from "../auth.js";
import { rotasConteudo } from "./conteudo.js";

export const rotasAdmin = Router();
rotasAdmin.use(exigirAdmin);

// Conteúdo institucional primeiro: as rotas com nome fixo (/linhas, /setores,
// /membros, /estatuto) precisam ser avaliadas antes do genérico /:tipo.
rotasAdmin.use(rotasConteudo);

// ------------------------------------------------------------------ auxiliares
function validarTipo(req, res, next) {
  if (!TIPOS_DOCUMENTO.includes(req.params.tipo)) {
    return res.status(404).json({ erro: "Seção inválida." });
  }
  next();
}

const descartar = (req) => {
  if (req.file?.path) fs.rm(req.file.path, { force: true }, () => {});
};

function erro(req, res, status, mensagem) {
  descartar(req);
  return res.status(status).json({ erro: mensagem });
}

/** Lê e valida os campos de um cálculo mensal. */
function camposCalculo(req, res, atual) {
  const ano = Number(req.body?.ano ?? atual?.ano);
  const mes = Number(req.body?.mes ?? atual?.mes);
  if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
    erro(req, res, 400, "Informe um ano válido (entre 2000 e 2100).");
    return null;
  }
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    erro(req, res, 400, "Informe um mês válido.");
    return null;
  }
  const repetido = db().calculos.find((c) => c.ano === ano && c.mes === mes && c.id !== atual?.id);
  if (repetido) {
    erro(req, res, 409, `Já existe um cálculo para ${MESES[mes - 1]}/${ano}.`);
    return null;
  }
  const titulo = String(req.body?.titulo || atual?.titulo || "").trim();
  return { ano, mes, titulo: titulo || `Cálculo mensal — ${MESES[mes - 1]}/${ano}` };
}

/** Lê e valida os campos de um documento da transparência. */
function camposDocumento(req, res, atual) {
  const titulo = String(req.body?.titulo ?? atual?.titulo ?? "").trim();
  const categoria = String(req.body?.categoria ?? atual?.categoria ?? "").trim();
  if (titulo.length < 3 || titulo.length > 160) {
    erro(req, res, 400, "O título precisa ter entre 3 e 160 caracteres.");
    return null;
  }
  if (!CHAVES_CATEGORIA.includes(categoria)) {
    erro(req, res, 400, "Escolha uma categoria válida.");
    return null;
  }
  const descricao = String(req.body?.descricao ?? atual?.descricao ?? "").trim();
  return { titulo, categoria, descricao: descricao || rotuloCategoria(categoria) };
}

const validarCampos = (tipo, req, res, atual) =>
  tipo === "calculos" ? camposCalculo(req, res, atual) : camposDocumento(req, res, atual);

// ----------------------------------------------------------------------- listas
rotasAdmin.get("/resumo", (_req, res) => {
  const docs = documentosOrdenados();
  const calcs = calculosOrdenados();
  res.json({
    calculos: {
      total: calcs.length,
      comArquivo: calcs.filter((c) => c.arquivo).length,
      anos: [...new Set(calcs.map((c) => c.ano))].sort((a, b) => b - a),
    },
    transparencia: { total: docs.length, comArquivo: docs.filter((d) => d.arquivo).length },
    itinerarios: { total: colecao("linhas").length },
    diretoria: { setores: colecao("setores").length, membros: colecao("membros").length },
    estatuto: { topicos: estatuto().topicos.length, temArquivo: !!estatuto().arquivo },
    ultimoEnvio: [...calcs, ...docs]
      .filter((r) => r.arquivo)
      .sort((a, b) => String(b.arquivo.enviadoEm).localeCompare(String(a.arquivo.enviadoEm)))[0]?.arquivo
      ?.enviadoEm || null,
  });
});

rotasAdmin.get("/:tipo", validarTipo, (req, res) => {
  const tipo = req.params.tipo;
  const itens = tipo === "calculos" ? calculosOrdenados() : documentosOrdenados();
  res.json({ total: itens.length, itens: itens.map((r) => serializar(tipo, r)) });
});

// ------------------------------------------------------------------- criar item
// Aceita multipart: os campos do registro e, opcionalmente, o arquivo já no mesmo envio.
rotasAdmin.post("/:tipo", validarTipo, receberArquivo(false), async (req, res) => {
  const tipo = req.params.tipo;
  const campos = validarCampos(tipo, req, res, null);
  if (!campos) return;

  const registro = {
    id: novoId(),
    ...campos,
    arquivo: req.file ? descreverArquivo(req.file) : null,
    criadoEm: agora(),
    atualizadoEm: agora(),
  };
  if (tipo === "calculos") db().calculos.push(registro);
  else {
    registro.ordem = db().documentos.length;
    db().documentos.push(registro);
  }
  await salvar();
  res.status(201).json({ item: serializar(tipo, registro) });
});

// ------------------------------------------------------------------ editar item
rotasAdmin.patch("/:tipo/:id", validarTipo, async (req, res) => {
  const tipo = req.params.tipo;
  const registro = achar(tipo, req.params.id);
  if (!registro) return res.status(404).json({ erro: "Registro não encontrado." });

  const campos = validarCampos(tipo, req, res, registro);
  if (!campos) return;

  Object.assign(registro, campos, { atualizadoEm: agora() });
  await salvar();
  res.json({ item: serializar(tipo, registro) });
});

// ----------------------------------------------------------- enviar/trocar arquivo
rotasAdmin.post("/:tipo/:id/arquivo", validarTipo, receberArquivo(true), async (req, res) => {
  const tipo = req.params.tipo;
  const registro = achar(tipo, req.params.id);
  if (!registro) return erro(req, res, 404, "Registro não encontrado.");

  const anterior = registro.arquivo;
  registro.arquivo = descreverArquivo(req.file);
  registro.atualizadoEm = agora();
  await salvar();
  apagarArquivoDoDisco(tipo, anterior);
  res.json({ item: serializar(tipo, registro) });
});

rotasAdmin.delete("/:tipo/:id/arquivo", validarTipo, async (req, res) => {
  const tipo = req.params.tipo;
  const registro = achar(tipo, req.params.id);
  if (!registro) return res.status(404).json({ erro: "Registro não encontrado." });
  if (!registro.arquivo) return res.status(400).json({ erro: "Esse registro não tem arquivo." });

  const anterior = registro.arquivo;
  registro.arquivo = null;
  registro.atualizadoEm = agora();
  await salvar();
  apagarArquivoDoDisco(tipo, anterior);
  res.json({ item: serializar(tipo, registro) });
});

// ----------------------------------------------------------------- excluir item
rotasAdmin.delete("/:tipo/:id", validarTipo, async (req, res) => {
  const tipo = req.params.tipo;
  const lista = tipo === "calculos" ? db().calculos : db().documentos;
  const i = lista.findIndex((r) => r.id === req.params.id);
  if (i < 0) return res.status(404).json({ erro: "Registro não encontrado." });

  const [removido] = lista.splice(i, 1);
  await salvar();
  apagarArquivoDoDisco(tipo, removido.arquivo);
  res.json({ ok: true, id: removido.id });
});
