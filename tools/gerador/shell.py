# -*- coding: utf-8 -*-
"""Estrutura comum: marca, <head>, cabeçalho, rodapé e ícones."""

from theme import CSS

WA = "https://api.whatsapp.com/send?phone=5515997836204"
IG = "https://www.instagram.com/aeuma.angatuba/"
MAIL = "mailto:aeumarequerimento@gmail.com"
# O PDF do estatuto agora é definido no painel (aba Estatuto) e servido pela API.

# ================================================================== MARCA
# O símbolo é o capelo da logo da AEUMA, redesenhado em formas cheias para
# sobreviver a 16 px. O diploma que acompanha o capelo na arte original entra
# só nas assinaturas grandes (vertical e monocromática), onde há espaço.

FONTE_LOGO = "Cinzel, Georgia, 'Times New Roman', serif"
FONTE_APOIO = "Inter, 'Segoe UI', sans-serif"

# --- capelo, em duas escalas (dentro de uma caixa 48×48) --------------------
CAPELO = '''<g transform="translate(0 1.2)">
  <path d="M15.4 20.5v8.6c0 2.6 3.9 4 8.6 4s8.6-1.4 8.6-4v-8.6Z" fill="#BFDCF3"/>
  <path d="M24 11 40.6 18.2 24 25.4 7.4 18.2Z" fill="#fff"/>
  <path d="M24 18.2h13.6v8.4" fill="none" stroke="#2CC79A" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M37.6 26.2c1.5 0 2.7 1.2 2.7 2.7l-.5 3.4a2.2 2.2 0 0 1-4.4 0l-.5-3.4c0-1.5 1.2-2.7 2.7-2.7Z" fill="#2CC79A"/>
  <circle cx="24" cy="18.2" r="2" fill="#2CC79A"/>
</g>'''

# versão para fundo claro sem caixa (traços escuros)
CAPELO_ESCURO = (CAPELO.replace('fill="#BFDCF3"', 'fill="#B9D8F0"')
                       .replace('fill="#fff"', 'fill="#0E63A0"')
                       .replace('stroke="#2CC79A"', 'stroke="#077054"')
                       .replace('fill="#2CC79A"', 'fill="#077054"'))


def gradiente(idp):
    """Diagonal em objectBoundingBox: acompanha qualquer escala do símbolo."""
    return (f'<linearGradient id="{idp}g" x1="0" y1="0" x2="1" y2="1">'
            f'<stop stop-color="#083A5F"/><stop offset="1" stop-color="#1580C9"/></linearGradient>')


def mark(size=42, idp="m"):
    """Símbolo AEUMA: capelo sobre a caixa azul institucional."""
    return f'''<svg class="brand__mark" width="{size}" height="{size}" style="width:{size}px;height:{size}px;flex:0 0 auto" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
  <defs>{gradiente(idp)}</defs>
  <rect width="48" height="48" rx="13" fill="url(#{idp}g)"/>
  {CAPELO}
</svg>'''


FAVICON_SVG = mark(48, "f").replace('class="brand__mark" ', "")

# --- assinatura horizontal --------------------------------------------------
def _lockup_horizontal(cor_nome, cor_sub):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="330" height="64" viewBox="0 0 330 64" fill="none">
  <defs>{gradiente("lh")}</defs>
  <rect x="4" y="8" width="48" height="48" rx="13" fill="url(#lhg)"/>
  <g transform="translate(4 8)">{CAPELO}</g>
  <text x="68" y="33" font-family="{FONTE_LOGO}" font-size="25" font-weight="700"
        letter-spacing="2.6" fill="{cor_nome}">AEUMA</text>
  <text x="69" y="47" font-family="{FONTE_APOIO}" font-size="8" font-weight="600"
        letter-spacing="1.7" fill="{cor_sub}">ESTUDANTES UNIVERSITÁRIOS · ANGATUBA/SP</text>
</svg>'''


LOGO_FULL_SVG = _lockup_horizontal("#062A47", "#5A6E80")
LOGO_WHITE_SVG = _lockup_horizontal("#FFFFFF", "#9FBDD6")

# --- assinatura vertical (a mais próxima da arte original) ------------------
LOGO_VERTICAL_SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" width="360" height="300" viewBox="0 0 360 300" fill="none">
  <defs>{gradiente("lv")}</defs>
  <rect x="132" y="10" width="96" height="96" rx="26" fill="url(#lvg)"/>
  <!-- o capelo é desenhado numa caixa 48×48; o dobro cobre exatamente o quadrado acima -->
  <g transform="translate(132 10) scale(2)">{CAPELO}</g>
  <text x="180" y="168" text-anchor="middle" font-family="{FONTE_LOGO}" font-size="46" font-weight="700"
        letter-spacing="5" fill="#062A47">AEUMA</text>
  <line x1="150" y1="184" x2="210" y2="184" stroke="#B9D8F0" stroke-width="1.4"/>
  <text x="180" y="204" text-anchor="middle" font-family="{FONTE_APOIO}" font-size="10.5" font-weight="600"
        letter-spacing="1.6" fill="#5A6E80">ASSOCIAÇÃO DOS ESTUDANTES UNIVERSITÁRIOS</text>
  <text x="180" y="222" text-anchor="middle" font-family="{FONTE_APOIO}" font-size="10.5" font-weight="600"
        letter-spacing="1.6" fill="#5A6E80">DO MUNICÍPIO DE ANGATUBA</text>
  <text x="180" y="262" text-anchor="middle" font-family="{FONTE_APOIO}" font-size="15" font-weight="700"
        letter-spacing="1.2" fill="#0E63A0">19.823.447/0001-99</text>
</svg>'''

# --- versão monocromática: capelo + diploma, traço, como na arte original ---
SIMBOLO_MONO_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none">
  <g stroke="#0B1B29" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M60 16 105 36 60 56 15 36Z"/>
    <path d="M33 44v20c0 7 12 11 27 11s27-4 27-11V44"/>
    <path d="M60 36h36v22"/>
    <path d="M96 58c4 0 7 3 7 7l-1.6 9a5.4 5.4 0 0 1-10.8 0L89 65c0-4 3-7 7-7Z" fill="#0B1B29"/>
    <circle cx="60" cy="36" r="5" fill="#0B1B29"/>
    <rect x="18" y="86" width="84" height="22" rx="11"/>
    <ellipse cx="90" cy="97" rx="6" ry="11"/>
    <circle cx="90" cy="97" r="2.6"/>
    <path d="M46 83v28"/><path d="M56 83v28"/>
  </g>
</svg>'''

# --- ícones de aplicativo (as duas versões da arte original) ----------------
ICONE_CLARO_SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 48 48" fill="none">
  <rect width="48" height="48" rx="13" fill="#FFFFFF" stroke="#E2E9F0"/>
  {CAPELO_ESCURO}
</svg>'''

ICONE_ESCURO_SVG = f'''<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 48 48" fill="none">
  <circle cx="24" cy="24" r="24" fill="#062A47"/>
  {CAPELO}
</svg>'''

# ---------------------------------------------------------------- ÍCONES
I = {
"route":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h5a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5"/></svg>',
"pin":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
"clock":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
"shield":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
"file":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/></svg>',
"calc":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></svg>',
"users":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
"book":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h13v18H6.5A2.5 2.5 0 0 0 4 19.5Z"/><path d="M6.5 17H19"/></svg>',
"search":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
"down":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/></svg>',
"eye":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
"arrow":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13"/><path d="m12 5 7 7-7 7"/></svg>',
"wa":'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.1-.7.1c-.2.3-.8 1-1 1.2-.2.2-.4.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5s0-.4 0-.5c0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2m0 18.2c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2"/></svg>',
"ig":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
"mail":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
"alert":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.2v.01"/></svg>',
"lock":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
"spark":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>',
"bus":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11"/><path d="M4 11h16"/><path d="M4 17h16"/><circle cx="7.5" cy="19.5" r="1.5"/><circle cx="16.5" cy="19.5" r="1.5"/></svg>',
"cap":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m2 8 10-4 10 4-10 4Z"/><path d="M6 10v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>',
}

NAV = [
    ("/", "Início"),
    ("/itinerarios", "Itinerários"),
    ("/diretoria", "Diretoria"),
    ("/calculos-mensais", "Cálculos Mensais"),
    ("/transparencia", "Transparência"),
    ("/estatuto", "Estatuto"),
]

FULL_NAME = "Associação dos Estudantes Universitários do Município de Angatuba — SP"


FONTES_GOOGLE = ("https://fonts.googleapis.com/css2"
                 "?family=Cinzel:wght@600;700"
                 "&family=Plus+Jakarta+Sans:wght@600;700;800"
                 "&family=Inter:wght@400;500;600;700&display=swap")

# Marcação de favicon/ícones compartilhada pelo site e pelo painel.
ICONES_HEAD = '''<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">'''


def head(title, desc, current):
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#062A47">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:image" content="/assets/og-aeuma.png">
{ICONES_HEAD}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTES_GOOGLE}" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<a class="skip" href="#main">Pular para o conteúdo</a>
'''


def header(current):
    parts = []
    for h, t in NAV:
        cur = ' aria-current="page"' if h == current else ""
        parts.append('<a href="%s"%s>%s</a>' % (h, cur, t))
    links = "".join(parts)
    return f'''<header class="header">
  <div class="container header__in">
    <a class="brand" href="/" aria-label="AEUMA — página inicial">
      {mark(42,"h")}
      <span class="brand__txt">
        <span class="brand__name">AEUMA</span>
        <span class="brand__sub">Angatuba · SP</span>
      </span>
    </a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="nav-main" aria-label="Abrir menu"><span></span></button>
    <nav class="nav" id="nav-main" aria-label="Navegação principal">
      {links}
      <a class="btn btn--primary btn--sm" href="{WA}" target="_blank" rel="noopener">{I["wa"]}Falar com a AEUMA</a>
    </nav>
  </div>
</header>
'''


def footer():
    navlinks = "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)
    return f'''<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__brand">
        <a class="brand" href="/">
          {mark(42,"fo")}
          <span class="brand__txt"><span class="brand__name">AEUMA</span><span class="brand__sub">Angatuba · SP</span></span>
        </a>
        <p class="footer__desc">{FULL_NAME}. Transporte universitário organizado por estudantes, para estudantes.</p>
        <div class="social">
          <a href="{WA}" aria-label="WhatsApp da AEUMA" rel="noopener" target="_blank">{I["wa"]}</a>
          <a href="{IG}" aria-label="Instagram da AEUMA" rel="noopener" target="_blank">{I["ig"]}</a>
          <a href="{MAIL}" aria-label="E-mail da AEUMA">{I["mail"]}</a>
        </div>
      </div>
      <div>
        <h4>Navegação</h4>
        <ul>{navlinks}</ul>
      </div>
      <div>
        <h4>Estudante</h4>
        <ul>
          <li><a href="/itinerarios">Consultar minha linha</a></li>
          <li><a href="/calculos-mensais">Cálculo do mês</a></li>
          <li><a href="/transparencia">Prestações de contas</a></li>
          <li><a href="{WA}" rel="noopener" target="_blank">Falar com a AEUMA</a></li>
        </ul>
      </div>
      <div>
        <h4>Contato</h4>
        <ul>
          <li><a href="{WA}" rel="noopener" target="_blank">(15) 99783-6204</a></li>
          <li><a href="{MAIL}">aeumarequerimento@gmail.com</a></li>
          <li><a href="{IG}" rel="noopener" target="_blank">@aeuma.angatuba</a></li>
          <li class="muted" style="color:#7B9AB4">Angatuba, São Paulo</li>
        </ul>
      </div>
    </div>
    <div class="footer__bar">
      <span>© 2026 AEUMA — Associação dos Estudantes Universitários do Município de Angatuba/SP</span>
      <span>CNPJ 19.823.447/0001-99 · <a href="/identidade">Identidade visual</a> · <a href="/admin/">Administração</a></span>
    </div>
  </div>
</footer>
''' + BURGER_JS


BURGER_JS = """<script>
(function(){
  var b=document.querySelector('.burger'), n=document.getElementById('nav-main');
  if(b&&n){
    b.addEventListener('click',function(){
      var open=n.classList.toggle('is-open');
      b.setAttribute('aria-expanded',open?'true':'false');
      b.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    });
  }
})();
</script>
</body>
</html>"""
