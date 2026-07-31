# -*- coding: utf-8 -*-
"""Home, Itinerários e Diretoria.

Os números, as linhas e a composição da diretoria vêm da API (apps/api) em tempo
de execução — tudo é editado no painel administrativo.
"""

from shell import I, WA, IG, MAIL, FULL_NAME
from jsutil import icones_js, abrir_script, FECHA_SCRIPT


def pagehead(title, lead, crumb):
    return f'''<section class="pagehead">
  <div class="container pagehead__in">
    <nav class="crumbs" aria-label="Você está aqui"><a href="/">Início</a><span>/</span>{crumb}</nav>
    <h1>{title}</h1>
    <p>{lead}</p>
  </div>
</section>'''


def num(chave):
    """Espaço reservado para um número que o JS preenche a partir da API."""
    return f'<span data-num="{chave}">—</span>'


# ------------------------------------------------------------------ HOME
def home():
    atalhos = [
        ("route", "", "Itinerários", "As linhas em operação, com horário, destino e instituições atendidas.", "/itinerarios", "Ver linhas"),
        ("calc", " card__icon--teal", "Cálculos Mensais", "O cálculo de cada mês aberto para consulta e download.", "/calculos-mensais", "Consultar"),
        ("shield", "", "Portal da Transparência", "Contratos, prestações de contas, termos e planos de trabalho.", "/transparencia", "Acessar portal"),
        ("book", " card__icon--amber", "Estatuto", "As regras que organizam a associação, na íntegra.", "/estatuto", "Ler estatuto"),
    ]
    cards = "".join(f'''
      <a class="card card--link" href="{href}">
        <div class="card__icon{mod}">{I[ico]}</div>
        <h3>{tit}</h3>
        <p>{desc}</p>
        <span class="card__more">{cta} {I["arrow"]}</span>
      </a>''' for ico, mod, tit, desc, href, cta in atalhos)

    passos = [
        ("1", "Escolha a sua linha", "Encontre em Itinerários a linha que atende a sua cidade de destino e a sua instituição."),
        ("2", "Fale com a coordenação", "Cada linha tem estudantes responsáveis. O contato está na página de itinerários."),
        ("3", "Acompanhe o cálculo do mês", "O valor da mensalidade é publicado mês a mês, aberto para qualquer pessoa conferir."),
    ]
    passos_html = "".join(f'''
      <div class="card">
        <div class="card__icon card__icon--teal" style="font-family:var(--font-display);font-weight:800;font-size:1.15rem">{n}</div>
        <h3>{t}</h3>
        <p>{d}</p>
      </div>''' for n, t, d in passos)

    return f'''<main id="main">

<section class="hero">
  <div class="container hero__in">
    <div>
      <span class="hero__badge"><b>Angatuba/SP</b> Associação estudantil sem fins lucrativos</span>
      <h1>O caminho até a faculdade, <em>organizado por quem faz o trajeto.</em></h1>
      <p class="hero__lead">A AEUMA reúne os estudantes universitários de Angatuba e organiza o transporte
      diário para {num("destinos")} cidades e {num("instituicoes")} instituições de ensino — com as contas abertas, mês a mês.</p>
      <div class="hero__cta">
        <a class="btn btn--teal btn--lg" href="/itinerarios">{I["route"]}Encontrar minha linha</a>
        <a class="btn btn--onblue btn--lg" href="/transparencia">{I["shield"]}Portal da Transparência</a>
      </div>
    </div>
    <div class="hero__panel">
      <h2 class="row" style="gap:9px;margin-bottom:6px">{I["bus"]}<span>Para onde a AEUMA leva</span></h2>
      <p style="color:#9FBDD6;font-size:.88rem;margin-bottom:6px">{num("saidas")} saídas diárias distribuídas em {num("linhas")} linhas.</p>
      <ul id="destinos"></ul>
      <a class="btn btn--onblue btn--sm mt-16" href="/itinerarios" style="width:100%">Ver horários completos {I["arrow"]}</a>
    </div>
  </div>
</section>

<section class="section--tight" style="padding-top:0;margin-top:-38px;position:relative;z-index:5">
  <div class="container">
    <div class="stats">
      <div class="stat"><div class="stat__n">{num("linhas")}</div><div class="stat__l">linhas em operação</div></div>
      <div class="stat"><div class="stat__n">{num("saidas")}</div><div class="stat__l">saídas diárias</div></div>
      <div class="stat"><div class="stat__n">{num("destinos")}</div><div class="stat__l">cidades atendidas</div></div>
      <div class="stat"><div class="stat__n">{num("instituicoes")}</div><div class="stat__l">instituições de ensino</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Acesso rápido</span>
      <h2>Tudo o que o estudante precisa, em um lugar só</h2>
      <p class="lead">Sem burocracia e sem procurar: as informações que mais são pedidas ficam a um clique da página inicial.</p>
    </div>
    <div class="grid g-4">{cards}</div>
  </div>
</section>

<section class="section" style="background:#fff;border-block:1px solid var(--line)">
  <div class="container">
    <div class="split split--45 split--top">
      <div>
        <span class="eyebrow">Comunicados</span>
        <h2 class="mt-16">Publicações recentes</h2>
        <p class="lead mt-16">Todo documento que entra no Portal da Transparência aparece aqui primeiro.
        Contratos, repasses e prestações de contas ficam disponíveis para qualquer pessoa consultar.</p>
        <a class="btn btn--ghost mt-24" href="/transparencia">Ver todos os documentos {I["arrow"]}</a>
      </div>
      <div id="recentes"></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Como funciona</span>
      <h2>Três passos para começar a usar</h2>
    </div>
    <div class="grid g-3">{passos_html}</div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="container">
    <div class="band">
      <div class="split split--65">
        <div>
          <span class="eyebrow" style="color:var(--teal-400)">Fale com a gente</span>
          <h2 class="mt-16">Dúvida sobre linha, vaga ou mensalidade?</h2>
          <p class="mt-16">O atendimento da AEUMA é feito por estudantes e pela equipe administrativa.
          Chame no WhatsApp ou passe no Instagram — respondemos por lá todos os dias úteis.</p>
        </div>
        <div class="row" style="gap:12px">
          <a class="btn btn--teal" href="{WA}" target="_blank" rel="noopener">{I["wa"]}WhatsApp</a>
          <a class="btn btn--onblue" href="{IG}" target="_blank" rel="noopener">{I["ig"]}Instagram</a>
          <a class="btn btn--onblue" href="{MAIL}">{I["mail"]}E-mail</a>
        </div>
      </div>
    </div>
  </div>
</section>

</main>
''' + icones_js("file") + JS_HOME


JS_HOME = abrir_script() + r"""
  buscarApi('/api/publico/itinerarios').then(function(j){
    preencherNumeros(j.totais);
    var ul=document.getElementById('destinos');
    ul.innerHTML=(j.destinos||[]).map(function(d){
      return '<li class="row" style="justify-content:space-between;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.1)">'+
        '<span class="row" style="gap:10px"><span style="width:8px;height:8px;border-radius:50%;background:var(--teal-400)"></span>'+
        '<b style="font-family:var(--font-display);font-weight:600;color:#fff;font-size:.95rem">'+escHtml(d.nome)+'</b></span>'+
        '<span style="color:#9FBDD6;font-size:.86rem">'+d.saidas+(d.saidas===1?' saída':' saídas')+'</span></li>';
    }).join('') || '<li style="color:#9FBDD6;font-size:.9rem;padding:11px 0">Nenhuma linha publicada ainda.</li>';
  }).catch(function(){});

  buscarApi('/api/publico/documentos').then(function(j){
    var itens=(j.documentos||[]).filter(function(d){return d.arquivo;}).sort(function(a,b){
      return String(b.arquivo.enviadoEm).localeCompare(String(a.arquivo.enviadoEm));
    }).slice(0,3);
    var caixa=document.getElementById('recentes');
    caixa.innerHTML=itens.length ? itens.map(function(d){
      return '<a class="doc" href="'+d.arquivo.url+'" target="_blank" rel="noopener">'+
        '<span class="doc__ico">'+ICO.file+'</span>'+
        '<span class="doc__body"><span class="doc__title">'+escHtml(d.titulo)+'</span>'+
        '<span class="doc__meta">'+escHtml(d.categoriaRotulo)+'</span></span>'+
        '<span class="chips"><span class="chip chip--teal">Transparência</span></span></a>';
    }).join('') : '<p class="muted">Nenhum documento publicado ainda.</p>';
  }).catch(function(){});
""" + FECHA_SCRIPT


# ------------------------------------------------------------ ITINERÁRIOS
def itinerarios():
    return pagehead(
        "Itinerários",
        "Todas as linhas em operação, com horário, cidade de destino e instituições atendidas. "
        "Busque pela sua instituição, pelo destino ou pelo número da linha.",
        "<span>Itinerários</span>") + f'''
<main id="main" class="section">
  <div class="container">
    <div class="toolbar">
      <div class="field">
        {I["search"]}
        <input class="input" id="busca" type="search" placeholder="Buscar instituição, cidade ou linha…" aria-label="Buscar linha">
      </div>
      <div class="filters" id="filtros" role="group" aria-label="Filtrar por destino"></div>
    </div>

    <p class="muted mb-24" id="contador" aria-live="polite">Carregando linhas…</p>

    <div class="grid g-3" id="lista"></div>

    <p class="center muted mt-32 is-hidden" id="vazio">Nenhuma linha encontrada. Tente outro termo ou limpe os filtros.</p>

    <div class="note mt-32 is-hidden" id="falha">{I["alert"]}
      <span><b>Não foi possível carregar os itinerários.</b> Atualize a página em alguns instantes ou
      fale com a AEUMA pelo <a href="{WA}" target="_blank" rel="noopener">WhatsApp</a>.</span>
    </div>

    <div class="note mt-40">
      {I["alert"]}
      <span><b>Horários de referência.</b> Os horários acima seguem a tabela publicada pela AEUMA e podem sofrer
      ajustes por calendário acadêmico ou condições da estrada. Confirme sempre com a coordenação da sua linha
      ou pelo <a href="{WA}" target="_blank" rel="noopener">WhatsApp da associação</a>.</span>
    </div>
  </div>
</main>
''' + icones_js("pin", "users") + JS_ITINERARIOS


JS_ITINERARIOS = abrir_script() + r"""
  var busca=document.getElementById('busca'),
      lista=document.getElementById('lista'),
      filtros=document.getElementById('filtros'),
      contador=document.getElementById('contador'),
      vazio=document.getElementById('vazio'),
      destinoAtivo='todos', dados=[];

  function cartao(l){
    var chips=(l.instituicoes||[]).map(function(i){
      return '<span class="chip chip--plain">'+escHtml(i)+'</span>';}).join('');
    return '<article class="line">'+
      '<div class="line__top"><div><div class="line__badge">'+escHtml(l.linha)+'</div></div>'+
        (l.horario?'<div class="line__time"><b>'+escHtml(l.horario)+'</b><span>Horário</span></div>':'')+
      '</div>'+
      '<div class="line__dest">'+ICO.pin+escHtml(l.destino)+'</div>'+
      '<p class="muted" style="font-size:.86rem">Linha '+escHtml(l.linha)+' · saída de Angatuba</p>'+
      '<div class="line__label">Instituições atendidas</div>'+
      '<div class="chips">'+(chips||'<span class="chip chip--plain">A confirmar</span>')+'</div>'+
      '<div class="line__foot">'+ICO.users+'<span>Coordenação: <b style="color:var(--ink)">'+
        escHtml(l.coordenacao||'a confirmar')+'</b></span></div>'+
    '</article>';
  }

  function aplicar(){
    var termo=norm(busca.value.trim());
    var itens=dados.filter(function(l){
      var okDest = destinoAtivo==='todos' || l.destino===destinoAtivo;
      var alvo='linha '+l.linha+' '+l.destino+' '+(l.instituicoes||[]).join(' ')+' '+(l.coordenacao||'');
      return okDest && (!termo || norm(alvo).indexOf(termo)>-1);
    });
    lista.innerHTML=itens.map(cartao).join('');
    contador.textContent=dados.length
      ? 'Mostrando '+itens.length+' de '+dados.length+(dados.length===1?' saída.':' saídas.')
      : '';
    vazio.textContent=dados.length
      ? 'Nenhuma linha encontrada. Tente outro termo ou limpe os filtros.'
      : 'Nenhuma linha publicada ainda.';
    vazio.classList.toggle('is-hidden', itens.length>0);
  }

  busca.addEventListener('input', aplicar);
  filtros.addEventListener('click', function(ev){
    var b=ev.target.closest('.filter'); if(!b) return;
    Array.prototype.forEach.call(filtros.children,function(o){o.setAttribute('aria-pressed','false');});
    b.setAttribute('aria-pressed','true'); destinoAtivo=b.dataset.f; aplicar();
  });

  buscarApi('/api/publico/itinerarios').then(function(j){
    dados=j.linhas||[];
    filtros.innerHTML=['<button class="filter" type="button" data-f="todos" aria-pressed="true">Todos os destinos</button>']
      .concat((j.destinos||[]).map(function(d){
        return '<button class="filter" type="button" data-f="'+escHtml(d.nome)+'" aria-pressed="false">'+escHtml(d.nome)+'</button>';
      })).join('');
    aplicar();
  }).catch(function(){ contador.textContent=''; mostrarFalha(); });
""" + FECHA_SCRIPT


# -------------------------------------------------------------- DIRETORIA
def diretoria():
    return pagehead(
        "Diretoria",
        "A AEUMA é dirigida por estudantes eleitos entre os próprios universitários de Angatuba, "
        "com conselho fiscal e apoio administrativo.",
        "<span>Diretoria</span>") + f'''
<main id="main" class="section">
  <div class="container">
    <div class="note note--blue">
      {I["shield"]}
      <span>A composição da diretoria e as regras de eleição estão descritas no
      <a href="/estatuto">Estatuto Social</a> da associação.</span>
    </div>

    <div id="setores"></div>
    <p class="center muted mt-40 is-hidden" id="vazio">A composição da diretoria ainda não foi publicada.</p>

    <div class="note mt-32 is-hidden" id="falha">{I["alert"]}
      <span><b>Não foi possível carregar a diretoria.</b> Atualize a página em alguns instantes.</span>
    </div>

    <div class="band mt-40">
      <h3>Quer participar da próxima gestão?</h3>
      <p class="mt-8">Qualquer estudante associado pode se candidatar. Fale com a diretoria para entender
      prazos, requisitos e o funcionamento da assembleia.</p>
      <div class="row mt-24">
        <a class="btn btn--teal" href="{WA}" target="_blank" rel="noopener">{I["wa"]}Falar com a diretoria</a>
        <a class="btn btn--onblue" href="/estatuto">{I["file"]}Ver o Estatuto</a>
      </div>
    </div>
  </div>
</main>
''' + JS_DIRETORIA


JS_DIRETORIA = abrir_script() + r"""
  var alvo=document.getElementById('setores'), vazio=document.getElementById('vazio');

  function iniciais(nome){
    var partes=String(nome||'').split(/\s+/).filter(function(p){return p.length>2;});
    if(partes.length>1) return (partes[0][0]+partes[partes.length-1][0]).toUpperCase();
    return String(nome||'?').slice(0,2).toUpperCase();
  }

  function bloco(setor, i){
    var pessoas=(setor.membros||[]).map(function(m){
      return '<div class="person">'+
        '<div class="avatar'+(i%2?' avatar--teal':'')+'" aria-hidden="true">'+escHtml(iniciais(m.nome))+'</div>'+
        '<div class="person__name">'+escHtml(m.nome)+'</div>'+
        '<div class="person__role">'+escHtml(m.cargo)+'</div>'+
      '</div>';
    }).join('');
    if(!pessoas) pessoas='<p class="muted">Nenhum integrante publicado neste setor.</p>';
    var cols=(setor.membros||[]).length===3?'g-3':'g-2';
    var largura=(setor.membros||[]).length===3?'100%':'780px';
    return '<div class="mt-40">'+
      '<div class="section-head" style="margin-bottom:22px">'+
        '<span class="eyebrow">'+escHtml(setor.titulo)+'</span>'+
        (setor.descricao?'<p class="lead mt-8">'+escHtml(setor.descricao)+'</p>':'')+
      '</div>'+
      '<div class="grid '+cols+'" style="max-width:'+largura+'">'+pessoas+'</div>'+
    '</div>';
  }

  buscarApi('/api/publico/diretoria').then(function(j){
    var setores=j.setores||[];
    alvo.innerHTML=setores.map(bloco).join('');
    vazio.classList.toggle('is-hidden', setores.length>0);
  }).catch(function(){ mostrarFalha(); });
""" + FECHA_SCRIPT
