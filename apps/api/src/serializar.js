// Formato dos registros exposto pela API (site público e painel).
import { MESES, rotuloCategoria } from "./catalogo.js";
import { colecao, porOrdem } from "./db.js";

function arquivoPublico(tipo, id, arquivo) {
  if (!arquivo) return null;
  return {
    nome: arquivo.nome,
    tamanho: arquivo.tamanho,
    enviadoEm: arquivo.enviadoEm,
    url: `/arquivos/${tipo}/${id}`,
    urlDownload: `/arquivos/${tipo}/${id}?download=1`,
  };
}

// ------------------------------------------------------------------ documentos
export const serializarDocumento = (d) => ({
  id: d.id,
  titulo: d.titulo,
  categoria: d.categoria,
  categoriaRotulo: rotuloCategoria(d.categoria),
  descricao: d.descricao || rotuloCategoria(d.categoria),
  atualizadoEm: d.atualizadoEm,
  arquivo: arquivoPublico("transparencia", d.id, d.arquivo),
});

export const serializarCalculo = (c) => ({
  id: c.id,
  ano: c.ano,
  mes: c.mes,
  mesNome: MESES[c.mes - 1],
  titulo: c.titulo || `Cálculo mensal — ${MESES[c.mes - 1]}/${c.ano}`,
  atualizadoEm: c.atualizadoEm,
  arquivo: arquivoPublico("calculos", c.id, c.arquivo),
});

export const serializar = (tipo, r) =>
  tipo === "calculos" ? serializarCalculo(r) : serializarDocumento(r);

// ------------------------------------------------------------------ conteúdo
export const serializarLinha = (l) => ({
  id: l.id,
  linha: l.linha,
  destino: l.destino,
  horario: l.horario || "",
  instituicoes: l.instituicoes || [],
  coordenacao: l.coordenacao || "",
  ordem: l.ordem ?? 0,
});

export const serializarMembro = (m) => ({
  id: m.id,
  setorId: m.setorId,
  nome: m.nome,
  cargo: m.cargo,
  ordem: m.ordem ?? 0,
});

export const serializarSetor = (s) => ({
  id: s.id,
  titulo: s.titulo,
  descricao: s.descricao || "",
  ordem: s.ordem ?? 0,
  membros: porOrdem(colecao("membros").filter((m) => m.setorId === s.id)).map(serializarMembro),
});

export const serializarTopico = (t) => ({
  id: t.id,
  titulo: t.titulo,
  descricao: t.descricao || "",
  ordem: t.ordem ?? 0,
});

export const serializarEstatuto = (e) => ({
  titulo: e.titulo || "Estatuto Social da AEUMA",
  resumo: e.resumo || "",
  url: e.url || "",
  arquivo: arquivoPublico("estatuto", "documento", e.arquivo),
  // O link que o site deve usar: o arquivo enviado tem prioridade sobre a URL externa.
  link: e.arquivo ? "/arquivos/estatuto/documento" : e.url || "",
  linkDownload: e.arquivo ? "/arquivos/estatuto/documento?download=1" : e.url || "",
  topicos: porOrdem(e.topicos || []).map(serializarTopico),
  atualizadoEm: e.atualizadoEm,
});
