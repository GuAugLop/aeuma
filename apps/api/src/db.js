// Banco em arquivo JSON. Sem servidor de banco: tudo vive em data/db.json.
// Suficiente para o volume da AEUMA e fácil de fazer backup.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { CAMINHOS, TIPOS } from "./config.js";
import {
  CATEGORIAS,
  DIRETORIA_INICIAL,
  ESTATUTO_INICIAL,
  LINHAS_INICIAIS,
} from "./catalogo.js";

const VAZIO = {
  versao: 2,
  usuarios: [],
  // publicados pelo painel — começam vazios
  calculos: [],
  documentos: [],
  // conteúdo institucional
  linhas: [],
  setores: [],
  membros: [],
  estatuto: null,
};

let dados = null;
let fila = Promise.resolve();
let gravadoEm = 0;

export const novoId = () => crypto.randomUUID();
export const agora = () => new Date().toISOString();

function garantirPastas() {
  fs.mkdirSync(CAMINHOS.dados, { recursive: true });
  for (const t of Object.values(TIPOS)) fs.mkdirSync(t.pasta, { recursive: true });
}

// ------------------------------------------------------------- carga inicial
/** Itinerários, diretoria e estatuto nascem com o conteúdo que já estava no site. */
export function conteudoInicial() {
  const linhas = LINHAS_INICIAIS.map(([linha, destino, horario, instituicoes, coordenacao], i) => ({
    id: novoId(),
    linha,
    destino,
    horario,
    instituicoes: [...instituicoes],
    coordenacao,
    ordem: i,
    criadoEm: agora(),
    atualizadoEm: agora(),
  }));

  const setores = [];
  const membros = [];
  DIRETORIA_INICIAL.forEach(([titulo, descricao, pessoas], i) => {
    const setor = { id: novoId(), titulo, descricao, ordem: i, criadoEm: agora(), atualizadoEm: agora() };
    setores.push(setor);
    pessoas.forEach(([nome, cargo], j) => {
      membros.push({
        id: novoId(),
        setorId: setor.id,
        nome,
        cargo,
        ordem: j,
        criadoEm: agora(),
        atualizadoEm: agora(),
      });
    });
  });

  const estatuto = {
    titulo: ESTATUTO_INICIAL.titulo,
    resumo: ESTATUTO_INICIAL.resumo,
    url: ESTATUTO_INICIAL.url,
    arquivo: null,
    topicos: ESTATUTO_INICIAL.topicos.map(([titulo, descricao], i) => ({
      id: novoId(),
      titulo,
      descricao,
      ordem: i,
    })),
    atualizadoEm: agora(),
  };

  return { linhas, setores, membros, estatuto };
}

function bancoNovo() {
  return { ...VAZIO, ...conteudoInicial(), criadoEm: agora() };
}

export function carregar() {
  garantirPastas();
  if (!fs.existsSync(CAMINHOS.banco)) {
    dados = bancoNovo();
    gravarSincrono();
    console.log("[AEUMA] banco criado em data/db.json");
    return dados;
  }
  try {
    dados = { ...VAZIO, ...JSON.parse(fs.readFileSync(CAMINHOS.banco, "utf8")) };
  } catch (erro) {
    throw new Error(`data/db.json está corrompido ou ilegível: ${erro.message}`);
  }
  // Bancos criados antes desta versão não têm as coleções de conteúdo.
  if (!dados.estatuto) {
    Object.assign(dados, conteudoInicial(), { versao: 2 });
    gravarSincrono();
    console.log("[AEUMA] banco atualizado: itinerários, diretoria e estatuto adicionados");
  }
  return dados;
}

export function db() {
  if (!dados) carregar();
  return dados;
}

function gravarSincrono() {
  const tmp = `${CAMINHOS.banco}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(dados, null, 2), "utf8");
  fs.renameSync(tmp, CAMINHOS.banco);
  gravadoEm = Date.now();
}

/** Grava o banco. As chamadas são enfileiradas para nunca escreverem em paralelo. */
export function salvar() {
  fila = fila.then(
    () =>
      new Promise((resolve, reject) => {
        const tmp = `${CAMINHOS.banco}.tmp`;
        fs.writeFile(tmp, JSON.stringify(dados, null, 2), "utf8", (erro) => {
          if (erro) return reject(erro);
          fs.rename(tmp, CAMINHOS.banco, (erro2) => {
            if (erro2) return reject(erro2);
            gravadoEm = Date.now();
            resolve();
          });
        });
      })
  );
  return fila;
}

/**
 * Recarrega o banco quando o arquivo é alterado por fora (ex.: `npm run criar-admin`
 * com o servidor no ar). Sem isto, a cópia em memória sobrescreveria a alteração.
 */
export function vigiarBanco() {
  let pendente = null;
  try {
    fs.watch(CAMINHOS.banco, () => {
      clearTimeout(pendente);
      pendente = setTimeout(() => {
        if (Date.now() - gravadoEm < 1500) return; // gravação nossa
        try {
          carregar();
          console.log("[AEUMA] db.json alterado por fora — banco recarregado");
        } catch (erro) {
          console.error("[AEUMA] falha ao recarregar db.json:", erro.message);
        }
      }, 300);
    });
  } catch {
    // fs.watch não é suportado em todo sistema de arquivos; seguir sem vigilância.
  }
}

// ----------------------------------------------------------------- usuários
export function acharUsuarioPorEmail(email) {
  return db().usuarios.find((u) => u.email === String(email || "").trim().toLowerCase());
}

export function acharUsuario(id) {
  return db().usuarios.find((u) => u.id === id);
}

// ------------------------------------------------------- listas e ordenação
export const colecao = (nome) => {
  const alvo = nome === "transparencia" ? "documentos" : nome;
  if (!Array.isArray(db()[alvo])) db()[alvo] = [];
  return db()[alvo];
};

export const achar = (nome, id) => colecao(nome).find((r) => r.id === id);

export const proximaOrdem = (lista) =>
  lista.reduce((maior, item) => Math.max(maior, item.ordem ?? 0), -1) + 1;

export const porOrdem = (lista) =>
  [...lista].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

/** Move um item uma posição para cima ou para baixo dentro da sua lista. */
export function mover(lista, id, direcao) {
  const ordenada = porOrdem(lista);
  const i = ordenada.findIndex((r) => r.id === id);
  if (i < 0) return false;
  const j = direcao === "cima" ? i - 1 : i + 1;
  if (j < 0 || j >= ordenada.length) return false;
  [ordenada[i], ordenada[j]] = [ordenada[j], ordenada[i]];
  ordenada.forEach((item, pos) => {
    item.ordem = pos;
    item.atualizadoEm = agora();
  });
  return true;
}

// -------------------------------------------------------------- documentos
/** Cálculos do mais recente para o mais antigo. */
export function calculosOrdenados() {
  return [...db().calculos].sort((a, b) => b.ano - a.ano || b.mes - a.mes);
}

/** Documentos agrupados pela ordem das categorias. */
export function documentosOrdenados() {
  const pos = Object.fromEntries(CATEGORIAS.map((c, i) => [c.chave, i]));
  return [...db().documentos].sort(
    (a, b) =>
      (pos[a.categoria] ?? 99) - (pos[b.categoria] ?? 99) ||
      (a.ordem ?? 0) - (b.ordem ?? 0) ||
      a.titulo.localeCompare(b.titulo, "pt-BR")
  );
}

// ------------------------------------------------------------------ arquivos
/** Remove do disco o arquivo associado a um registro, se houver. */
export function apagarArquivoDoDisco(tipo, arquivo) {
  if (!arquivo?.nomeArmazenado || !TIPOS[tipo]) return;
  const alvo = path.join(TIPOS[tipo].pasta, path.basename(arquivo.nomeArmazenado));
  fs.rm(alvo, { force: true }, () => {});
}

// ------------------------------------------------------------------ estatuto
export function estatuto() {
  const banco = db();
  if (!banco.estatuto) banco.estatuto = conteudoInicial().estatuto;
  if (!Array.isArray(banco.estatuto.topicos)) banco.estatuto.topicos = [];
  return banco.estatuto;
}
