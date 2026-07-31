// Endpoints abertos: alimentam as páginas públicas do site.
import { Router } from "express";
import { calculosOrdenados, colecao, documentosOrdenados, estatuto, porOrdem } from "../db.js";
import { CATEGORIAS } from "../catalogo.js";
import {
  serializarCalculo,
  serializarDocumento,
  serializarEstatuto,
  serializarLinha,
  serializarSetor,
} from "../serializar.js";

export const rotasPublicas = Router();

rotasPublicas.get("/categorias", (_req, res) => res.json({ categorias: CATEGORIAS }));

// ------------------------------------------------------------------ documentos
rotasPublicas.get("/documentos", (req, res) => {
  let itens = documentosOrdenados();
  const cat = String(req.query.categoria || "").trim();
  if (cat && cat !== "todos") itens = itens.filter((d) => d.categoria === cat);
  res.json({ total: itens.length, categorias: CATEGORIAS, documentos: itens.map(serializarDocumento) });
});

rotasPublicas.get("/calculos", (req, res) => {
  let itens = calculosOrdenados();
  const ano = Number(req.query.ano);
  if (Number.isInteger(ano)) itens = itens.filter((c) => c.ano === ano);
  const anos = [...new Set(calculosOrdenados().map((c) => c.ano))].sort((a, b) => b - a);
  res.json({ total: itens.length, anos, calculos: itens.map(serializarCalculo) });
});

// ----------------------------------------------------------------- itinerários
/** Nº de linhas distintas: 7A, 7B e 7C contam como uma só. */
const linhaBase = (codigo) => String(codigo).replace(/[A-Za-z]+$/, "") || String(codigo);

export function resumoItinerarios(linhas) {
  const porDestino = new Map();
  const instituicoes = new Set();
  for (const l of linhas) {
    porDestino.set(l.destino, (porDestino.get(l.destino) || 0) + 1);
    (l.instituicoes || []).forEach((i) => instituicoes.add(i));
  }
  return {
    destinos: [...porDestino.entries()]
      .map(([nome, saidas]) => ({ nome, saidas }))
      .sort((a, b) => b.saidas - a.saidas || a.nome.localeCompare(b.nome, "pt-BR")),
    instituicoes: [...instituicoes].sort((a, b) => a.localeCompare(b, "pt-BR")),
    totais: {
      linhas: new Set(linhas.map((l) => linhaBase(l.linha))).size,
      saidas: linhas.length,
      destinos: porDestino.size,
      instituicoes: instituicoes.size,
    },
  };
}

rotasPublicas.get("/itinerarios", (_req, res) => {
  const linhas = porOrdem(colecao("linhas"));
  res.json({ linhas: linhas.map(serializarLinha), ...resumoItinerarios(linhas) });
});

// -------------------------------------------------------------------- diretoria
rotasPublicas.get("/diretoria", (_req, res) => {
  const setores = porOrdem(colecao("setores")).map(serializarSetor);
  res.json({
    setores,
    total: setores.reduce((n, s) => n + s.membros.length, 0),
  });
});

// --------------------------------------------------------------------- estatuto
rotasPublicas.get("/estatuto", (_req, res) => res.json(serializarEstatuto(estatuto())));

// ----------------------------------------------------------------------- resumo
rotasPublicas.get("/resumo", (_req, res) => {
  const docs = documentosOrdenados();
  const calcs = calculosOrdenados();
  const linhas = colecao("linhas");
  res.json({
    documentos: { total: docs.length, comArquivo: docs.filter((d) => d.arquivo).length },
    calculos: { total: calcs.length, comArquivo: calcs.filter((c) => c.arquivo).length },
    anos: [...new Set(calcs.map((c) => c.ano))].sort((a, b) => b - a),
    itinerarios: resumoItinerarios(linhas).totais,
    diretoria: { setores: colecao("setores").length, membros: colecao("membros").length },
    estatuto: { topicos: estatuto().topicos.length, temArquivo: !!estatuto().arquivo },
  });
});
