import { Router } from "express";
import { config } from "../config.js";
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

  // Em produção o cookie sai como "Secure": o navegador o descarta se a conexão for HTTP.
  // O sintoma é a senha ser aceita e a tela de login voltar — sem nenhum erro visível.
  if (config.producao && !req.secure) {
    console.warn(
      "\n[AEUMA] ATENÇÃO: login por HTTP com NODE_ENV=production.\n" +
        "        O cookie de sessão é Secure e o navegador vai descartá-lo — ninguém consegue entrar.\n" +
        "        Instale o HTTPS, ou use NODE_ENV=development enquanto testa pelo IP.\n"
    );
  }

  res.json({
    usuario: publico(usuario),
    senhaPadrao: !!usuario.senhaPadrao,
    // o painel usa isto para explicar o problema em vez de só voltar para o login
    avisoHttp: config.producao && !req.secure,
  });
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
