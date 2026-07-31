# -*- coding: utf-8 -*-
"""Transparência, Cálculos Mensais, Estatuto e Identidade.

As listas de Transparência e Cálculos Mensais são carregadas em tempo de execução
pela API (apps/api) — é o painel administrativo que publica os arquivos.
"""

import json

from shell import I, WA, IG, MAIL, mark, FULL_NAME
from data import CATEGORIAS
from pages_a import pagehead
from jsutil import icones_js, abrir_script, FECHA_SCRIPT

JS_TRANSPARENCIA = abrir_script() + r"""
  var busca=document.getElementById('busca'),
      lista=document.getElementById('lista'),
      contador=document.getElementById('contador'),
      vazio=document.getElementById('vazio'),
      falha=document.getElementById('falha'),
      filtros=Array.prototype.slice.call(document.querySelectorAll('.filter')),
      cat='todos', dados=[];

  function cartao(d){
    var acoes = d.arquivo
      ? '<a class="btn btn--ghost btn--sm" href="'+d.arquivo.url+'" target="_blank" rel="noopener">'+ICO.eye+'Visualizar</a>'+
        '<a class="btn btn--primary btn--sm" href="'+d.arquivo.urlDownload+'">'+ICO.down+'Baixar</a>'
      : '<span class="chip chip--amber">Arquivo em breve</span>';
    var meta = escHtml(d.descricao||d.categoriaRotulo);
    if(d.arquivo){ meta += ' · ' + escHtml((d.arquivo.nome.split('.').pop()||'').toUpperCase()); }
    return '<div class="doc">'+
      '<span class="doc__ico">'+ICO.file+'</span>'+
      '<span class="doc__body">'+
        '<span class="doc__title">'+escHtml(d.titulo)+'</span>'+
        '<span class="doc__meta">'+meta+'</span>'+
      '</span>'+
      '<span class="doc__actions">'+acoes+'</span>'+
    '</div>';
  }

  function aplicar(){
    var termo=norm(busca.value.trim());
    var itens=dados.filter(function(d){
      var okCat = cat==='todos' || d.categoria===cat;
      var okBusca = !termo || norm(d.titulo+' '+d.categoriaRotulo+' '+(d.descricao||'')).indexOf(termo)>-1;
      return okCat && okBusca;
    });
    lista.innerHTML=itens.map(cartao).join('');
    contador.textContent=itens.length+(itens.length===1?' documento encontrado.':' documentos encontrados.');
    vazio.textContent=dados.length
      ? 'Nenhum documento encontrado com esse termo.'
      : 'Nenhum documento publicado ainda.';
    vazio.classList.toggle('is-hidden',itens.length>0);
  }

  busca.addEventListener('input',aplicar);
  filtros.forEach(function(b){b.addEventListener('click',function(){
    filtros.forEach(function(o){o.setAttribute('aria-pressed','false');});
    b.setAttribute('aria-pressed','true'); cat=b.dataset.c; aplicar();
  });});

  buscarApi('/api/publico/documentos').then(function(j){
    dados=j.documentos||[]; aplicar();
  }).catch(function(){
    contador.textContent=''; mostrarFalha();
  });
""" + FECHA_SCRIPT

JS_CALCULOS = abrir_script() + r"""
  var corpo=document.getElementById('corpo'),
      contador=document.getElementById('contador'),
      filtros=document.getElementById('filtros-ano'),
      falha=document.getElementById('falha'),
      vazio=document.getElementById('vazio'),
      ano=null, dados=[];

  function linha(c){
    var acoes = c.arquivo
      ? '<a class="btn btn--ghost btn--sm" href="'+c.arquivo.url+'" target="_blank" rel="noopener">'+ICO.eye+'Ver</a>'+
        '<a class="btn btn--primary btn--sm" href="'+c.arquivo.urlDownload+'">'+ICO.down+'Baixar</a>'
      : '<span class="chip chip--amber">Em breve</span>';
    return '<tr>'+
      '<td class="t-strong" data-l="Mês">'+escHtml(c.mesNome)+'</td>'+
      '<td data-l="Ano">'+c.ano+'</td>'+
      '<td data-l="Documento">'+escHtml(c.titulo)+'</td>'+
      '<td class="t-actions" data-l="Arquivo">'+acoes+'</td>'+
    '</tr>';
  }

  function aplicar(){
    var itens=dados.filter(function(c){return String(c.ano)===String(ano);});
    corpo.innerHTML=itens.map(linha).join('');
    contador.textContent=itens.length+(itens.length===1?' documento em ':' documentos em ')+ano+'.';
    vazio.classList.toggle('is-hidden',itens.length>0);
  }

  function montarAnos(anos){
    filtros.innerHTML=anos.map(function(a,i){
      return '<button class="filter" type="button" data-a="'+a+'" aria-pressed="'+(i===0)+'">'+a+'</button>';
    }).join('');
    filtros.addEventListener('click',function(ev){
      var b=ev.target.closest('.filter'); if(!b) return;
      Array.prototype.forEach.call(filtros.children,function(o){o.setAttribute('aria-pressed','false');});
      b.setAttribute('aria-pressed','true'); ano=b.dataset.a; aplicar();
    });
  }

  buscarApi('/api/publico/calculos').then(function(j){
    dados=j.calculos||[];
    var anos=j.anos||[];
    if(!anos.length){
      contador.textContent='';
      vazio.textContent='Nenhum cálculo mensal publicado ainda.';
      vazio.classList.remove('is-hidden');
      return;
    }
    montarAnos(anos); ano=anos[0]; aplicar();
  }).catch(function(){
    contador.textContent=''; mostrarFalha();
  });
""" + FECHA_SCRIPT


# ----------------------------------------------------------- TRANSPARÊNCIA
def transparencia():
    tabs = "".join(
        f'<button class="filter" type="button" data-c="{k}" aria-pressed="{"true" if k=="todos" else "false"}">{r}</button>'
        for k, r in CATEGORIAS)

    return pagehead(
        "Portal da Transparência",
        "Contratos de transporte, prestações de contas, termos de fomento, planos de trabalho e normas internas — "
        "tudo aberto, sem necessidade de cadastro.",
        "<span>Transparência</span>") + f'''
<main id="main" class="section">
  <div class="container">

    <div class="grid g-3 mb-24">
      <div class="card"><div class="card__icon">{I["shield"]}</div><h3>Acesso livre</h3>
        <p>Nenhum documento exige login. Qualquer pessoa da comunidade pode consultar e baixar.</p></div>
      <div class="card"><div class="card__icon card__icon--teal">{I["calc"]}</div><h3>Contas mês a mês</h3>
        <p>Os cálculos de mensalidade têm página própria, com histórico por ano.</p></div>
      <div class="card"><div class="card__icon card__icon--amber">{I["book"]}</div><h3>Base legal</h3>
        <p>Publicação orientada pelo Estatuto Social e pelos termos de fomento firmados com o município.</p></div>
    </div>

    <hr class="divider mt-40 mb-24">

    <div class="toolbar">
      <div class="field">
        {I["search"]}
        <input class="input" id="busca" type="search" placeholder="Buscar documento por nome…" aria-label="Buscar documento">
      </div>
    </div>
    <div class="filters mb-24" role="group" aria-label="Filtrar por categoria">{tabs}</div>

    <p class="muted mb-24" id="contador" aria-live="polite">Carregando documentos…</p>

    <div id="lista"></div>
    <p class="center muted mt-32 is-hidden" id="vazio">Nenhum documento encontrado com esse termo.</p>

    <div class="note mt-32 is-hidden" id="falha">{I["alert"]}
      <span><b>Não foi possível carregar a lista de documentos.</b> Atualize a página em alguns instantes
      ou fale com a AEUMA pelo e-mail <a href="{MAIL}">aeumarequerimento@gmail.com</a>.</span>
    </div>

    <div class="note mt-40">{I["alert"]}
      <span><b>Procura algo que não está aqui?</b> A AEUMA responde a pedidos de informação pelo e-mail
      <a href="{MAIL}">aeumarequerimento@gmail.com</a>.</span>
    </div>
  </div>
</main>
''' + icones_js("file", "eye", "down") + JS_TRANSPARENCIA


# ---------------------------------------------------------------- CÁLCULOS
def calculos():
    return pagehead(
        "Cálculos Mensais",
        "O valor rateado entre os estudantes é publicado todo mês, com o demonstrativo completo em PDF.",
        "<span>Cálculos Mensais</span>") + f'''
<main id="main" class="section">
  <div class="container">

    <div class="split split--65 split--top mb-24">
      <div>
        <span class="eyebrow">Como o cálculo é feito</span>
        <h2 class="mt-16">Custo total dividido, com o demonstrativo aberto</h2>
        <p class="lead mt-16">Cada linha tem um custo mensal — contrato de transporte, combustível e demais despesas
        previstas no plano de trabalho. Esse custo é rateado entre os estudantes que utilizam a linha, descontados os
        repasses recebidos. O demonstrativo de cada mês fica publicado abaixo, em PDF, para consulta de qualquer pessoa.</p>
      </div>
      <div class="card">
        <div class="card__icon card__icon--teal">{I["calc"]}</div>
        <h3>Dúvida sobre o seu valor?</h3>
        <p>A tesouraria da AEUMA explica linha a linha. Chame no WhatsApp com o nome da sua linha em mãos.</p>
        <a class="btn btn--teal btn--sm mt-16" href="{WA}" target="_blank" rel="noopener">{I["wa"]}Falar com a tesouraria</a>
      </div>
    </div>

    <hr class="divider mt-40 mb-24">

    <div class="row mb-24" style="justify-content:space-between">
      <div class="filters" id="filtros-ano" role="group" aria-label="Filtrar por ano"></div>
      <p class="muted" id="contador" aria-live="polite">Carregando…</p>
    </div>

    <div class="tablewrap">
      <table>
        <caption class="sr-only">Cálculos mensais publicados pela AEUMA</caption>
        <thead><tr><th scope="col">Mês</th><th scope="col">Ano</th><th scope="col">Documento</th><th scope="col" style="text-align:right">Arquivo</th></tr></thead>
        <tbody id="corpo"></tbody>
      </table>
    </div>
    <p class="center muted mt-32 is-hidden" id="vazio">Nenhum cálculo publicado para esse ano.</p>

    <div class="note mt-32 is-hidden" id="falha">{I["alert"]}
      <span><b>Não foi possível carregar os cálculos mensais.</b> Atualize a página em alguns instantes
      ou fale com a tesouraria pelo <a href="{WA}" target="_blank" rel="noopener">WhatsApp</a>.</span>
    </div>

    <div class="note mt-40">{I["alert"]}
      <span>Encontrou divergência em algum demonstrativo? Registre pelo e-mail
      <a href="{MAIL}">aeumarequerimento@gmail.com</a> — o Conselho Fiscal acompanha as solicitações.</span>
    </div>
  </div>
</main>
''' + icones_js("eye", "down") + JS_CALCULOS


# ---------------------------------------------------------------- ESTATUTO
def estatuto():
    return pagehead(
        "Estatuto Social",
        "O documento que define o que a AEUMA é, quem pode participar, como as decisões são tomadas e como as contas são prestadas.",
        "<span>Estatuto</span>") + f'''
<main id="main" class="section">
  <div class="container">
    <div class="band mb-24">
      <div class="split split--65">
        <div>
          <span class="eyebrow" style="color:var(--teal-400)">Documento oficial</span>
          <h2 class="mt-16" id="est-titulo">Estatuto Social da AEUMA</h2>
          <p class="mt-16" id="est-resumo"></p>
        </div>
        <div class="row" id="est-acoes" style="gap:12px"></div>
      </div>
    </div>

    <div class="section-head mt-40">
      <span class="eyebrow">O que está no documento</span>
      <h2>Estrutura do estatuto</h2>
      <p class="lead">Resumo dos capítulos para você localizar rápido o que procura no PDF.</p>
    </div>
    <div class="grid g-3" id="topicos"></div>
    <p class="center muted mt-32 is-hidden" id="vazio">Os capítulos ainda não foram publicados.</p>

    <div class="note mt-32 is-hidden" id="falha">{I["alert"]}
      <span><b>Não foi possível carregar o estatuto.</b> Atualize a página em alguns instantes.</span>
    </div>

    <div class="note note--blue mt-40">{I["shield"]}
      <span>Alterações no estatuto só valem depois de aprovadas em Assembleia Geral e registradas em cartório.
      Consulte também as <a href="/transparencia">atas de reunião</a> no Portal da Transparência.</span>
    </div>
  </div>
</main>
''' + icones_js("eye", "down") + JS_ESTATUTO


JS_ESTATUTO = abrir_script() + r"""
  buscarApi('/api/publico/estatuto').then(function(e){
    if(e.titulo) document.getElementById('est-titulo').textContent=e.titulo;
    document.getElementById('est-resumo').textContent=e.resumo||'';

    var acoes=document.getElementById('est-acoes');
    acoes.innerHTML = e.link
      ? '<a class="btn btn--teal" href="'+escHtml(e.link)+'" target="_blank" rel="noopener">'+ICO.eye+'Abrir PDF</a>'+
        '<a class="btn btn--onblue" href="'+escHtml(e.linkDownload)+'">'+ICO.down+'Baixar</a>'
      : '<span class="chip chip--amber">Documento ainda não publicado</span>';

    var topicos=e.topicos||[];
    document.getElementById('topicos').innerHTML=topicos.map(function(t){
      return '<div class="card"><h3>'+escHtml(t.titulo)+'</h3>'+
        (t.descricao?'<p>'+escHtml(t.descricao)+'</p>':'')+'</div>';
    }).join('');
    document.getElementById('vazio').classList.toggle('is-hidden', topicos.length>0);
  }).catch(function(){ mostrarFalha(); });
""" + FECHA_SCRIPT


# --------------------------------------------------------------- IDENTIDADE
def identidade():
    cores = [
        ("Azul Institucional 900", "#062A47", "Fundos escuros, cabeçalhos, rodapé", "#fff"),
        ("Azul Institucional 800", "#083A5F", "Gradientes, badges de linha", "#fff"),
        ("Azul AEUMA 600", "#0E63A0", "Cor primária: botões, links, ícones", "#fff"),
        ("Azul 100", "#DCEBF8", "Chips, estados ativos, superfícies suaves", "#062A47"),
        ("Verde Percurso 700", "#077054", "Texto de acento e botões de ação", "#fff"),
        ("Verde Percurso 500", "#0FAE81", "Detalhes decorativos e traço do eyebrow", "#04182B"),
        ("Verde 400", "#2CC79A", "Detalhes sobre fundo escuro", "#04182B"),
        ("Âmbar 500", "#E8A317", "Avisos e alertas", "#04182B"),
        ("Tinta", "#0B1B29", "Texto principal", "#fff"),
        ("Tinta 3", "#5A6E80", "Texto de apoio", "#fff"),
        ("Linha", "#E2E9F0", "Bordas e divisores", "#0B1B29"),
        ("Fundo", "#F6F9FC", "Fundo geral das páginas", "#0B1B29"),
    ]
    swatches = "".join(f'''
      <div class="card" style="padding:0;overflow:hidden">
        <div style="background:{hexv};height:104px;display:flex;align-items:flex-end;padding:14px;color:{fg};
             box-shadow:inset 0 0 0 1px rgba(11,27,41,.08);
             font-family:var(--font-display);font-weight:700;font-size:.9rem">{hexv}</div>
        <div style="padding:16px">
          <div class="person__name" style="font-size:.94rem">{nome}</div>
          <p style="font-size:.85rem;margin-top:4px">{uso}</p>
        </div>
      </div>''' for nome, hexv, uso, fg in cores)

    reducao = "".join(
        '<div class="center">'
        f'<img src="/assets/favicon.svg" width="{t}" height="{t}" alt="Símbolo a {t} pixels">'
        f'<p class="muted" style="font-size:.78rem;margin-top:8px">{t} px</p>'
        "</div>"
        for t in (16, 20, 24, 32, 48, 64, 96))

    return pagehead(
        "Identidade visual",
        "O sistema de marca criado no rebranding de 2026: símbolo, cores, tipografia e componentes.",
        "<span>Identidade</span>") + f'''
<main id="main" class="section">
  <div class="container">

    <div class="section-head">
      <span class="eyebrow">Símbolo</span>
      <h2>O capelo</h2>
      <p class="lead">O símbolo mantém o <b>capelo</b> da marca histórica da AEUMA, redesenhado em formas
      cheias em vez de traço fino — é o que permite reconhecê-lo a 16&nbsp;px, no ícone da aba do navegador.
      A borla em verde é o único acento de cor: marca a conquista e amarra o símbolo à paleta do site.
      O <b>diploma</b>, que acompanha o capelo na arte original, entra apenas nas assinaturas grandes,
      onde há espaço para ele ser lido.</p>
    </div>

    <div class="grid g-3">
      <div class="card center" style="display:grid;place-items:center;gap:16px;padding:40px">
        {mark(96,"i1")}<p class="muted" style="font-size:.86rem">Símbolo — uso principal</p>
      </div>
      <div class="card center" style="display:grid;place-items:center;gap:16px;padding:40px;background:var(--navy-950);border-color:var(--navy-800)">
        {mark(96,"i2")}<p style="font-size:.86rem;color:#9FBDD6">Sobre fundo escuro</p>
      </div>
      <div class="card center" style="display:grid;place-items:center;gap:16px;padding:40px">
        <img src="/assets/simbolo-aeuma-mono.svg" width="96" height="96" alt="Capelo e diploma em traço, versão monocromática">
        <p class="muted" style="font-size:.86rem">Monocromática — capelo e diploma</p>
      </div>
    </div>

    <div class="section-head mt-40">
      <span class="eyebrow">Redução</span>
      <h2>O símbolo em cada tamanho</h2>
      <p class="lead">O desenho foi verificado nos tamanhos reais de uso: favicon, ícone de aplicativo e
      cabeçalho. Abaixo do mínimo de 16&nbsp;px a silhueta do capelo deixa de ser reconhecível.</p>
    </div>
    <div class="card" style="display:flex;align-items:flex-end;gap:28px;flex-wrap:wrap;padding:32px">{reducao}</div>

    <div class="section-head mt-40" style="margin-top:72px">
      <span class="eyebrow">Assinaturas</span>
      <h2>Como a marca é aplicada</h2>
      <p class="lead">A horizontal é a padrão do site e de documentos. A vertical, com o nome por extenso
      e o CNPJ, é para ofícios, carimbos e materiais impressos.</p>
    </div>
    <div class="grid g-2">
      <div class="card center" style="display:grid;place-items:center;gap:16px;padding:40px">
        <img src="/assets/logo-aeuma.svg" width="330" height="64" style="max-width:100%;height:auto" alt="Assinatura horizontal da AEUMA">
        <p class="muted" style="font-size:.86rem">Horizontal — fundo claro</p>
      </div>
      <div class="card center" style="display:grid;place-items:center;gap:16px;padding:40px;background:var(--navy-900);border-color:var(--navy-800)">
        <img src="/assets/logo-aeuma-branco.svg" width="330" height="64" style="max-width:100%;height:auto" alt="Assinatura horizontal da AEUMA em fundo escuro">
        <p style="font-size:.86rem;color:#9FBDD6">Horizontal — fundo escuro</p>
      </div>
      <div class="card center" style="display:grid;place-items:center;gap:16px;padding:40px">
        <img src="/assets/logo-aeuma-vertical.svg" width="360" height="300" style="max-width:100%;height:auto" alt="Assinatura vertical da AEUMA com o nome por extenso e o CNPJ">
        <p class="muted" style="font-size:.86rem">Vertical — documentos e impressos</p>
      </div>
      <div class="card center" style="display:grid;place-items:center;gap:16px;padding:40px">
        <div class="row" style="gap:20px;justify-content:center">
          <img src="/assets/icone-app-claro.svg" width="76" height="76" alt="Ícone de aplicativo, versão clara">
          <img src="/assets/icone-app-escuro.svg" width="76" height="76" alt="Ícone de aplicativo, versão escura">
        </div>
        <p class="muted" style="font-size:.86rem">Ícones para perfis e aplicativos</p>
      </div>
    </div>

    <div class="note note--blue mt-32">{I["shield"]}
      <span><b>Arquivos da marca:</b>
      <a href="/assets/logo-aeuma.svg" download>horizontal</a> ·
      <a href="/assets/logo-aeuma-branco.svg" download>horizontal branca</a> ·
      <a href="/assets/logo-aeuma-vertical.svg" download>vertical</a> ·
      <a href="/assets/simbolo-aeuma.svg" download>símbolo</a> ·
      <a href="/assets/simbolo-aeuma-mono.svg" download>monocromática</a>.
      Todos em SVG, que não perde qualidade em nenhum tamanho.</span>
    </div>

    <div class="section-head mt-40" style="margin-top:72px">
      <span class="eyebrow">Cores</span>
      <h2>Paleta</h2>
      <p class="lead">Azul institucional para confiança e permanência; verde para o movimento do trajeto.
      Todas as combinações de texto usadas no site passam no critério AA de contraste da WCAG.</p>
    </div>
    <div class="grid g-4">{swatches}</div>

    <div class="section-head" style="margin-top:72px">
      <span class="eyebrow">Tipografia</span>
      <h2>Cinzel + Plus Jakarta Sans + Inter</h2>
      <p class="lead">Cinzel é reservada ao logotipo — é a serifa que traduz o desenho da marca original.
      A interface segue em sem-serifa, para não competir com ela.</p>
    </div>
    <div class="grid g-3">
      <div class="card">
        <p class="muted" style="font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700">Logotipo — Cinzel</p>
        <p style="font-family:var(--font-logo);font-weight:700;font-size:2.2rem;letter-spacing:.1em;line-height:1.1;margin-top:12px">AEUMA</p>
        <p class="muted mt-16" style="font-size:.9rem">Só em caixa alta, com espacejamento de .13em. Não usar em texto corrido.</p>
      </div>
      <div class="card">
        <p class="muted" style="font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700">Títulos — Plus Jakarta Sans</p>
        <p style="font-family:var(--font-display);font-weight:800;font-size:2.2rem;letter-spacing:-.03em;line-height:1.1;margin-top:12px">Aa Bb Cc</p>
        <p class="muted mt-16" style="font-size:.9rem">Pesos 600 · 700 · 800. Entrelinha curta e tracking negativo.</p>
      </div>
      <div class="card">
        <p class="muted" style="font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700">Texto — Inter</p>
        <p style="font-size:2.2rem;line-height:1.1;margin-top:12px">Aa Bb Cc</p>
        <p class="muted mt-16" style="font-size:.9rem">Pesos 400 · 500 · 600 · 700. Corpo 16px, entrelinha 1.65.</p>
      </div>
    </div>

    <div class="section-head" style="margin-top:72px">
      <span class="eyebrow">Componentes</span>
      <h2>Peças do sistema</h2>
    </div>
    <div class="card">
      <p class="muted" style="font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;margin-bottom:16px">Botões</p>
      <div class="row">
        <a class="btn btn--primary" href="#">{I["route"]}Primário</a>
        <a class="btn btn--teal" href="#">{I["shield"]}Acento</a>
        <a class="btn btn--dark" href="#">Escuro</a>
        <a class="btn btn--ghost" href="#">Secundário</a>
        <a class="btn btn--ghost btn--sm" href="#">Pequeno</a>
      </div>
      <hr class="divider mt-32 mb-24">
      <p class="muted" style="font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;margin-bottom:16px">Chips e avisos</p>
      <div class="chips mb-24">
        <span class="chip">Instituição</span><span class="chip chip--teal">Transparência</span>
        <span class="chip chip--amber">Atenção</span><span class="chip chip--plain">Neutro</span>
      </div>
      <div class="note">{I["alert"]}<span>Aviso de atenção — usado para ressalvas e horários de referência.</span></div>
      <div class="note note--blue mt-16">{I["shield"]}<span>Aviso informativo — usado para contexto institucional.</span></div>
    </div>

  </div>
</main>'''
