// Conteúdo institucional editável pelo painel: itinerários, diretoria e estatuto.
import fs from "node:fs";
import { Router } from "express";
import {
  achar,
  agora,
  apagarArquivoDoDisco,
  colecao,
  estatuto,
  mover,
  novoId,
  porOrdem,
  proximaOrdem,
  salvar,
} from "../db.js";
import {
  serializarEstatuto,
  serializarLinha,
  serializarSetor,
  serializarTopico,
} from "../serializar.js";
import { descreverArquivo, destinoFixo, receberArquivo } from "../upload.js";

export const rotasConteudo = Router();

// ------------------------------------------------------------------ validação
class Invalido extends Error {}

function texto(valor, campo, { min = 1, max = 160, obrigatorio = true, padrao = "" } = {}) {
  const s = String(valor ?? padrao).trim();
  if (!s) {
    if (obrigatorio) throw new Invalido(`Informe ${campo}.`);
    return "";
  }
  if (s.length < min) throw new Invalido(`${campo} precisa ter ao menos ${min} caracteres.`);
  if (s.length > max) throw new Invalido(`${campo} pode ter no máximo ${max} caracteres.`);
  return s;
}

/** Aceita array ou texto separado por vírgula. */
function lista(valor) {
  const itens = Array.isArray(valor) ? valor : String(valor ?? "").split(",");
  return [...new Set(itens.map((i) => String(i).trim()).filter(Boolean))].slice(0, 30);
}

function tratar(res, fn) {
  try {
    return fn();
  } catch (erro) {
    if (erro instanceof Invalido) {
      res.status(400).json({ erro: erro.message });
      return null;
    }
    throw erro;
  }
}

// --------------------------------------------------------------- itinerários
const camposLinha = (corpo, atual) => ({
  linha: texto(corpo.linha ?? atual?.linha, "o número da linha", { max: 12 }),
  destino: texto(corpo.destino ?? atual?.destino, "a cidade de destino", { max: 60 }),
  horario: texto(corpo.horario ?? atual?.horario, "o horário", { obrigatorio: false, max: 20 }),
  instituicoes: lista(corpo.instituicoes ?? atual?.instituicoes),
  coordenacao: texto(corpo.coordenacao ?? atual?.coordenacao, "a coordenação", {
    obrigatorio: false,
    max: 120,
  }),
});

rotasConteudo.get("/linhas", (_req, res) => {
  res.json({ itens: porOrdem(colecao("linhas")).map(serializarLinha) });
});

rotasConteudo.post("/linhas", async (req, res) => {
  const campos = tratar(res, () => camposLinha(req.body || {}, null));
  if (!campos) return;
  const registro = {
    id: novoId(),
    ...campos,
    ordem: proximaOrdem(colecao("linhas")),
    criadoEm: agora(),
    atualizadoEm: agora(),
  };
  colecao("linhas").push(registro);
  await salvar();
  res.status(201).json({ item: serializarLinha(registro) });
});

rotasConteudo.patch("/linhas/:id", async (req, res) => {
  const registro = achar("linhas", req.params.id);
  if (!registro) return res.status(404).json({ erro: "Linha não encontrada." });
  const campos = tratar(res, () => camposLinha(req.body || {}, registro));
  if (!campos) return;
  Object.assign(registro, campos, { atualizadoEm: agora() });
  await salvar();
  res.json({ item: serializarLinha(registro) });
});

rotasConteudo.post("/linhas/:id/mover", async (req, res) => {
  if (!mover(colecao("linhas"), req.params.id, req.body?.direcao)) {
    return res.status(400).json({ erro: "Não foi possível mover a linha." });
  }
  await salvar();
  res.json({ itens: porOrdem(colecao("linhas")).map(serializarLinha) });
});

rotasConteudo.delete("/linhas/:id", async (req, res) => {
  const lista_ = colecao("linhas");
  const i = lista_.findIndex((r) => r.id === req.params.id);
  if (i < 0) return res.status(404).json({ erro: "Linha não encontrada." });
  lista_.splice(i, 1);
  await salvar();
  res.json({ ok: true, id: req.params.id });
});

// ----------------------------------------------------------------- diretoria
rotasConteudo.get("/diretoria", (_req, res) => {
  res.json({ setores: porOrdem(colecao("setores")).map(serializarSetor) });
});

const camposSetor = (corpo, atual) => ({
  titulo: texto(corpo.titulo ?? atual?.titulo, "o nome do setor", { min: 2, max: 80 }),
  descricao: texto(corpo.descricao ?? atual?.descricao, "a descrição", {
    obrigatorio: false,
    max: 220,
  }),
});

rotasConteudo.post("/setores", async (req, res) => {
  const campos = tratar(res, () => camposSetor(req.body || {}, null));
  if (!campos) return;
  const setor = {
    id: novoId(),
    ...campos,
    ordem: proximaOrdem(colecao("setores")),
    criadoEm: agora(),
    atualizadoEm: agora(),
  };
  colecao("setores").push(setor);
  await salvar();
  res.status(201).json({ item: serializarSetor(setor) });
});

rotasConteudo.patch("/setores/:id", async (req, res) => {
  const setor = achar("setores", req.params.id);
  if (!setor) return res.status(404).json({ erro: "Setor não encontrado." });
  const campos = tratar(res, () => camposSetor(req.body || {}, setor));
  if (!campos) return;
  Object.assign(setor, campos, { atualizadoEm: agora() });
  await salvar();
  res.json({ item: serializarSetor(setor) });
});

rotasConteudo.post("/setores/:id/mover", async (req, res) => {
  if (!mover(colecao("setores"), req.params.id, req.body?.direcao)) {
    return res.status(400).json({ erro: "Não foi possível mover o setor." });
  }
  await salvar();
  res.json({ setores: porOrdem(colecao("setores")).map(serializarSetor) });
});

rotasConteudo.delete("/setores/:id", async (req, res) => {
  const setores = colecao("setores");
  const i = setores.findIndex((s) => s.id === req.params.id);
  if (i < 0) return res.status(404).json({ erro: "Setor não encontrado." });

  const membros = colecao("membros");
  const restantes = membros.filter((m) => m.setorId !== req.params.id);
  const removidos = membros.length - restantes.length;
  membros.length = 0;
  membros.push(...restantes);
  setores.splice(i, 1);
  await salvar();
  res.json({ ok: true, id: req.params.id, membrosRemovidos: removidos });
});

// ------------------------------------------------------------------- membros
const camposMembro = (corpo, atual) => {
  const setorId = String(corpo.setorId ?? atual?.setorId ?? "").trim();
  if (!achar("setores", setorId)) throw new Invalido("Escolha um setor válido.");
  return {
    setorId,
    nome: texto(corpo.nome ?? atual?.nome, "o nome", { min: 2, max: 120 }),
    cargo: texto(corpo.cargo ?? atual?.cargo, "o cargo", { min: 2, max: 80 }),
  };
};

const doSetor = (setorId) => colecao("membros").filter((m) => m.setorId === setorId);

rotasConteudo.post("/membros", async (req, res) => {
  const campos = tratar(res, () => camposMembro(req.body || {}, null));
  if (!campos) return;
  const membro = {
    id: novoId(),
    ...campos,
    ordem: proximaOrdem(doSetor(campos.setorId)),
    criadoEm: agora(),
    atualizadoEm: agora(),
  };
  colecao("membros").push(membro);
  await salvar();
  res.status(201).json({ item: serializarSetor(achar("setores", campos.setorId)) });
});

rotasConteudo.patch("/membros/:id", async (req, res) => {
  const membro = achar("membros", req.params.id);
  if (!membro) return res.status(404).json({ erro: "Membro não encontrado." });
  const campos = tratar(res, () => camposMembro(req.body || {}, membro));
  if (!campos) return;
  if (campos.setorId !== membro.setorId) campos.ordem = proximaOrdem(doSetor(campos.setorId));
  Object.assign(membro, campos, { atualizadoEm: agora() });
  await salvar();
  res.json({ item: serializarSetor(achar("setores", membro.setorId)) });
});

rotasConteudo.post("/membros/:id/mover", async (req, res) => {
  const membro = achar("membros", req.params.id);
  if (!membro) return res.status(404).json({ erro: "Membro não encontrado." });
  if (!mover(doSetor(membro.setorId), req.params.id, req.body?.direcao)) {
    return res.status(400).json({ erro: "Não foi possível mover o membro." });
  }
  await salvar();
  res.json({ item: serializarSetor(achar("setores", membro.setorId)) });
});

rotasConteudo.delete("/membros/:id", async (req, res) => {
  const membros = colecao("membros");
  const i = membros.findIndex((m) => m.id === req.params.id);
  if (i < 0) return res.status(404).json({ erro: "Membro não encontrado." });
  const [removido] = membros.splice(i, 1);
  await salvar();
  res.json({ ok: true, item: serializarSetor(achar("setores", removido.setorId)) });
});

// ------------------------------------------------------------------ estatuto
rotasConteudo.get("/estatuto", (_req, res) => res.json({ estatuto: serializarEstatuto(estatuto()) }));

rotasConteudo.patch("/estatuto", async (req, res) => {
  const doc = estatuto();
  const campos = tratar(res, () => {
    const url = texto(req.body?.url ?? doc.url, "o endereço do PDF", {
      obrigatorio: false,
      max: 400,
    });
    if (url && !/^https?:\/\//i.test(url)) {
      throw new Invalido("O endereço do PDF precisa começar com http:// ou https://");
    }
    return {
      titulo: texto(req.body?.titulo ?? doc.titulo, "o título", { min: 3, max: 120 }),
      resumo: texto(req.body?.resumo ?? doc.resumo, "o resumo", { obrigatorio: false, max: 400 }),
      url,
    };
  });
  if (!campos) return;
  Object.assign(doc, campos, { atualizadoEm: agora() });
  await salvar();
  res.json({ estatuto: serializarEstatuto(doc) });
});

rotasConteudo.post(
  "/estatuto/arquivo",
  destinoFixo("estatuto"),
  receberArquivo(true),
  async (req, res) => {
    const doc = estatuto();
    const anterior = doc.arquivo;
    doc.arquivo = descreverArquivo(req.file);
    doc.atualizadoEm = agora();
    await salvar();
    apagarArquivoDoDisco("estatuto", anterior);
    res.json({ estatuto: serializarEstatuto(doc) });
  }
);

rotasConteudo.delete("/estatuto/arquivo", async (_req, res) => {
  const doc = estatuto();
  if (!doc.arquivo) return res.status(400).json({ erro: "Não há arquivo publicado." });
  const anterior = doc.arquivo;
  doc.arquivo = null;
  doc.atualizadoEm = agora();
  await salvar();
  apagarArquivoDoDisco("estatuto", anterior);
  res.json({ estatuto: serializarEstatuto(doc) });
});

// ------------------------------------------------------- tópicos do estatuto
const camposTopico = (corpo, atual) => ({
  titulo: texto(corpo.titulo ?? atual?.titulo, "o título do capítulo", { min: 2, max: 120 }),
  descricao: texto(corpo.descricao ?? atual?.descricao, "a descrição", {
    obrigatorio: false,
    max: 400,
  }),
});

rotasConteudo.post("/estatuto/topicos", async (req, res) => {
  const campos = tratar(res, () => camposTopico(req.body || {}, null));
  if (!campos) return;
  const doc = estatuto();
  doc.topicos.push({ id: novoId(), ...campos, ordem: proximaOrdem(doc.topicos) });
  doc.atualizadoEm = agora();
  await salvar();
  res.status(201).json({ estatuto: serializarEstatuto(doc) });
});

rotasConteudo.patch("/estatuto/topicos/:id", async (req, res) => {
  const doc = estatuto();
  const topico = doc.topicos.find((t) => t.id === req.params.id);
  if (!topico) return res.status(404).json({ erro: "Capítulo não encontrado." });
  const campos = tratar(res, () => camposTopico(req.body || {}, topico));
  if (!campos) return;
  Object.assign(topico, campos);
  doc.atualizadoEm = agora();
  await salvar();
  res.json({ estatuto: serializarEstatuto(doc) });
});

rotasConteudo.post("/estatuto/topicos/:id/mover", async (req, res) => {
  const doc = estatuto();
  if (!mover(doc.topicos, req.params.id, req.body?.direcao)) {
    return res.status(400).json({ erro: "Não foi possível mover o capítulo." });
  }
  doc.atualizadoEm = agora();
  await salvar();
  res.json({ estatuto: serializarEstatuto(doc) });
});

rotasConteudo.delete("/estatuto/topicos/:id", async (req, res) => {
  const doc = estatuto();
  const i = doc.topicos.findIndex((t) => t.id === req.params.id);
  if (i < 0) return res.status(404).json({ erro: "Capítulo não encontrado." });
  doc.topicos.splice(i, 1);
  doc.atualizadoEm = agora();
  await salvar();
  res.json({ estatuto: serializarEstatuto(doc) });
});

// Evita deixar arquivo órfão quando algo falha depois do upload.
rotasConteudo.use((erro, req, res, next) => {
  if (req.file?.path) fs.rm(req.file.path, { force: true }, () => {});
  next(erro);
});
