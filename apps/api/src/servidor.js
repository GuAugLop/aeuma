// Servidor único do monorepo: serve o site público, o painel administrativo,
// os arquivos enviados e a API.
import express from "express";
import cookieParser from "cookie-parser";
import { CAMINHOS, config } from "./config.js";
import { carregar, vigiarBanco } from "./db.js";
import { garantirAdminInicial } from "./auth.js";
import { rotasAuth } from "./rotas/auth.js";
import { rotasPublicas } from "./rotas/publico.js";
import { rotasAdmin } from "./rotas/admin.js";
import { rotasArquivos } from "./rotas/arquivos.js";

carregar();
await garantirAdminInicial();
vigiarBanco();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "same-origin");
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

// ------------------------------------------------------------------------ API
app.use("/api/auth", rotasAuth);
app.use("/api/publico", rotasPublicas);
app.use("/api/admin", rotasAdmin);
app.get("/api/saude", (_req, res) => res.json({ ok: true, versao: 1 }));
app.use("/api", (_req, res) => res.status(404).json({ erro: "Endpoint não encontrado." }));

// -------------------------------------------------------------------- arquivos
app.use("/arquivos", rotasArquivos);

// --------------------------------------------------------------- painel e site
// URLs limpas: "/itinerarios" em vez de "/itinerarios.html". Quem chegar pelo
// endereço antigo é redirecionado (301) para a versão sem extensão.
app.get("/entrar.html", (_req, res) => res.redirect(301, "/")); // área do estudante desativada

const comQuery = (req, destino) => destino + req.url.slice(req.path.length);

app.get(/\.html$/i, (req, res) => {
  let destino = req.path.slice(0, -".html".length);
  if (destino.endsWith("/index")) destino = destino.slice(0, -"index".length) || "/";
  res.redirect(301, comQuery(req, destino));
});

// Barra no fim: /itinerarios/ → /itinerarios. O painel é a exceção, mora em /admin/.
app.get(/.+\/$/, (req, res, next) => {
  if (req.path === "/admin/") return next();
  res.redirect(301, comQuery(req, req.path.replace(/\/+$/, "")));
});
// Comparação exata: uma rota app.get("/admin") casaria também com "/admin/" e faria laço.
app.use((req, res, next) =>
  req.path === "/admin" ? res.redirect(301, comQuery(req, "/admin/")) : next()
);

const estaticoLimpo = {
  extensions: ["html"], // /itinerarios → itinerarios.html
  index: "index.html",
  redirect: false,
};
app.use("/admin", express.static(CAMINHOS.admin, estaticoLimpo));
app.use(express.static(CAMINHOS.site, estaticoLimpo));

app.use((_req, res) => res.status(404).sendFile("index.html", { root: CAMINHOS.site }));

// ------------------------------------------------------------------ erro geral
app.use((erro, _req, res, _next) => {
  console.error("[AEUMA]", erro);
  if (res.headersSent) return;
  res.status(500).json({ erro: "Erro interno. Tente novamente." });
});

const servidor = app.listen(config.porta, () => {
  console.log(
    `\n[AEUMA] modo      → ${config.producao ? "production" : "development"}` +
      (config.producao
        ? " (cookie de sessão só trafega por HTTPS)"
        : " (cookie de sessão aceita HTTP — não use assim em produção)")
  );
  console.log(`[AEUMA] site      → http://localhost:${config.porta}/`);
  console.log(`[AEUMA] painel    → http://localhost:${config.porta}/admin/`);
  console.log(`[AEUMA] api       → http://localhost:${config.porta}/api/publico/resumo`);
  console.log(`[AEUMA] arquivos  → ${CAMINHOS.uploads}\n`);
});

servidor.on("error", (erro) => {
  if (erro.code === "EADDRINUSE") {
    console.error(
      `\n[AEUMA] a porta ${config.porta} já está em uso.\n` +
        "        Feche o outro servidor ou defina outra porta no .env (PORTA=3001).\n"
    );
    process.exit(1);
  }
  throw erro;
});
