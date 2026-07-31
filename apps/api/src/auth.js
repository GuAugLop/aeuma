// Autenticação do painel administrativo: senha com bcrypt, sessão em cookie assinado (JWT).
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { db, salvar, novoId, agora, acharUsuario, acharUsuarioPorEmail } from "./db.js";

const CUSTO = 12;

export const gerarHash = (senha) => bcrypt.hash(senha, CUSTO);
export const conferirSenha = (senha, hash) => bcrypt.compare(senha, hash);

export function assinarToken(usuario) {
  return jwt.sign({ sub: usuario.id, papel: usuario.papel }, config.segredo, {
    expiresIn: `${config.sessaoHoras}h`,
  });
}

export function porCookie(req) {
  const token = req.cookies?.[config.cookie];
  if (!token) return null;
  try {
    return jwt.verify(token, config.segredo);
  } catch {
    return null;
  }
}

export function definirCookie(res, token) {
  res.cookie(config.cookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.producao,
    maxAge: config.sessaoHoras * 60 * 60 * 1000,
    path: "/",
  });
}

export function limparCookie(res) {
  res.clearCookie(config.cookie, { path: "/" });
}

/** Exige sessão válida. Responde 401 quando não há. */
export function exigirAdmin(req, res, next) {
  const payload = porCookie(req);
  const usuario = payload && acharUsuario(payload.sub);
  if (!usuario) {
    limparCookie(res);
    return res.status(401).json({ erro: "Sessão expirada. Entre novamente." });
  }
  req.usuario = usuario;
  next();
}

export const publico = (u) => ({ id: u.id, nome: u.nome, email: u.email, papel: u.papel });

// --------------------------------------------------------- criação de contas
export async function criarUsuario({ nome, email, senha, papel = "admin" }) {
  const usuario = {
    id: novoId(),
    nome,
    email: String(email).trim().toLowerCase(),
    senhaHash: await gerarHash(senha),
    papel,
    criadoEm: agora(),
    atualizadoEm: agora(),
  };
  db().usuarios.push(usuario);
  await salvar();
  return usuario;
}

export async function trocarSenha(usuario, novaSenha) {
  usuario.senhaHash = await gerarHash(novaSenha);
  usuario.atualizadoEm = agora();
  usuario.senhaPadrao = false;
  await salvar();
}

/** Cria a conta de administrador na primeira execução, a partir do .env. */
export async function garantirAdminInicial() {
  if (db().usuarios.length > 0) return null;
  const { email, nome, senha } = config.admin;
  const usuario = await criarUsuario({ nome, email, senha });
  usuario.senhaPadrao = senha === "aeuma@2026";
  await salvar();
  console.log(
    "\n[AEUMA] conta de administrador criada:\n" +
      `        e-mail: ${email}\n` +
      `        senha:  ${senha}\n` +
      (usuario.senhaPadrao ? "        ⚠ senha padrão — troque no painel, em Conta.\n" : "")
  );
  return usuario;
}

// ------------------------------------------------------------- limite de tentativas
const tentativas = new Map();
const JANELA_MS = 15 * 60 * 1000;
const MAX = 8;

export function bloqueado(chave) {
  const reg = tentativas.get(chave);
  if (!reg) return 0;
  if (Date.now() - reg.desde > JANELA_MS) {
    tentativas.delete(chave);
    return 0;
  }
  return reg.n >= MAX ? Math.ceil((JANELA_MS - (Date.now() - reg.desde)) / 60000) : 0;
}

export function registrarFalha(chave) {
  const reg = tentativas.get(chave);
  if (!reg || Date.now() - reg.desde > JANELA_MS) tentativas.set(chave, { n: 1, desde: Date.now() });
  else reg.n += 1;
}

export const limparFalhas = (chave) => tentativas.delete(chave);

export { acharUsuarioPorEmail };
