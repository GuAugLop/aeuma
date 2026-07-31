# AEUMA — Rebranding 2026

Monorepo da **Associação dos Estudantes Universitários do Município de Angatuba — SP**:
site institucional, painel administrativo e API, no mesmo repositório e servidos pelo
mesmo processo.

---

## Começando

Requisitos: **Node 20+** (testado no 22) e **Python 3** apenas para regerar o HTML do site.

```bash
npm install
npm start
```

| Endereço | O que é |
|---|---|
| http://localhost:3000/ | Site público |
| http://localhost:3000/admin/ | Painel administrativo |
| http://localhost:3000/api/publico/resumo | API pública |

As URLs do site não têm extensão: `/itinerarios`, `/diretoria`, `/calculos-mensais`,
`/transparencia`, `/estatuto`, `/identidade`. Os endereços antigos (`/itinerarios.html`) e as
variantes com barra no fim (`/itinerarios/`) respondem com **301** para a versão limpa, então
links e buscadores que apontam para o formato anterior continuam funcionando.

Na primeira execução o servidor cria `data/db.json` (com o catálogo de documentos já
existente no site) e a conta de administrador, imprimindo as credenciais no terminal:

```
e-mail: admin@aeuma.com
senha:  aeuma@2026     ← troque no painel, aba Conta
```

---

## Estrutura

```
aeuma-rebranding/
├─ apps/
│  ├─ api/          Servidor Express: autenticação, upload e catálogo
│  ├─ admin/        Painel administrativo (HTML + CSS + JS, sem framework)
│  └─ site/         Site institucional (HTML gerado)
├─ tools/gerador/   Scripts Python que geram o HTML do site
├─ data/
│  ├─ db.json       Banco (JSON) — contas, documentos e cálculos
│  └─ uploads/      Os arquivos enviados pelo painel
│     ├─ calculos/
│     └─ transparencia/
├─ .env.example     Copie para .env antes de publicar
└─ package.json     Workspaces npm
```

### Comandos

| Comando | O que faz |
|---|---|
| `npm start` | Sobe o servidor (site + painel + API) |
| `npm run dev` | Igual, com reinício automático a cada alteração |
| `npm run gerar-site` | Regera o HTML de `apps/site/` a partir de `tools/gerador/` |
| `npm run gerar-icones` | Regera os PNG da marca (favicon, ícones de app, imagem social) |
| `npm run criar-admin -- --email x@y.com --nome "Nome"` | Cria uma conta (senha aleatória impressa) |
| `npm run criar-admin -- --email x@y.com --senha "..."` | Cria com senha definida, ou redefine a de quem já existe |
| `npm run criar-admin -- --listar` | Lista as contas cadastradas |
| `npm run zerar -- --tudo` | Esvazia todas as seções (mantém as contas) |
| `npm run zerar -- --itinerarios --diretoria` | Esvazia só as seções indicadas |

O `criar-admin` pode rodar com o servidor no ar: o servidor percebe a alteração em
`db.json` e recarrega sozinho.

---

## Painel administrativo

`http://localhost:3000/admin/` — seis abas. Todo o conteúdo do site é editável por aqui.

**Cálculos Mensais.** Formulário com mês, ano, título opcional e o arquivo. Abaixo, a lista
com filtro por ano e busca. Cada item mostra se está **Publicado** ou **Sem arquivo**, e
permite ver, baixar, substituir o arquivo, tirar do ar (mantendo o registro), editar os
dados ou excluir de vez.

**Transparência.** Mesma lógica, com título, categoria (prestações de contas, contratos,
termos e planos de trabalho, atas, normas internas) e descrição opcional.

**Itinerários.** Cadastro das linhas: número, cidade de destino, horário, instituições
atendidas (separadas por vírgula) e coordenação. A ordem da lista é a ordem do site e se
ajusta pelas setas ↑ ↓. Os destinos, os filtros e os quatro números da página inicial
(linhas, saídas, cidades, instituições) são calculados a partir daqui — linhas com sufixo
de letra (7A, 7B, 7C) contam como uma linha só.

**Diretoria.** Setores (Diretoria Executiva, Tesouraria, Conselho Fiscal…) com descrição e
integrantes. Cada setor vira um bloco na página, e cada integrante tem nome e cargo. Setores
e pessoas podem ser reordenados; excluir um setor remove também os seus integrantes.

**Estatuto.** Título, resumo, o PDF (enviado pelo painel ou apontado por um endereço externo)
e os capítulos que aparecem como cartões na página. Se houver arquivo enviado, ele tem
prioridade sobre o endereço externo.

**Conta.** Dados do usuário e troca de senha (mínimo de 10 caracteres).

O envio aceita arrastar e soltar. Formatos: PDF, DOC(X), XLS(X), CSV, PNG e JPG, até 25 MB
por arquivo (ajustável em `UPLOAD_MAX_MB`).

Tudo o que é publicado aparece **imediatamente** no site — as páginas carregam os dados pela
API. Cálculos e documentos sem arquivo aparecem com a marcação "Em breve", em vez do botão
de download.

### Estado inicial

**Cálculos Mensais e Transparência começam vazios.** Nada é publicado sem que alguém envie
o arquivo pelo painel.

**Itinerários, Diretoria e Estatuto já nascem com o conteúdo que estava no ar** (17 saídas,
5 setores com 11 integrantes e 6 capítulos), para o site não abrir em branco. Para zerar
também estes:

```bash
npm run zerar -- --itinerarios --diretoria --estatuto
```

---

## API

Sessão por cookie `httpOnly` assinado (JWT, 8 h). Senhas com bcrypt (custo 12).

### Público (sem autenticação)

| Método | Rota | Retorno |
|---|---|---|
| GET | `/api/publico/documentos` | Documentos da transparência (aceita `?categoria=`) |
| GET | `/api/publico/calculos` | Cálculos mensais (aceita `?ano=`) |
| GET | `/api/publico/itinerarios` | Linhas, destinos, instituições e totais |
| GET | `/api/publico/diretoria` | Setores com os seus integrantes |
| GET | `/api/publico/estatuto` | Título, resumo, link do PDF e capítulos |
| GET | `/api/publico/categorias` | Categorias disponíveis |
| GET | `/api/publico/resumo` | Contagens gerais |
| GET | `/arquivos/:tipo/:id` | Abre o arquivo (`?download=1` para baixar) |

`:tipo` é `calculos`, `transparencia` ou `estatuto`. A URL usa o **id do registro** — o nome
real no disco é aleatório e nunca é exposto.

### Autenticação

| Método | Rota |
|---|---|
| POST | `/api/auth/login` — `{ email, senha }` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/eu` |
| PATCH | `/api/auth/senha` — `{ atual, nova }` |

Oito tentativas erradas por IP + e-mail bloqueiam o login por 15 minutos.

### Administração (exige sessão)

| Método | Rota | O que faz |
|---|---|---|
**Documentos** (`:tipo` = `calculos` ou `transparencia`)

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/admin/resumo` | Painel de números |
| GET | `/api/admin/:tipo` | Lista completa |
| POST | `/api/admin/:tipo` | Cria o registro (multipart, com ou sem arquivo) |
| PATCH | `/api/admin/:tipo/:id` | Edita os dados (JSON) |
| POST | `/api/admin/:tipo/:id/arquivo` | Envia ou substitui o arquivo (multipart, campo `arquivo`) |
| DELETE | `/api/admin/:tipo/:id/arquivo` | Tira o arquivo do ar, mantendo o registro |
| DELETE | `/api/admin/:tipo/:id` | Exclui registro e arquivo |

**Conteúdo institucional**

| Método | Rota | O que faz |
|---|---|---|
| GET · POST | `/api/admin/linhas` | Lista e cadastra linhas |
| PATCH · DELETE | `/api/admin/linhas/:id` | Edita e exclui |
| POST | `/api/admin/linhas/:id/mover` | `{ direcao: "cima" \| "baixo" }` |
| GET | `/api/admin/diretoria` | Setores com integrantes |
| POST | `/api/admin/setores` · `/api/admin/membros` | Cria setor / integrante |
| PATCH · DELETE | `/api/admin/setores/:id` · `/api/admin/membros/:id` | Edita e exclui |
| POST | `…/:id/mover` | Reordena setores e integrantes |
| GET · PATCH | `/api/admin/estatuto` | Título, resumo e endereço do PDF |
| POST · DELETE | `/api/admin/estatuto/arquivo` | Envia e remove o PDF |
| POST | `/api/admin/estatuto/topicos` | Cria capítulo |
| PATCH · DELETE | `/api/admin/estatuto/topicos/:id` | Edita e exclui |
| POST | `/api/admin/estatuto/topicos/:id/mover` | Reordena |

---

## Antes de publicar em produção

O passo a passo completo da VPS (Node, systemd, nginx, HTTPS e backup) está em
**[IMPLANTACAO.md](IMPLANTACAO.md)**. Em resumo:

1. `cp .env.example .env` e preencha:
   - **`JWT_SEGREDO`** — obrigatório; sem ele o servidor não sobe com `NODE_ENV=production`.
     Gere com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
   - `ADMIN_EMAIL` / `ADMIN_SENHA` — usados só na criação da primeira conta.
2. `NODE_ENV=production` — passa a exigir HTTPS no cookie de sessão.
3. Sirva atrás de HTTPS (nginx ou Caddy como proxy reverso para a porta 3000), com
   `client_max_body_size` maior que o `UPLOAD_MAX_MB`.
4. Faça backup de `data/` — é onde estão o banco e todos os arquivos.
5. Troque a senha padrão do administrador no primeiro acesso.

---

## O que mudou nesta versão

**Área do estudante removida.** A página `entrar.html` deixou de existir; o botão saiu do
cabeçalho e do rodapé. `/entrar.html` redireciona para a home, para não quebrar links
antigos. No lugar, o cabeçalho traz o contato pelo WhatsApp.

**Painel administrativo e API.** O conteúdo deixou de ser HTML fixo: documentos, linhas,
diretoria e estatuto são cadastrados pelo painel, guardados em `data/` e lidos pela API.

**Monorepo.** Site, painel, API e gerador passaram a conviver no mesmo repositório, com
workspaces npm e um único comando para subir tudo.

**URLs sem `.html`.** `/itinerarios` no lugar de `/itinerarios.html`, com 301 dos endereços
antigos. O HTML continua sendo gerado como `itinerarios.html` em `apps/site/` — quem faz a
tradução é o servidor.

**Marca nova.** O símbolo passou a ser o capelo da logo da AEUMA (antes era um "A" desenhado
como trajeto), com favicon, ícones de aplicativo, manifesto e imagem de compartilhamento.

> Consequência: **Início, Itinerários, Diretoria, Cálculos Mensais, Transparência e
> Estatuto** agora dependem do servidor — carregam os dados pela API. Só `/identidade`
> continua sendo HTML puro. Quando a API não responde, cada página mostra um aviso no lugar
> da lista, em vez de ficar em branco.

---

## Regerar o site

O HTML de `apps/site/` é gerado pelos scripts em `tools/gerador/`:

```bash
npm run gerar-site
```

| Arquivo | Conteúdo |
|---|---|
| `theme.py` | Tokens de cor, tipografia e toda a folha de estilo |
| `shell.py` | Marca (todos os SVG), `<head>`, cabeçalho, rodapé e ícones |
| `icones.py` | Rasteriza os PNG da marca a partir dos SVG de `shell.py` |
| `jsutil.py` | Trechos de JavaScript compartilhados pelas páginas que leem a API |
| `data.py` | Só as categorias da transparência (o resto migrou para o banco) |
| `pages_a.py` | Início, Itinerários, Diretoria |
| `pages_b.py` | Cálculos Mensais, Transparência, Estatuto, Identidade |

Textos fixos (títulos das páginas, chamadas, avisos) continuam no gerador — mexer neles pede
`npm run gerar-site`. Já os **dados** (linhas, pessoas, documentos, capítulos) vivem no banco
e mudam pelo painel, sem regerar nada.

As categorias da transparência aparecem em dois lugares e precisam continuar iguais:
`tools/gerador/data.py` (botões de filtro) e `apps/api/src/catalogo.js` (validação da API).

---

## Identidade visual

**Marca.** O símbolo é o **capelo** da logo histórica da AEUMA, redesenhado em formas cheias
(no lugar do traço fino) para continuar legível a 16 px, no ícone da aba. A borla em verde é o
único acento de cor. O **diploma**, que acompanha o capelo na arte original, aparece nas
assinaturas grandes e na versão monocromática — em tamanho de favicon ele vira ruído.

O logotipo "AEUMA" usa **Cinzel**, serifa inscricional próxima da usada na arte original.

Arquivos em `apps/site/assets/`:

| Arquivo | Uso |
|---|---|
| `simbolo-aeuma.svg` · `favicon.svg` | Símbolo isolado (mesmo desenho) |
| `logo-aeuma.svg` · `logo-aeuma-branco.svg` | Assinatura horizontal, fundo claro e escuro |
| `logo-aeuma-vertical.svg` | Assinatura vertical com nome por extenso e CNPJ |
| `simbolo-aeuma-mono.svg` | Capelo + diploma em traço preto, para impressos |
| `icone-app-claro.svg` · `icone-app-escuro.svg` | Perfis de redes e aplicativos |
| `favicon-16/32/48.png`, `apple-touch-icon.png`, `icone-192/512.png` | Favicon e ícones de app |
| `og-aeuma.png` | Prévia ao compartilhar links (1200×630) |

Os PNG são gerados a partir dos SVG com o Chrome em modo headless — rode só quando a marca
mudar:

```bash
npm run gerar-icones
```

**Cores.** Azul institucional (`#0E63A0` primária, `#062A47` escuro) + verde percurso
(`#077054` / `#0FAE81`) + âmbar para avisos. Todas as combinações de texto usadas passam no
critério **AA da WCAG**.

**Tipografia.** Cinzel (só o logotipo) + Plus Jakarta Sans (títulos) + Inter (texto), com
fallback do sistema.

**Acessibilidade.** Link "pular para o conteúdo", `aria-current` na navegação, `aria-pressed`
nos filtros, `aria-live` nos contadores, foco visível, respeito a `prefers-reduced-motion`
e folha de impressão. Responsivo testado em 390px, 768px, 1024px e 1440px.

A página `identidade.html` documenta o sistema completo.

---

## Conteúdo a conferir no painel

- Linhas 7A, 7B, 7C, 8 e 13 estão com a coordenação como "A confirmar" — atualize na aba
  Itinerários assim que os nomes forem definidos.
- Os horários estão rotulados como "Horário", com ressalva de que são referência.
- O período de mandato da diretoria não consta no site atual — vale acrescentar na descrição
  de cada setor.
- O estatuto ainda aponta para o PDF hospedado em `aeuma.com`. Envie o arquivo pela aba
  Estatuto para o documento passar a ser servido pelo próprio site.

---

© 2026 AEUMA — CNPJ 19.823.447/0001-99
