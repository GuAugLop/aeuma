# -*- coding: utf-8 -*-
"""Design tokens + folha de estilo do novo sistema visual da AEUMA."""

CSS = r"""
/* =========================================================
   AEUMA — Sistema visual 2026
   Tokens, base, componentes, layout.
   ========================================================= */

:root{
  /* ---- Marca: Azul Institucional ---- */
  --navy-950:#04182B;
  --navy-900:#062A47;
  --navy-800:#083A5F;
  --navy-700:#0A4C7C;
  --blue-600:#0E63A0;   /* primária — texto/botões sobre branco */
  --blue-500:#1580C9;
  --blue-400:#3A9BE0;
  --blue-200:#B9D8F0;
  --blue-100:#DCEBF8;
  --blue-50:#F1F7FC;

  /* ---- Marca: Verde Percurso (acento) ---- */
  --teal-800:#055C45;
  --teal-700:#077054;   /* texto sobre branco e fundo de botão */
  --teal-600:#0B8F6B;
  --teal-500:#0FAE81;
  --teal-400:#2CC79A;
  --teal-100:#D8F5EB;

  /* ---- Sinalização ---- */
  --amber-700:#8A5B00;
  --amber-500:#E8A317;
  --amber-100:#FDF1D8;

  /* ---- Neutros ---- */
  --ink:#0B1B29;
  --ink-2:#3D5265;
  --ink-3:#5A6E80;
  --line:#E2E9F0;
  --line-2:#EEF3F8;
  --surface:#FFFFFF;
  --bg:#F6F9FC;

  /* ---- Forma ---- */
  --r-xs:8px; --r-sm:12px; --r-md:16px; --r-lg:24px; --r-xl:32px; --r-pill:999px;
  --sh-1:0 1px 2px rgba(11,27,41,.05);
  --sh-2:0 1px 2px rgba(11,27,41,.04), 0 10px 28px -14px rgba(11,27,41,.22);
  --sh-3:0 2px 4px rgba(11,27,41,.05), 0 24px 56px -22px rgba(11,27,41,.32);

  /* ---- Tipografia ---- */
  --font-display:'Plus Jakarta Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --font-text:'Inter',ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;

  --container:1200px;
}

*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{
  margin:0;background:var(--bg);color:var(--ink);
  font-family:var(--font-text);font-size:16px;line-height:1.65;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
}
img,svg{max-width:100%;display:block}
/* tamanho padrão de ícones inline (sobrescrito pelas regras específicas abaixo) */
svg:not([width]){width:20px;height:20px;flex:0 0 auto}
a{color:var(--blue-600);text-decoration:none}
a:hover{text-decoration:underline}
h1,h2,h3,h4{font-family:var(--font-display);color:var(--ink);margin:0;line-height:1.15;letter-spacing:-.02em;font-weight:800}
h1{font-size:clamp(2.1rem,1.2rem + 3.4vw,3.6rem)}
h2{font-size:clamp(1.6rem,1.1rem + 1.9vw,2.5rem)}
h3{font-size:clamp(1.12rem,1rem + .5vw,1.35rem);font-weight:700}
p{margin:0}
ul{margin:0;padding:0;list-style:none}
:focus-visible{outline:3px solid var(--blue-400);outline-offset:3px;border-radius:6px}

/* ---------- Layout ---------- */
.container{width:100%;max-width:var(--container);margin-inline:auto;padding-inline:24px}
.section{padding-block:clamp(56px,4vw + 32px,104px)}
.section--tight{padding-block:clamp(40px,3vw + 24px,72px)}
.stack>*+*{margin-top:var(--gap,16px)}
.grid{display:grid;gap:20px}
.g-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.g-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.g-4{grid-template-columns:repeat(4,minmax(0,1fr))}
@media(max-width:980px){.g-4{grid-template-columns:repeat(2,minmax(0,1fr))}.g-3{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.g-2,.g-3,.g-4{grid-template-columns:1fr}}
/* colunas assimétricas que colapsam em telas pequenas */
.split{display:grid;gap:clamp(28px,3vw,52px);align-items:center}
.split--60{grid-template-columns:1.1fr .9fr}
.split--65{grid-template-columns:1.35fr .65fr}
.split--45{grid-template-columns:.9fr 1.1fr}
.split--top{align-items:start}
@media(max-width:900px){.split--60,.split--65,.split--45{grid-template-columns:1fr}}

.skip{position:absolute;left:-9999px;top:0;background:var(--navy-900);color:#fff;padding:12px 18px;border-radius:0 0 var(--r-sm) 0;z-index:200}
.skip:focus{left:0}

/* ---------- Cabeçalho ---------- */
.header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.82);backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid var(--line)}
.header__in{display:flex;align-items:center;gap:20px;min-height:74px}
.brand{display:flex;align-items:center;gap:12px;text-decoration:none;flex:0 0 auto}
.brand:hover{text-decoration:none}
.brand__mark{width:42px;height:42px;flex:0 0 auto}
.brand__txt{display:flex;flex-direction:column;line-height:1.05}
.brand__name{font-family:var(--font-display);font-weight:800;font-size:1.32rem;letter-spacing:-.045em;color:var(--navy-900)}
.brand__sub{font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:600}
.nav{margin-left:auto;display:flex;align-items:center;gap:4px}
.nav a{padding:9px 13px;border-radius:var(--r-pill);color:var(--ink-2);font-weight:500;font-size:.94rem}
.nav a:hover{background:var(--blue-50);color:var(--navy-800);text-decoration:none}
.nav a[aria-current="page"]{background:var(--blue-100);color:var(--navy-800);font-weight:600}
.nav .btn{font-family:var(--font-display);font-weight:700;font-size:.85rem;padding:9px 16px}
.nav .btn--primary{color:#fff;background:var(--blue-600)}
.nav .btn--primary:hover{color:#fff;background:var(--navy-700);text-decoration:none}
.header .btn{margin-left:8px}
.burger{margin-left:auto;display:none;width:44px;height:44px;border:1px solid var(--line);background:#fff;border-radius:var(--r-sm);align-items:center;justify-content:center;cursor:pointer}
.burger span{display:block;width:18px;height:2px;background:var(--navy-800);border-radius:2px;position:relative}
.burger span::before,.burger span::after{content:"";position:absolute;left:0;width:18px;height:2px;background:var(--navy-800);border-radius:2px}
.burger span::before{top:-6px}.burger span::after{top:6px}
@media(max-width:1080px){
  .burger{display:flex}
  .nav{position:fixed;inset:74px 0 auto 0;flex-direction:column;align-items:stretch;gap:2px;background:#fff;border-bottom:1px solid var(--line);padding:14px 24px 22px;box-shadow:var(--sh-2);display:none}
  .nav.is-open{display:flex}
  .nav a{padding:13px 14px;border-radius:var(--r-sm);font-size:1rem}
  .header .btn{margin:8px 0 0}
}

/* ---------- Botões ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:12px 20px;border-radius:var(--r-pill);
  font-family:var(--font-display);font-weight:700;font-size:.94rem;letter-spacing:-.01em;border:1px solid transparent;cursor:pointer;
  transition:transform .16s ease,box-shadow .16s ease,background .16s ease,color .16s ease;text-decoration:none;white-space:nowrap}
.btn:hover{text-decoration:none;transform:translateY(-1px)}
.btn svg{width:18px;height:18px;flex:0 0 auto}
.btn--primary{background:var(--blue-600);color:#fff;box-shadow:0 8px 20px -10px rgba(14,99,160,.8)}
.btn--primary:hover{background:var(--navy-700);color:#fff}
.btn--teal{background:var(--teal-700);color:#fff;box-shadow:0 8px 20px -10px rgba(7,112,84,.9)}
.btn--teal:hover{background:var(--teal-800);color:#fff}
.btn--dark{background:var(--navy-900);color:#fff}
.btn--dark:hover{background:var(--navy-950);color:#fff}
.btn--ghost{background:#fff;color:var(--navy-800);border-color:var(--line)}
.btn--ghost:hover{border-color:var(--blue-200);background:var(--blue-50);color:var(--navy-900)}
.btn--onblue{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.34)}
.btn--onblue:hover{background:rgba(255,255,255,.2);color:#fff}
.btn--sm{padding:8px 15px;font-size:.85rem}
.btn--lg{padding:15px 26px;font-size:1rem}

/* ---------- Blocos de conteúdo ---------- */
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-display);font-weight:700;
  font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--teal-700)}
.eyebrow::before{content:"";width:22px;height:2px;background:var(--teal-500);border-radius:2px}
.lead{color:var(--ink-2);font-size:1.06rem;max-width:64ch}
.muted{color:var(--ink-3)}
.section-head{max-width:70ch;margin-bottom:36px}
.section-head .eyebrow{margin-bottom:14px}
.section-head h2{margin-bottom:14px}

.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-md);padding:24px;box-shadow:var(--sh-1);
  transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
.card--link:hover{transform:translateY(-3px);box-shadow:var(--sh-2);border-color:var(--blue-200);text-decoration:none}
.card__icon{width:46px;height:46px;border-radius:var(--r-sm);display:grid;place-items:center;background:var(--blue-50);color:var(--blue-600);margin-bottom:16px}
.card__icon svg{width:23px;height:23px}
.card__icon--teal{background:var(--teal-100);color:var(--teal-700)}
.card__icon--amber{background:var(--amber-100);color:var(--amber-700)}
.card h3{margin-bottom:8px}
.card p{color:var(--ink-2);font-size:.95rem}
.card__more{display:inline-flex;align-items:center;gap:6px;margin-top:16px;font-weight:600;font-size:.9rem;color:var(--blue-600);font-family:var(--font-display);white-space:nowrap}
.card__more svg{width:17px;height:17px;transition:transform .18s ease}
.card--link:hover .card__more svg{transform:translateX(3px)}

.chip{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:var(--r-pill);
  background:var(--blue-50);color:var(--navy-800);font-size:.78rem;font-weight:600;border:1px solid var(--blue-100)}
.chip--teal{background:var(--teal-100);color:var(--teal-700);border-color:#B9EBD9}
.chip--amber{background:var(--amber-100);color:var(--amber-700);border-color:#F6DFAE}
.chip--plain{background:var(--line-2);color:var(--ink-2);border-color:var(--line)}
.chips{display:flex;flex-wrap:wrap;gap:7px}

/* ---------- Hero ---------- */
.hero{position:relative;overflow:hidden;background:
   radial-gradient(1100px 520px at 88% -12%, rgba(15,174,129,.20), transparent 62%),
   radial-gradient(900px 480px at 8% 4%, rgba(58,155,224,.24), transparent 60%),
   linear-gradient(168deg,var(--navy-950) 0%,var(--navy-800) 52%,var(--navy-700) 100%);
  color:#fff}
.hero::after{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);
  background-size:64px 64px;mask-image:radial-gradient(120% 90% at 50% 0%,#000 25%,transparent 78%)}
.hero__in{position:relative;z-index:2;display:grid;grid-template-columns:1.12fr .88fr;gap:56px;align-items:center;
  padding-block:clamp(56px,5vw + 32px,104px)}
.hero h1{color:#fff;font-size:clamp(1.95rem,1.2rem + 2.3vw,2.95rem)}
.hero h1 em{font-style:normal;color:var(--teal-400)}
.hero__lead{color:#C6DAEA;font-size:1.1rem;max-width:52ch;margin-top:20px}
.hero__cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.hero__badge{display:inline-flex;align-items:center;gap:9px;padding:6px 14px 6px 8px;border-radius:var(--r-pill);
  background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.18);font-size:.82rem;color:#DCEBF8;font-weight:500;margin-bottom:22px}
.hero__badge b{background:var(--teal-500);color:var(--navy-950);padding:2px 9px;border-radius:var(--r-pill);font-size:.72rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
@media(max-width:900px){.hero__in{grid-template-columns:1fr;gap:36px}}

.hero__panel{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);border-radius:var(--r-lg);padding:22px;backdrop-filter:blur(8px)}
.hero__panel h2{color:#fff;font-size:1.05rem;font-weight:700;letter-spacing:-.01em;display:flex;align-items:center;gap:9px}
.hero__panel h2 svg{width:21px;height:21px;flex:0 0 auto;color:var(--teal-400)}

/* faixa de números */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--r-md);overflow:hidden}
.stat{background:#fff;padding:22px}
.stat__n{font-family:var(--font-display);font-weight:800;font-size:2rem;letter-spacing:-.04em;color:var(--navy-800);line-height:1}
.stat__l{font-size:.84rem;color:var(--ink-3);margin-top:6px;font-weight:500}
@media(max-width:760px){.stats{grid-template-columns:repeat(2,1fr)}}

/* ---------- Linhas / itinerários ---------- */
.toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:26px}
.field{position:relative;flex:1 1 280px;min-width:220px}
.field svg{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:var(--ink-3)}
.input{width:100%;padding:12px 16px 12px 42px;border:1px solid var(--line);border-radius:var(--r-pill);background:#fff;
  font:inherit;font-size:.95rem;color:var(--ink)}
.input::placeholder{color:var(--ink-3)}
.input:focus{outline:none;border-color:var(--blue-400);box-shadow:0 0 0 4px var(--blue-50)}
.filters{display:flex;flex-wrap:wrap;gap:8px}
.filter{padding:9px 16px;border-radius:var(--r-pill);border:1px solid var(--line);background:#fff;color:var(--ink-2);
  font-family:var(--font-display);font-weight:600;font-size:.86rem;cursor:pointer;transition:.15s}
.filter:hover{border-color:var(--blue-200);color:var(--navy-800)}
.filter[aria-pressed="true"]{background:var(--navy-800);border-color:var(--navy-800);color:#fff}

.line{background:#fff;border:1px solid var(--line);border-radius:var(--r-md);padding:22px;display:flex;flex-direction:column;
  box-shadow:var(--sh-1);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
.line:hover{transform:translateY(-3px);box-shadow:var(--sh-2);border-color:var(--blue-200)}
.line__top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}
.line__badge{display:grid;place-items:center;min-width:56px;height:56px;padding:0 10px;border-radius:var(--r-sm);
  background:linear-gradient(150deg,var(--navy-800),var(--blue-600));color:#fff;
  font-family:var(--font-display);font-weight:800;font-size:1.28rem;letter-spacing:-.04em;box-shadow:var(--sh-1)}
.line__time{text-align:right}
.line__time b{display:block;font-family:var(--font-display);font-size:1.28rem;font-weight:800;letter-spacing:-.03em;color:var(--navy-800)}
.line__time span{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:600}
.line__dest{display:flex;align-items:center;gap:8px;font-family:var(--font-display);font-weight:700;font-size:1.08rem;color:var(--ink);margin-bottom:4px}
.line__dest svg{width:17px;height:17px;color:var(--teal-600);flex:0 0 auto}
.line__label{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:700;margin:16px 0 8px}
.line__foot{margin-top:auto;padding-top:16px;border-top:1px solid var(--line-2);font-size:.88rem;color:var(--ink-2);display:flex;gap:8px;align-items:center}
.line__foot svg{width:16px;height:16px;color:var(--ink-3);flex:0 0 auto}
.is-hidden{display:none !important}

/* ---------- Documentos / tabelas ---------- */
.doc{display:flex;align-items:center;gap:16px;padding:16px 20px;background:#fff;border:1px solid var(--line);
  border-radius:var(--r-sm);transition:.16s}
.doc+.doc{margin-top:10px}
.doc:hover{border-color:var(--blue-200);box-shadow:var(--sh-2);transform:translateY(-1px)}
.doc__ico{width:42px;height:42px;flex:0 0 auto;border-radius:10px;display:grid;place-items:center;background:var(--blue-50);color:var(--blue-600)}
.doc__ico svg{width:20px;height:20px}
.doc__body{min-width:0;flex:1}
.doc__title{display:block;font-family:var(--font-display);font-weight:700;font-size:.98rem;color:var(--ink);letter-spacing:-.01em;line-height:1.35}
.doc__meta{display:block;font-size:.82rem;color:var(--ink-3);margin-top:2px}
a.doc:hover{text-decoration:none}
.doc__actions{display:flex;gap:8px;flex:0 0 auto}
@media(max-width:640px){.doc{flex-wrap:wrap}.doc__actions{width:100%}.doc__actions .btn{flex:1}}

.tablewrap{background:#fff;border:1px solid var(--line);border-radius:var(--r-md);overflow:hidden;box-shadow:var(--sh-1)}
table{width:100%;border-collapse:collapse}
thead th{background:var(--blue-50);text-align:left;font-family:var(--font-display);font-size:.76rem;letter-spacing:.1em;
  text-transform:uppercase;color:var(--navy-800);padding:14px 20px;font-weight:700;border-bottom:1px solid var(--line)}
tbody td{padding:14px 20px;border-bottom:1px solid var(--line-2);font-size:.95rem;color:var(--ink-2);vertical-align:middle}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--blue-50)}
td.t-strong{font-family:var(--font-display);font-weight:700;color:var(--ink)}
td.t-actions{text-align:right;white-space:nowrap}
@media(max-width:640px){
  thead{display:none}
  tbody tr{display:block;border-bottom:1px solid var(--line);padding:12px 4px}
  tbody td{display:flex;justify-content:space-between;gap:16px;border:0;padding:7px 16px}
  tbody td::before{content:attr(data-l);font-weight:700;color:var(--ink-3);font-size:.76rem;letter-spacing:.08em;text-transform:uppercase}
  td.t-actions{justify-content:flex-start}
}

/* ---------- Pessoas ---------- */
.person{background:#fff;border:1px solid var(--line);border-radius:var(--r-md);padding:22px;text-align:center;box-shadow:var(--sh-1);transition:.18s}
.person:hover{transform:translateY(-3px);box-shadow:var(--sh-2);border-color:var(--blue-200)}
.avatar{width:66px;height:66px;margin:0 auto 14px;border-radius:var(--r-pill);display:grid;place-items:center;
  background:linear-gradient(150deg,var(--navy-800),var(--blue-600));color:#fff;
  font-family:var(--font-display);font-weight:800;font-size:1.25rem;letter-spacing:-.02em}
.avatar--teal{background:linear-gradient(150deg,var(--teal-800),var(--teal-600))}
.person__name{font-family:var(--font-display);font-weight:700;font-size:1rem;color:var(--ink);letter-spacing:-.01em}
.person__role{font-size:.85rem;color:var(--teal-700);font-weight:600;margin-top:4px}

/* ---------- Faixas ---------- */
.band{background:linear-gradient(150deg,var(--navy-900),var(--navy-700));color:#fff;border-radius:var(--r-lg);padding:clamp(30px,3vw + 18px,54px);position:relative;overflow:hidden}
.band::after{content:"";position:absolute;right:-90px;top:-90px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(15,174,129,.35),transparent 68%)}
.band h2,.band h3{color:#fff;position:relative;z-index:1}
.band p{color:#C6DAEA;position:relative;z-index:1}
.band .btn{position:relative;z-index:1}

.note{display:flex;gap:12px;padding:16px 18px;background:var(--amber-100);border:1px solid #F6DFAE;border-radius:var(--r-sm);
  color:var(--amber-700);font-size:.9rem}
.note svg{width:19px;height:19px;flex:0 0 auto;margin-top:2px}
.note--blue{background:var(--blue-50);border-color:var(--blue-100);color:var(--navy-800)}

.pagehead{background:linear-gradient(168deg,var(--navy-950),var(--navy-800) 70%,var(--navy-700));color:#fff;position:relative;overflow:hidden}
.pagehead::after{content:"";position:absolute;inset:0;
  background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
  background-size:56px 56px;mask-image:radial-gradient(110% 100% at 30% 0%,#000 20%,transparent 75%)}
.pagehead__in{position:relative;z-index:1;padding-block:clamp(40px,3.4vw + 24px,72px);max-width:74ch}
.pagehead h1{color:#fff}
.pagehead p{color:#C6DAEA;margin-top:16px;font-size:1.05rem}
.crumbs{display:flex;gap:8px;align-items:center;font-size:.84rem;color:#9FBDD6;margin-bottom:18px}
.crumbs a{color:#C6DAEA}
.crumbs span{opacity:.55}

/* ---------- Rodapé ---------- */
.footer{background:var(--navy-950);color:#A9C2D6;padding-block:56px 28px;margin-top:0}
.footer__grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1.2fr;gap:40px}
@media(max-width:900px){.footer__grid{grid-template-columns:1fr 1fr;gap:32px}}
@media(max-width:560px){.footer__grid{grid-template-columns:1fr}}
.footer h4{font-family:var(--font-display);color:#fff;font-size:.78rem;letter-spacing:.13em;text-transform:uppercase;margin-bottom:16px;font-weight:700}
.footer a{color:#A9C2D6;font-size:.93rem}
.footer a:hover{color:#fff}
.footer li+li{margin-top:9px}
.footer__brand .brand__name{color:#fff}
.footer__brand .brand__sub{color:#7B9AB4}
.footer__desc{font-size:.92rem;margin-top:16px;max-width:38ch;color:#8FAAC2}
.social{display:flex;gap:10px;margin-top:18px}
.social a{width:42px;height:42px;border-radius:var(--r-pill);display:grid;place-items:center;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:#fff}
.social a:hover{background:var(--teal-600);border-color:var(--teal-600)}
.social svg{width:19px;height:19px}
.footer__bar{margin-top:44px;padding-top:22px;border-top:1px solid rgba(255,255,255,.1);display:flex;flex-wrap:wrap;gap:12px;
  justify-content:space-between;font-size:.85rem;color:#7B9AB4}

/* ---------- Utilidades ---------- */
.center{text-align:center}
.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.mt-8{margin-top:8px}.mt-16{margin-top:16px}.mt-24{margin-top:24px}.mt-32{margin-top:32px}.mt-40{margin-top:40px}
.mb-24{margin-bottom:24px}
.row{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.bg-white{background:#fff}
.divider{height:1px;background:var(--line);border:0;margin:0}
@media (prefers-reduced-motion:reduce){*{animation:none !important;transition:none !important;scroll-behavior:auto !important}}
@media print{.header,.footer,.btn,.toolbar{display:none !important}body{background:#fff}}
"""
