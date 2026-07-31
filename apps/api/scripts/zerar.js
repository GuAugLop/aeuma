// Esvazia seções do banco (e apaga os arquivos correspondentes).
//
//   npm run zerar -- --tudo
//   npm run zerar -- --calculos --transparencia
//   npm run zerar -- --itinerarios --diretoria --estatuto
//
// As contas de administrador nunca são apagadas.
import fs from "node:fs";
import path from "node:path";
import { TIPOS } from "../src/config.js";
import { carregar, colecao, conteudoInicial, db, salvar } from "../src/db.js";

const args = new Set(process.argv.slice(2).map((a) => a.replace(/^--/, "")));
const tudo = args.has("tudo");
const quer = (nome) => tudo || args.has(nome);

const SECOES = ["calculos", "transparencia", "itinerarios", "diretoria", "estatuto"];

if (!args.size) {
  console.error(
    `Informe o que zerar: --tudo ou uma ou mais de ${SECOES.map((s) => "--" + s).join(" ")}`
  );
  process.exit(1);
}

const desconhecidas = [...args].filter((a) => a !== "tudo" && !SECOES.includes(a));
if (desconhecidas.length) {
  console.error(`Opção desconhecida: --${desconhecidas[0]}`);
  process.exit(1);
}

function limparPasta(tipo) {
  const pasta = TIPOS[tipo]?.pasta;
  if (!pasta || !fs.existsSync(pasta)) return 0;
  let n = 0;
  for (const nome of fs.readdirSync(pasta)) {
    if (nome === ".gitkeep") continue;
    fs.rmSync(path.join(pasta, nome), { force: true });
    n++;
  }
  return n;
}

carregar();
const feito = [];

if (quer("calculos")) {
  const n = colecao("calculos").length;
  colecao("calculos").length = 0;
  feito.push(`cálculos mensais: ${n} registro(s), ${limparPasta("calculos")} arquivo(s)`);
}

if (quer("transparencia")) {
  const n = colecao("documentos").length;
  colecao("documentos").length = 0;
  feito.push(`transparência: ${n} registro(s), ${limparPasta("transparencia")} arquivo(s)`);
}

if (quer("itinerarios")) {
  const n = colecao("linhas").length;
  colecao("linhas").length = 0;
  feito.push(`itinerários: ${n} linha(s)`);
}

if (quer("diretoria")) {
  const s = colecao("setores").length;
  const m = colecao("membros").length;
  colecao("setores").length = 0;
  colecao("membros").length = 0;
  feito.push(`diretoria: ${s} setor(es) e ${m} membro(s)`);
}

if (quer("estatuto")) {
  const doc = db().estatuto || conteudoInicial().estatuto;
  const n = doc.topicos?.length || 0;
  db().estatuto = {
    titulo: "Estatuto Social da AEUMA",
    resumo: "",
    url: "",
    arquivo: null,
    topicos: [],
    atualizadoEm: new Date().toISOString(),
  };
  feito.push(`estatuto: ${n} capítulo(s), ${limparPasta("estatuto")} arquivo(s)`);
}

await salvar();
console.log("\n✓ Zerado:");
feito.forEach((l) => console.log("   · " + l));
console.log("\nAs contas de administrador foram mantidas.\n");
