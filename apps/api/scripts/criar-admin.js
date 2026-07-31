// Cria uma conta de administrador ou redefine a senha de uma já existente.
//
//   npm run criar-admin -- --email tesouraria@aeuma.com --nome "Tesouraria" --senha "senha-forte"
//   npm run criar-admin -- --email tesouraria@aeuma.com          (gera uma senha aleatória)
//   npm run criar-admin -- --listar
import crypto from "node:crypto";
import { carregar, db } from "../src/db.js";
import { acharUsuarioPorEmail, criarUsuario, trocarSenha } from "../src/auth.js";

function argumentos(argv) {
  const saida = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const chave = argv[i].slice(2);
    const valor = argv[i + 1];
    if (valor === undefined || valor.startsWith("--")) saida[chave] = true;
    else {
      saida[chave] = valor;
      i++;
    }
  }
  return saida;
}

const senhaAleatoria = () =>
  crypto.randomBytes(12).toString("base64url").replace(/[^A-Za-z0-9]/g, "").slice(0, 14) + "!";

const args = argumentos(process.argv.slice(2));
carregar();

if (args.listar) {
  const contas = db().usuarios;
  if (!contas.length) console.log("Nenhuma conta cadastrada.");
  for (const u of contas) {
    console.log(`- ${u.email}  (${u.nome} · ${u.papel} · criada em ${u.criadoEm.slice(0, 10)})`);
  }
  process.exit(0);
}

const email = String(args.email || "").trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("Informe o e-mail: npm run criar-admin -- --email admin@aeuma.com");
  process.exit(1);
}

const senha = args.senha === true || !args.senha ? senhaAleatoria() : String(args.senha);
if (senha.length < 10) {
  console.error("A senha precisa ter ao menos 10 caracteres.");
  process.exit(1);
}

const existente = acharUsuarioPorEmail(email);
if (existente) {
  await trocarSenha(existente, senha);
  console.log(`\n✓ Senha redefinida para ${email}\n  nova senha: ${senha}\n`);
} else {
  await criarUsuario({ nome: String(args.nome || "Administrador AEUMA"), email, senha });
  console.log(`\n✓ Conta criada\n  e-mail: ${email}\n  senha:  ${senha}\n`);
}
console.log("Entre em http://localhost:3000/admin/\n");
