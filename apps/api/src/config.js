// Configuração central: caminhos do monorepo e variáveis de ambiente.
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const AQUI = path.dirname(fileURLToPath(import.meta.url));

/** Raiz do monorepo (…/aeuma-rebranding) */
export const RAIZ = path.resolve(AQUI, "..", "..", "..");

dotenv.config({ path: path.join(RAIZ, ".env") });

export const CAMINHOS = {
  raiz: RAIZ,
  site: path.join(RAIZ, "apps", "site"),
  admin: path.join(RAIZ, "apps", "admin"),
  dados: path.join(RAIZ, "data"),
  banco: path.join(RAIZ, "data", "db.json"),
  uploads: path.join(RAIZ, "data", "uploads"),
};

/** Coleções que aceitam arquivo, e a pasta de upload de cada uma. */
export const TIPOS = {
  calculos: { pasta: path.join(CAMINHOS.uploads, "calculos"), rotulo: "Cálculos Mensais" },
  transparencia: { pasta: path.join(CAMINHOS.uploads, "transparencia"), rotulo: "Transparência" },
  estatuto: { pasta: path.join(CAMINHOS.uploads, "estatuto"), rotulo: "Estatuto Social" },
};

/** Das anteriores, as que são listas de documentos (as duas com CRUD por item). */
export const TIPOS_DOCUMENTO = ["calculos", "transparencia"];

const producao = process.env.NODE_ENV === "production";

let segredo = process.env.JWT_SEGREDO?.trim();
if (!segredo) {
  if (producao) {
    console.error(
      "\n[AEUMA] ERRO: JWT_SEGREDO não definido. Em produção é obrigatório.\n" +
        '        Gere um: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n'
    );
    process.exit(1);
  }
  // Em desenvolvimento, gera e persiste um segredo para as sessões sobreviverem a reinícios.
  const arquivo = path.join(CAMINHOS.dados, ".segredo-dev");
  fs.mkdirSync(CAMINHOS.dados, { recursive: true });
  if (fs.existsSync(arquivo)) {
    segredo = fs.readFileSync(arquivo, "utf8").trim();
  } else {
    segredo = crypto.randomBytes(48).toString("hex");
    fs.writeFileSync(arquivo, segredo, "utf8");
  }
}

export const config = {
  producao,
  porta: Number(process.env.PORTA || 3000),
  segredo,
  sessaoHoras: 8,
  cookie: "aeuma_sessao",
  uploadMaxBytes: Number(process.env.UPLOAD_MAX_MB || 25) * 1024 * 1024,
  admin: {
    email: (process.env.ADMIN_EMAIL || "admin@aeuma.com").trim().toLowerCase(),
    nome: process.env.ADMIN_NOME || "Administrador AEUMA",
    senha: process.env.ADMIN_SENHA || "aeuma@2026",
  },
};

/** Extensões aceitas nos uploads. */
export const EXTENSOES = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".png", ".jpg", ".jpeg"];

export const MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
]);
