import { Router } from "express";
import {
  acharUsuarioPorEmail,
  assinarToken,
  bloqueado,
  conferirSenha,
  definirCookie,
  exigirAdmin,
  limparCookie,
  limparFalhas,
  publico,
  registrarFalha,
  trocarSenha,
} from "../auth.js";

export const rotasAuth = Router();

rotasAuth.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const senha = String(req.body?.senha || "");
  const chave = `${req.ip}|${email}`;

  const minutos = bloqueado(chave);
  if (minutos) {
    return res.status(429).json({ erro: `Muitas tentativas. Tente de novo em ${minutos} min.` });
  }
  if (!email || !senha) {
    return res.status(400).json({ erro: "Informe e-mail e senha." });
  }

  const usuario = acharUsuarioPorEmail(email);
  const ok = usuario ? await conferirSenha(senha, usuario.senhaHash) : false;
  if (!ok) {
    registrarFalha(chave);
    return res.status(401).json({ erro: "E-mail ou senha incorretos." });
  }

  limparFalhas(chave);
  definirCookie(res, assinarToken(usuario));
  res.json({ usuario: publico(usuario), senhaPadrao: !!usuario.senhaPadrao });
});

rotasAuth.post("/logout", (_req, res) => {
  limparCookie(res);
  res.json({ ok: true });
});

rotasAuth.get("/eu", exigirAdmin, (req, res) => {
  res.json({ usuario: publico(req.usuario), senhaPadrao: !!req.usuario.senhaPadrao });
});

rotasAuth.patch("/senha", exigirAdmin, async (req, res) => {
  const atual = String(req.body?.atual || "");
  const nova = String(req.body?.nova || "");

  if (nova.length < 10) {
    return res.status(400).json({ erro: "A nova senha precisa ter ao menos 10 caracteres." });
  }
  if (!(await conferirSenha(atual, req.usuario.senhaHash))) {
    return res.status(401).json({ erro: "Senha atual incorreta." });
  }
  await trocarSenha(req.usuario, nova);
  res.json({ ok: true });
});
