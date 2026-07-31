// Entrega dos arquivos enviados pelo painel. A URL usa o id do registro, então o
// nome real no disco (aleatório) nunca aparece e não há caminho manipulável pelo cliente.
import path from "node:path";
import { Router } from "express";
import { TIPOS } from "../config.js";
import { achar, estatuto } from "../db.js";

export const rotasArquivos = Router();

/** O estatuto é registro único: /arquivos/estatuto/documento */
function localizar(tipo, id) {
  if (tipo === "estatuto") {
    const doc = estatuto();
    return doc.arquivo ? { arquivo: doc.arquivo, titulo: doc.titulo } : null;
  }
  return achar(tipo, id);
}

rotasArquivos.get("/:tipo/:id", (req, res) => {
  const tipo = TIPOS[req.params.tipo];
  if (!tipo) return res.status(404).send("Seção inválida.");

  const registro = localizar(req.params.tipo, req.params.id);
  if (!registro?.arquivo) return res.status(404).send("Arquivo não publicado.");

  const nomeDisco = path.basename(registro.arquivo.nomeArmazenado);
  const baixar = req.query.download !== undefined;
  const nomeAmigavel = registro.arquivo.nome || `${registro.titulo}${path.extname(nomeDisco)}`;

  res.sendFile(
    nomeDisco,
    {
      root: tipo.pasta,
      dotfiles: "deny",
      headers: {
        "Content-Disposition": `${baixar ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(
          nomeAmigavel
        )}`,
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    },
    (erro) => {
      if (erro && !res.headersSent) res.status(404).send("Arquivo não encontrado no servidor.");
    }
  );
});
