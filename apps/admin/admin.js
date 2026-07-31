/* =========================================================
   AEUMA — Painel administrativo (sem dependências)
   ========================================================= */
window.AEUMA = (function () {
  "use strict";

  var MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
               "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  var ABAS = ["calculos", "transparencia", "itinerarios", "diretoria", "estatuto", "conta"];

  var ICO_DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/></svg>';
  var ICO_ROTA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h5a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5"/></svg>';
  var ICO_LIVRO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h13v18H6.5A2.5 2.5 0 0 0 4 19.5Z"/><path d="M6.5 17H19"/></svg>';

  // ------------------------------------------------------------- utilidades
  var $ = function (sel, raiz) { return (raiz || document).querySelector(sel); };
  var $$ = function (sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); };

  function escapar(txt) {
    return String(txt == null ? "" : txt).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function semAcento(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function tamanho(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1024 / 1024).toFixed(1).replace(".", ",") + " MB";
  }

  function data(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (e) { return ""; }
  }

  // -------------------------------------------------------------------- API
  function pedir(caminho, opcoes) {
    opcoes = opcoes || {};
    opcoes.credentials = "same-origin";
    opcoes.headers = opcoes.headers || {};
    if (opcoes.json !== undefined) {
      opcoes.headers["Content-Type"] = "application/json";
      opcoes.body = JSON.stringify(opcoes.json);
      delete opcoes.json;
    }
    return fetch("/api" + caminho, opcoes).then(function (resp) {
      return resp.text().then(function (texto) {
        var dados = {};
        try { dados = texto ? JSON.parse(texto) : {}; } catch (e) { dados = { erro: "Resposta inválida do servidor." }; }
        if (!resp.ok) {
          var erro = new Error(dados.erro || "Falha na comunicação com o servidor.");
          erro.status = resp.status;
          throw erro;
        }
        return dados;
      });
    }, function () {
      throw new Error("Servidor fora do ar. Verifique se o comando npm start está rodando.");
    });
  }

  function mostrarErro(elemento, mensagem) {
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.classList.remove("is-hidden");
  }

  function limparErro(elemento) {
    if (!elemento) return;
    elemento.textContent = "";
    elemento.classList.add("is-hidden");
  }

  var erroDe = function (nome) { return $('[data-erro="' + nome + '"]'); };

  function toast(mensagem, tipo) {
    var caixa = $("#toasts");
    if (!caixa) return;
    var el = document.createElement("div");
    el.className = "adm-toast" + (tipo ? " adm-toast--" + tipo : "");
    el.textContent = mensagem;
    caixa.appendChild(el);
    setTimeout(function () { el.remove(); }, 4200);
  }

  /** Envolve um envio: desabilita o botão, mostra o erro no lugar certo. */
  function enviando(botao, promessa, erro, aoConcluir) {
    var rotulo = botao ? botao.textContent : "";
    if (botao) { botao.disabled = true; botao.textContent = "Enviando…"; }
    return promessa
      .then(function (r) { if (aoConcluir) return aoConcluir(r); })
      .catch(function (e) { if (erro) mostrarErro(erro, e.message); else toast(e.message, "erro"); })
      .finally(function () { if (botao) { botao.disabled = false; botao.textContent = rotulo; } });
  }

  var botoesMover = '<button class="adm-mini adm-mini--icone" type="button" data-acao="subir" aria-label="Mover para cima">↑</button>' +
                    '<button class="adm-mini adm-mini--icone" type="button" data-acao="descer" aria-label="Mover para baixo">↓</button>';

  // ============================================================ TELA DE LOGIN
  function iniciarLogin() {
    var form = $("#form-login"), erro = $("#erro"), botao = $("#botao-entrar");

    pedir("/auth/eu").then(function () { location.replace("/admin/painel"); }).catch(function () {});

    $$(".adm-senha__ver").forEach(function (b) {
      b.addEventListener("click", function () {
        var campo = document.getElementById(b.dataset.alvo);
        var visivel = campo.type === "text";
        campo.type = visivel ? "password" : "text";
        b.textContent = visivel ? "Mostrar" : "Ocultar";
        b.setAttribute("aria-label", visivel ? "Mostrar senha" : "Ocultar senha");
      });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      limparErro(erro);
      var email = $("#email").value.trim(), senha = $("#senha").value;
      if (!email || !senha) return mostrarErro(erro, "Preencha e-mail e senha.");

      botao.disabled = true;
      botao.textContent = "Entrando…";
      pedir("/auth/login", { method: "POST", json: { email: email, senha: senha } })
        .then(function (dados) {
          // Sem HTTPS o navegador descarta o cookie e o painel devolveria para cá,
          // sem explicação nenhuma. Melhor dizer o que está acontecendo.
          if (dados.avisoHttp) {
            botao.disabled = false;
            botao.textContent = "Entrar";
            return mostrarErro(erro,
              "Senha correta, mas esta conexão é HTTP e o cookie de sessão exige HTTPS. " +
              "Instale o certificado no domínio, ou use NODE_ENV=development enquanto testa pelo IP.");
          }
          location.replace("/admin/painel");
        })
        .catch(function (e) {
          mostrarErro(erro, e.message);
          botao.disabled = false;
          botao.textContent = "Entrar";
          $("#senha").value = "";
          $("#senha").focus();
        });
    });
  }

  // ================================================================== PAINEL
  var estado = {
    usuario: null,
    categorias: [],
    itens: { calculos: [], transparencia: [] },
    linhas: [],
    setores: [],
    estatuto: null,
    filtroAno: "todos",
    filtroCategoria: "todos",
    filtroDestino: "todos",
    buscaCalculos: "",
    buscaDocumentos: "",
    buscaLinhas: "",
  };

  function iniciarPainel() {
    pedir("/auth/eu")
      .then(function (dados) {
        estado.usuario = dados.usuario;
        $("#usuario-nome").textContent = dados.usuario.nome;
        preencherConta(dados);
        if (dados.senhaPadrao) $("#aviso-senha").classList.remove("is-hidden");
        return arrancar();
      })
      .catch(function (e) {
        if (e.status === 401) location.replace("/admin/");
        else toast(e.message, "erro");
      });
  }

  function arrancar() {
    ligarAbas();
    ligarSair();
    ligarModal();
    ligarDocumentos();
    ligarItinerarios();
    ligarDiretoria();
    ligarEstatuto();
    ligarConta();

    return pedir("/publico/categorias").then(function (dados) {
      estado.categorias = dados.categorias;
      preencherSelects();
      return Promise.all([
        carregarDocumentos("calculos"),
        carregarDocumentos("transparencia"),
        carregarLinhas(),
        carregarDiretoria(),
        carregarEstatuto(),
      ]);
    });
  }

  // ------------------------------------------------------------------ abas
  function ligarAbas() {
    function trocar(aba) {
      $$(".adm-aba").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.aba === aba)); });
      ABAS.forEach(function (s) { $("#secao-" + s).classList.toggle("is-hidden", s !== aba); });
      if (location.hash !== "#" + aba) location.hash = aba;
    }
    $$(".adm-aba").forEach(function (b) {
      b.addEventListener("click", function () { trocar(b.dataset.aba); });
    });
    $$("[data-ir]").forEach(function (b) {
      b.addEventListener("click", function () { trocar(b.dataset.ir); });
    });
    function pelaUrl() {
      var alvo = (location.hash || "").replace("#", "");
      if (ABAS.indexOf(alvo) > -1) trocar(alvo);
    }
    window.addEventListener("hashchange", pelaUrl);
    pelaUrl();
  }

  function ligarSair() {
    $("#btn-sair").addEventListener("click", function () {
      pedir("/auth/logout", { method: "POST" }).finally(function () { location.replace("/admin/"); });
    });
  }

  function preencherSelects() {
    $("#doc-categoria").innerHTML = estado.categorias
      .map(function (c) { return '<option value="' + c.chave + '">' + escapar(c.rotulo) + "</option>"; })
      .join("");

    var mes = $("#calc-mes");
    mes.innerHTML = MESES.map(function (m, i) { return '<option value="' + (i + 1) + '">' + m + "</option>"; }).join("");
    var hoje = new Date();
    mes.value = String(hoje.getMonth() + 1);
    $("#calc-ano").value = String(hoje.getFullYear());
  }

  function metrica(valor, rotulo) {
    return '<div class="adm-metrica"><b>' + valor + "</b><span>" + rotulo + "</span></div>";
  }

  function vazio(mensagem) {
    return '<p class="adm-vazio">' + escapar(mensagem) + "</p>";
  }

  // =================================================== CÁLCULOS E DOCUMENTOS
  function carregarDocumentos(tipo) {
    return pedir("/admin/" + tipo).then(function (dados) {
      estado.itens[tipo] = dados.itens;
      desenharDocumentos(tipo);
    });
  }

  function filtrarDocumentos(tipo) {
    var itens = estado.itens[tipo];
    if (tipo === "calculos") {
      var termo = semAcento(estado.buscaCalculos);
      return itens.filter(function (i) {
        var okAno = estado.filtroAno === "todos" || String(i.ano) === String(estado.filtroAno);
        var okBusca = !termo || semAcento(i.titulo + " " + i.mesNome + " " + i.ano).indexOf(termo) > -1;
        return okAno && okBusca;
      });
    }
    var t = semAcento(estado.buscaDocumentos);
    return itens.filter(function (i) {
      var okCat = estado.filtroCategoria === "todos" || i.categoria === estado.filtroCategoria;
      var okBusca = !t || semAcento(i.titulo + " " + i.categoriaRotulo + " " + (i.descricao || "")).indexOf(t) > -1;
      return okCat && okBusca;
    });
  }

  function desenharDocumentos(tipo) {
    var lista = estado.itens[tipo];
    var comArquivo = lista.filter(function (i) { return !!i.arquivo; }).length;

    $("#metricas-" + tipo).innerHTML =
      metrica(comArquivo, "publicados") + metrica(lista.length - comArquivo, "sem arquivo");

    if (tipo === "calculos") {
      var anos = [];
      lista.forEach(function (i) { if (anos.indexOf(i.ano) < 0) anos.push(i.ano); });
      anos.sort(function (a, b) { return b - a; });
      $("#filtros-ano").innerHTML = pilulas(
        [{ v: "todos", r: "Todos os anos" }].concat(anos.map(function (a) { return { v: a, r: a }; })),
        estado.filtroAno
      );
    } else {
      $("#filtros-categoria").innerHTML = pilulas(
        [{ v: "todos", r: "Todas as categorias" }].concat(
          estado.categorias.map(function (c) { return { v: c.chave, r: c.rotulo }; })
        ),
        estado.filtroCategoria
      );
    }

    var itens = filtrarDocumentos(tipo);
    var alvo = $("#lista-" + tipo);
    alvo.innerHTML = itens.length
      ? itens.map(function (i) { return linhaDocumento(tipo, i); }).join("")
      : vazio(lista.length ? "Nenhum registro para esse filtro." : "Nada publicado ainda. Use o formulário acima.");
  }

  function pilulas(opcoes, atual) {
    return opcoes.map(function (o) {
      return '<button class="filter" type="button" data-v="' + escapar(o.v) + '" aria-pressed="' +
        (String(o.v) === String(atual)) + '">' + escapar(o.r) + "</button>";
    }).join("");
  }

  function linhaDocumento(tipo, item) {
    var tem = !!item.arquivo;
    var meta = tipo === "calculos" ? item.mesNome + "/" + item.ano : escapar(item.categoriaRotulo);
    meta += tem
      ? " · " + escapar(item.arquivo.nome) + " (" + tamanho(item.arquivo.tamanho) + ") · enviado em " + data(item.arquivo.enviadoEm)
      : " · nenhum arquivo publicado";

    var acoes = tem
      ? '<a class="adm-mini" href="' + item.arquivo.url + '" target="_blank" rel="noopener">Ver</a>' +
        '<a class="adm-mini" href="' + item.arquivo.urlDownload + '">Baixar</a>' +
        '<button class="adm-mini" type="button" data-acao="arquivo">Substituir</button>' +
        '<button class="adm-mini adm-mini--risco" type="button" data-acao="tirar-arquivo">Tirar do ar</button>'
      : '<button class="adm-mini adm-mini--forte" type="button" data-acao="arquivo">Enviar arquivo</button>';
    acoes += '<button class="adm-mini" type="button" data-acao="editar">Editar</button>' +
             '<button class="adm-mini adm-mini--risco" type="button" data-acao="excluir">Excluir</button>';

    return '<article class="adm-item' + (tem ? "" : " pendente") + '" data-id="' + item.id + '">' +
      '<span class="adm-item__ico">' + ICO_DOC + "</span>" +
      "<div>" +
        '<h3 class="adm-item__titulo">' + escapar(item.titulo) +
          '<span class="adm-tag ' + (tem ? "adm-tag--ok" : "adm-tag--pend") + '">' +
          (tem ? "Publicado" : "Sem arquivo") + "</span></h3>" +
        '<p class="adm-item__meta">' + meta + "</p>" +
      "</div>" +
      '<div class="adm-item__acoes">' + acoes + "</div>" +
    "</article>";
  }

  // seletor de arquivo reutilizado pelas ações "enviar/substituir"
  var seletorArquivo = null;

  function pedirArquivo(caminho, aoConcluir) {
    if (!seletorArquivo) {
      seletorArquivo = document.createElement("input");
      seletorArquivo.type = "file";
      seletorArquivo.accept = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg";
      seletorArquivo.style.display = "none";
      document.body.appendChild(seletorArquivo);
    }
    seletorArquivo.value = "";
    seletorArquivo.onchange = function () {
      var arquivo = seletorArquivo.files[0];
      if (!arquivo) return;
      var corpo = new FormData();
      corpo.append("arquivo", arquivo);
      toast("Enviando " + arquivo.name + "…");
      pedir(caminho, { method: "POST", body: corpo })
        .then(function () { toast("Arquivo publicado.", "ok"); return aoConcluir(); })
        .catch(function (e) { toast(e.message, "erro"); });
    };
    seletorArquivo.click();
  }

  function ligarDocumentos() {
    ["calculos", "transparencia"].forEach(function (tipo) {
      $("#lista-" + tipo).addEventListener("click", function (ev) {
        var botao = ev.target.closest("[data-acao]");
        if (!botao) return;
        var id = botao.closest(".adm-item").dataset.id;
        var item = estado.itens[tipo].find(function (i) { return i.id === id; });
        if (!item) return;
        var acao = botao.dataset.acao;
        var recarregar = function () { return carregarDocumentos(tipo); };

        if (acao === "arquivo") return pedirArquivo("/admin/" + tipo + "/" + id + "/arquivo", recarregar);

        if (acao === "tirar-arquivo") {
          if (!confirm('Tirar o arquivo de "' + item.titulo + '" do ar?\nO registro continua na lista, sem download.')) return;
          botao.disabled = true;
          return pedir("/admin/" + tipo + "/" + id + "/arquivo", { method: "DELETE" })
            .then(function () { toast("Arquivo removido.", "ok"); return recarregar(); })
            .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
        }

        if (acao === "excluir") {
          if (!confirm('Excluir "' + item.titulo + '" definitivamente?\nO arquivo também será apagado do servidor.')) return;
          botao.disabled = true;
          return pedir("/admin/" + tipo + "/" + id, { method: "DELETE" })
            .then(function () { toast("Registro excluído.", "ok"); return recarregar(); })
            .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
        }

        if (acao === "editar") editarDocumento(tipo, item);
      });
    });

    // filtros e buscas
    $("#busca-calculos").addEventListener("input", function (e) {
      estado.buscaCalculos = e.target.value; desenharDocumentos("calculos");
    });
    $("#busca-documentos").addEventListener("input", function (e) {
      estado.buscaDocumentos = e.target.value; desenharDocumentos("transparencia");
    });
    $("#filtros-ano").addEventListener("click", function (ev) {
      var b = ev.target.closest(".filter"); if (!b) return;
      estado.filtroAno = b.dataset.v; desenharDocumentos("calculos");
    });
    $("#filtros-categoria").addEventListener("click", function (ev) {
      var b = ev.target.closest(".filter"); if (!b) return;
      estado.filtroCategoria = b.dataset.v; desenharDocumentos("transparencia");
    });

    // formulários de publicação
    var dropCalc = ligarDrop("#drop-calculo", "#calc-arquivo");
    var dropDoc = ligarDrop("#drop-documento", "#doc-arquivo");

    var formCalc = $("#form-calculo"), erroCalc = erroDe("calculo");
    formCalc.addEventListener("reset", function () { setTimeout(dropCalc.limpar, 0); limparErro(erroCalc); });
    formCalc.addEventListener("submit", function (ev) {
      ev.preventDefault();
      limparErro(erroCalc);
      var arquivo = $("#calc-arquivo").files[0];
      if (!arquivo) return mostrarErro(erroCalc, "Escolha o arquivo do demonstrativo.");
      var corpo = new FormData();
      corpo.append("mes", $("#calc-mes").value);
      corpo.append("ano", $("#calc-ano").value);
      corpo.append("titulo", $("#calc-titulo").value.trim());
      corpo.append("arquivo", arquivo);
      enviando($('button[type="submit"]', formCalc),
        pedir("/admin/calculos", { method: "POST", body: corpo }), erroCalc,
        function () {
          toast("Cálculo publicado.", "ok");
          formCalc.reset(); dropCalc.limpar();
          return carregarDocumentos("calculos");
        });
    });

    var formDoc = $("#form-documento"), erroDoc = erroDe("documento");
    formDoc.addEventListener("reset", function () { setTimeout(dropDoc.limpar, 0); limparErro(erroDoc); });
    formDoc.addEventListener("submit", function (ev) {
      ev.preventDefault();
      limparErro(erroDoc);
      var titulo = $("#doc-titulo").value.trim();
      var arquivo = $("#doc-arquivo").files[0];
      if (titulo.length < 3) return mostrarErro(erroDoc, "Informe o título do documento.");
      if (!arquivo) return mostrarErro(erroDoc, "Escolha o arquivo do documento.");
      var corpo = new FormData();
      corpo.append("titulo", titulo);
      corpo.append("categoria", $("#doc-categoria").value);
      corpo.append("descricao", $("#doc-descricao").value.trim());
      corpo.append("arquivo", arquivo);
      enviando($('button[type="submit"]', formDoc),
        pedir("/admin/transparencia", { method: "POST", body: corpo }), erroDoc,
        function () {
          toast("Documento publicado.", "ok");
          formDoc.reset(); dropDoc.limpar();
          return carregarDocumentos("transparencia");
        });
    });
  }

  function editarDocumento(tipo, item) {
    var campos = tipo === "calculos"
      ? [
          { id: "mes", rotulo: "Mês", tipo: "select", valor: item.mes,
            opcoes: MESES.map(function (m, i) { return { v: i + 1, r: m }; }) },
          { id: "ano", rotulo: "Ano", tipo: "number", valor: item.ano, min: 2000, max: 2100 },
          { id: "titulo", rotulo: "Título", valor: item.titulo },
        ]
      : [
          { id: "titulo", rotulo: "Título", valor: item.titulo },
          { id: "categoria", rotulo: "Categoria", tipo: "select", valor: item.categoria,
            opcoes: estado.categorias.map(function (c) { return { v: c.chave, r: c.rotulo }; }) },
          { id: "descricao", rotulo: "Descrição", valor: item.descricao },
        ];

    abrirModal(tipo === "calculos" ? "Editar cálculo mensal" : "Editar documento", campos, function (v) {
      if (tipo === "calculos") { v.mes = Number(v.mes); v.ano = Number(v.ano); }
      return pedir("/admin/" + tipo + "/" + item.id, { method: "PATCH", json: v })
        .then(function () { return carregarDocumentos(tipo); });
    });
  }

  // ============================================================ ITINERÁRIOS
  function carregarLinhas() {
    return pedir("/admin/linhas").then(function (dados) {
      estado.linhas = dados.itens;
      desenharLinhas();
    });
  }

  function desenharLinhas() {
    var linhas = estado.linhas;
    var destinos = [];
    var instituicoes = {};
    linhas.forEach(function (l) {
      if (destinos.indexOf(l.destino) < 0) destinos.push(l.destino);
      (l.instituicoes || []).forEach(function (i) { instituicoes[i] = true; });
    });
    destinos.sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });

    $("#metricas-itinerarios").innerHTML =
      metrica(linhas.length, "saídas") +
      metrica(destinos.length, "cidades") +
      metrica(Object.keys(instituicoes).length, "instituições");

    $("#filtros-destino").innerHTML = pilulas(
      [{ v: "todos", r: "Todos os destinos" }].concat(destinos.map(function (d) { return { v: d, r: d }; })),
      estado.filtroDestino
    );

    var termo = semAcento(estado.buscaLinhas);
    var itens = linhas.filter(function (l) {
      var okDest = estado.filtroDestino === "todos" || l.destino === estado.filtroDestino;
      var alvo = l.linha + " " + l.destino + " " + (l.instituicoes || []).join(" ") + " " + (l.coordenacao || "");
      return okDest && (!termo || semAcento(alvo).indexOf(termo) > -1);
    });

    $("#lista-itinerarios").innerHTML = itens.length
      ? itens.map(cartaoLinha).join("")
      : vazio(linhas.length ? "Nenhuma linha para esse filtro." : "Nenhuma linha cadastrada. Use o formulário acima.");
  }

  function cartaoLinha(l) {
    var instituicoes = (l.instituicoes || []).length
      ? (l.instituicoes || []).map(function (i) { return '<span class="chip chip--plain">' + escapar(i) + "</span>"; }).join("")
      : '<span class="adm-item__meta">Sem instituições cadastradas</span>';

    return '<article class="adm-item adm-item--alto" data-id="' + l.id + '">' +
      '<span class="adm-item__ico">' + ICO_ROTA + "</span>" +
      "<div>" +
        '<h3 class="adm-item__titulo">Linha ' + escapar(l.linha) +
          '<span class="adm-tag adm-tag--info">' + escapar(l.destino) + "</span>" +
          (l.horario ? '<span class="adm-tag adm-tag--neutra">' + escapar(l.horario) + "</span>" : "") +
        "</h3>" +
        '<div class="chips adm-chips">' + instituicoes + "</div>" +
        '<p class="adm-item__meta">Coordenação: ' + escapar(l.coordenacao || "a confirmar") + "</p>" +
      "</div>" +
      '<div class="adm-item__acoes">' + botoesMover +
        '<button class="adm-mini" type="button" data-acao="editar">Editar</button>' +
        '<button class="adm-mini adm-mini--risco" type="button" data-acao="excluir">Excluir</button>' +
      "</div>" +
    "</article>";
  }

  function ligarItinerarios() {
    var form = $("#form-linha"), erro = erroDe("linha");
    form.addEventListener("reset", function () { limparErro(erro); });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      limparErro(erro);
      var corpo = {
        linha: $("#linha-numero").value.trim(),
        destino: $("#linha-destino").value.trim(),
        horario: $("#linha-horario").value.trim(),
        instituicoes: $("#linha-instituicoes").value,
        coordenacao: $("#linha-coordenacao").value.trim(),
      };
      enviando($('button[type="submit"]', form),
        pedir("/admin/linhas", { method: "POST", json: corpo }), erro,
        function () { toast("Linha adicionada.", "ok"); form.reset(); return carregarLinhas(); });
    });

    $("#busca-linhas").addEventListener("input", function (e) {
      estado.buscaLinhas = e.target.value; desenharLinhas();
    });
    $("#filtros-destino").addEventListener("click", function (ev) {
      var b = ev.target.closest(".filter"); if (!b) return;
      estado.filtroDestino = b.dataset.v; desenharLinhas();
    });

    $("#lista-itinerarios").addEventListener("click", function (ev) {
      var botao = ev.target.closest("[data-acao]");
      if (!botao) return;
      var id = botao.closest(".adm-item").dataset.id;
      var linha = estado.linhas.find(function (l) { return l.id === id; });
      if (!linha) return;
      var acao = botao.dataset.acao;

      if (acao === "subir" || acao === "descer") {
        botao.disabled = true;
        return pedir("/admin/linhas/" + id + "/mover", { method: "POST", json: { direcao: acao === "subir" ? "cima" : "baixo" } })
          .then(carregarLinhas)
          .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
      }

      if (acao === "excluir") {
        if (!confirm("Excluir a linha " + linha.linha + " (" + linha.destino + ")?")) return;
        botao.disabled = true;
        return pedir("/admin/linhas/" + id, { method: "DELETE" })
          .then(function () { toast("Linha excluída.", "ok"); return carregarLinhas(); })
          .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
      }

      if (acao === "editar") {
        abrirModal("Editar linha", [
          { id: "linha", rotulo: "Linha", valor: linha.linha },
          { id: "destino", rotulo: "Cidade de destino", valor: linha.destino },
          { id: "horario", rotulo: "Horário", valor: linha.horario },
          { id: "instituicoes", rotulo: "Instituições", valor: (linha.instituicoes || []).join(", "),
            dica: "Separe por vírgula." },
          { id: "coordenacao", rotulo: "Coordenação", valor: linha.coordenacao },
        ], function (v) {
          return pedir("/admin/linhas/" + id, { method: "PATCH", json: v }).then(carregarLinhas);
        });
      }
    });
  }

  // =============================================================== DIRETORIA
  function carregarDiretoria() {
    return pedir("/admin/diretoria").then(function (dados) {
      estado.setores = dados.setores;
      desenharDiretoria();
    });
  }

  function desenharDiretoria() {
    var setores = estado.setores;
    var membros = setores.reduce(function (n, s) { return n + s.membros.length; }, 0);
    $("#metricas-diretoria").innerHTML = metrica(setores.length, "setores") + metrica(membros, "integrantes");

    $("#lista-diretoria").innerHTML = setores.length
      ? setores.map(cartaoSetor).join("")
      : vazio("Nenhum setor cadastrado. Crie o primeiro acima.");
  }

  function cartaoSetor(s) {
    var pessoas = s.membros.length
      ? s.membros.map(function (m) {
          return '<li class="adm-membro" data-membro="' + m.id + '">' +
            '<span class="adm-membro__txt"><b>' + escapar(m.nome) + "</b><span>" + escapar(m.cargo) + "</span></span>" +
            '<span class="adm-item__acoes">' + botoesMover +
              '<button class="adm-mini" type="button" data-acao="editar-membro">Editar</button>' +
              '<button class="adm-mini adm-mini--risco" type="button" data-acao="excluir-membro">Excluir</button>' +
            "</span></li>";
        }).join("")
      : '<li class="adm-membro adm-membro--vazio">Nenhum integrante neste setor.</li>';

    return '<section class="adm-setor" data-id="' + s.id + '">' +
      '<header class="adm-setor__cab">' +
        "<div>" +
          "<h3>" + escapar(s.titulo) + "</h3>" +
          (s.descricao ? "<p>" + escapar(s.descricao) + "</p>" : "") +
        "</div>" +
        '<div class="adm-item__acoes">' + botoesMover +
          '<button class="adm-mini" type="button" data-acao="editar-setor">Editar</button>' +
          '<button class="adm-mini adm-mini--risco" type="button" data-acao="excluir-setor">Excluir</button>' +
        "</div>" +
      "</header>" +
      '<ul class="adm-membros">' + pessoas + "</ul>" +
      '<form class="adm-inline" data-novo-membro>' +
        '<input class="input adm-input" name="nome" type="text" maxlength="120" placeholder="Nome da pessoa" required>' +
        '<input class="input adm-input" name="cargo" type="text" maxlength="80" placeholder="Cargo" required>' +
        '<button class="btn btn--ghost btn--sm" type="submit">Adicionar</button>' +
      "</form>" +
    "</section>";
  }

  function ligarDiretoria() {
    var form = $("#form-setor"), erro = erroDe("setor");
    form.addEventListener("reset", function () { limparErro(erro); });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      limparErro(erro);
      var corpo = { titulo: $("#setor-titulo").value.trim(), descricao: $("#setor-descricao").value.trim() };
      enviando($('button[type="submit"]', form),
        pedir("/admin/setores", { method: "POST", json: corpo }), erro,
        function () { toast("Setor criado.", "ok"); form.reset(); return carregarDiretoria(); });
    });

    var lista = $("#lista-diretoria");

    lista.addEventListener("submit", function (ev) {
      var f = ev.target.closest("[data-novo-membro]");
      if (!f) return;
      ev.preventDefault();
      var setorId = f.closest(".adm-setor").dataset.id;
      var corpo = { setorId: setorId, nome: f.nome.value.trim(), cargo: f.cargo.value.trim() };
      enviando($('button[type="submit"]', f),
        pedir("/admin/membros", { method: "POST", json: corpo }), null,
        function () { toast("Integrante adicionado.", "ok"); return carregarDiretoria(); });
    });

    lista.addEventListener("click", function (ev) {
      var botao = ev.target.closest("[data-acao]");
      if (!botao) return;
      var acao = botao.dataset.acao;
      var setorEl = botao.closest(".adm-setor");
      var membroEl = botao.closest("[data-membro]");
      var setor = estado.setores.find(function (s) { return s.id === setorEl.dataset.id; });
      if (!setor) return;

      // ----- membro
      if (membroEl) {
        var membro = setor.membros.find(function (m) { return m.id === membroEl.dataset.membro; });
        if (!membro) return;

        if (acao === "subir" || acao === "descer") {
          botao.disabled = true;
          return pedir("/admin/membros/" + membro.id + "/mover", { method: "POST", json: { direcao: acao === "subir" ? "cima" : "baixo" } })
            .then(carregarDiretoria)
            .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
        }
        if (acao === "excluir-membro") {
          if (!confirm('Remover "' + membro.nome + '" da diretoria?')) return;
          botao.disabled = true;
          return pedir("/admin/membros/" + membro.id, { method: "DELETE" })
            .then(function () { toast("Integrante removido.", "ok"); return carregarDiretoria(); })
            .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
        }
        if (acao === "editar-membro") {
          return abrirModal("Editar integrante", [
            { id: "nome", rotulo: "Nome", valor: membro.nome },
            { id: "cargo", rotulo: "Cargo", valor: membro.cargo },
            { id: "setorId", rotulo: "Setor", tipo: "select", valor: membro.setorId,
              opcoes: estado.setores.map(function (s) { return { v: s.id, r: s.titulo }; }) },
          ], function (v) {
            return pedir("/admin/membros/" + membro.id, { method: "PATCH", json: v }).then(carregarDiretoria);
          });
        }
        return;
      }

      // ----- setor
      if (acao === "subir" || acao === "descer") {
        botao.disabled = true;
        return pedir("/admin/setores/" + setor.id + "/mover", { method: "POST", json: { direcao: acao === "subir" ? "cima" : "baixo" } })
          .then(carregarDiretoria)
          .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
      }
      if (acao === "excluir-setor") {
        var aviso = setor.membros.length
          ? '\nOs ' + setor.membros.length + " integrante(s) do setor também serão removidos."
          : "";
        if (!confirm('Excluir o setor "' + setor.titulo + '"?' + aviso)) return;
        botao.disabled = true;
        return pedir("/admin/setores/" + setor.id, { method: "DELETE" })
          .then(function () { toast("Setor excluído.", "ok"); return carregarDiretoria(); })
          .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
      }
      if (acao === "editar-setor") {
        abrirModal("Editar setor", [
          { id: "titulo", rotulo: "Nome do setor", valor: setor.titulo },
          { id: "descricao", rotulo: "Descrição", tipo: "textarea", valor: setor.descricao },
        ], function (v) {
          return pedir("/admin/setores/" + setor.id, { method: "PATCH", json: v }).then(carregarDiretoria);
        });
      }
    });
  }

  // ================================================================ ESTATUTO
  function carregarEstatuto() {
    return pedir("/admin/estatuto").then(function (dados) {
      estado.estatuto = dados.estatuto;
      desenharEstatuto();
    });
  }

  function desenharEstatuto() {
    var e = estado.estatuto;
    $("#est-titulo").value = e.titulo || "";
    $("#est-resumo").value = e.resumo || "";
    $("#est-url").value = e.url || "";

    $("#metricas-estatuto").innerHTML =
      metrica(e.topicos.length, "capítulos") + metrica(e.arquivo ? "PDF" : "—", e.arquivo ? "arquivo próprio" : "sem arquivo");

    $("#estatuto-arquivo").innerHTML = e.arquivo
      ? '<div class="adm-arquivo-atual">' +
          "<div><b>" + escapar(e.arquivo.nome) + "</b>" +
          '<span class="adm-item__meta">' + tamanho(e.arquivo.tamanho) + " · enviado em " + data(e.arquivo.enviadoEm) + "</span></div>" +
          '<div class="adm-item__acoes">' +
            '<a class="adm-mini" href="' + e.arquivo.url + '" target="_blank" rel="noopener">Ver</a>' +
            '<a class="adm-mini" href="' + e.arquivo.urlDownload + '">Baixar</a>' +
            '<button class="adm-mini adm-mini--risco" type="button" id="btn-tirar-estatuto">Tirar do ar</button>' +
          "</div>" +
        "</div>"
      : '<p class="adm-item__meta" style="margin-bottom:16px">Nenhum arquivo enviado — o site usa o endereço informado acima.</p>';

    var tirar = $("#btn-tirar-estatuto");
    if (tirar) {
      tirar.addEventListener("click", function () {
        if (!confirm("Tirar o PDF do estatuto do ar?")) return;
        pedir("/admin/estatuto/arquivo", { method: "DELETE" })
          .then(function () { toast("Arquivo removido.", "ok"); return carregarEstatuto(); })
          .catch(function (erro) { toast(erro.message, "erro"); });
      });
    }

    $("#lista-topicos").innerHTML = e.topicos.length
      ? e.topicos.map(cartaoTopico).join("")
      : vazio("Nenhum capítulo cadastrado.");
  }

  function cartaoTopico(t) {
    return '<article class="adm-item" data-id="' + t.id + '">' +
      '<span class="adm-item__ico">' + ICO_LIVRO + "</span>" +
      "<div>" +
        '<h3 class="adm-item__titulo">' + escapar(t.titulo) + "</h3>" +
        '<p class="adm-item__meta">' + escapar(t.descricao || "Sem descrição") + "</p>" +
      "</div>" +
      '<div class="adm-item__acoes">' + botoesMover +
        '<button class="adm-mini" type="button" data-acao="editar">Editar</button>' +
        '<button class="adm-mini adm-mini--risco" type="button" data-acao="excluir">Excluir</button>' +
      "</div>" +
    "</article>";
  }

  function ligarEstatuto() {
    var form = $("#form-estatuto"), erro = erroDe("estatuto");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      limparErro(erro);
      var corpo = {
        titulo: $("#est-titulo").value.trim(),
        resumo: $("#est-resumo").value.trim(),
        url: $("#est-url").value.trim(),
      };
      enviando($('button[type="submit"]', form),
        pedir("/admin/estatuto", { method: "PATCH", json: corpo }), erro,
        function () { toast("Estatuto atualizado.", "ok"); return carregarEstatuto(); });
    });

    var drop = ligarDrop("#drop-estatuto", "#est-arquivo");
    var erroArquivo = erroDe("estatuto-arquivo");
    $("#btn-enviar-estatuto").addEventListener("click", function (ev) {
      limparErro(erroArquivo);
      var arquivo = $("#est-arquivo").files[0];
      if (!arquivo) return mostrarErro(erroArquivo, "Escolha o arquivo do estatuto.");
      var corpo = new FormData();
      corpo.append("arquivo", arquivo);
      enviando(ev.currentTarget,
        pedir("/admin/estatuto/arquivo", { method: "POST", body: corpo }), erroArquivo,
        function () { toast("Arquivo publicado.", "ok"); drop.limpar(); return carregarEstatuto(); });
    });

    var formTop = $("#form-topico"), erroTop = erroDe("topico");
    formTop.addEventListener("reset", function () { limparErro(erroTop); });
    formTop.addEventListener("submit", function (ev) {
      ev.preventDefault();
      limparErro(erroTop);
      var corpo = { titulo: $("#top-titulo").value.trim(), descricao: $("#top-descricao").value.trim() };
      enviando($('button[type="submit"]', formTop),
        pedir("/admin/estatuto/topicos", { method: "POST", json: corpo }), erroTop,
        function () { toast("Capítulo adicionado.", "ok"); formTop.reset(); return carregarEstatuto(); });
    });

    $("#lista-topicos").addEventListener("click", function (ev) {
      var botao = ev.target.closest("[data-acao]");
      if (!botao) return;
      var id = botao.closest(".adm-item").dataset.id;
      var topico = estado.estatuto.topicos.find(function (t) { return t.id === id; });
      if (!topico) return;
      var acao = botao.dataset.acao;

      if (acao === "subir" || acao === "descer") {
        botao.disabled = true;
        return pedir("/admin/estatuto/topicos/" + id + "/mover", { method: "POST", json: { direcao: acao === "subir" ? "cima" : "baixo" } })
          .then(carregarEstatuto)
          .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
      }
      if (acao === "excluir") {
        if (!confirm('Excluir o capítulo "' + topico.titulo + '"?')) return;
        botao.disabled = true;
        return pedir("/admin/estatuto/topicos/" + id, { method: "DELETE" })
          .then(function () { toast("Capítulo excluído.", "ok"); return carregarEstatuto(); })
          .catch(function (e) { toast(e.message, "erro"); botao.disabled = false; });
      }
      if (acao === "editar") {
        abrirModal("Editar capítulo", [
          { id: "titulo", rotulo: "Título", valor: topico.titulo },
          { id: "descricao", rotulo: "Descrição", tipo: "textarea", valor: topico.descricao },
        ], function (v) {
          return pedir("/admin/estatuto/topicos/" + id, { method: "PATCH", json: v }).then(carregarEstatuto);
        });
      }
    });
  }

  // =================================================================== CONTA
  function preencherConta(dados) {
    var u = dados.usuario;
    $("#dados-conta").innerHTML =
      "<div><dt>Nome</dt><dd>" + escapar(u.nome) + "</dd></div>" +
      "<div><dt>E-mail</dt><dd>" + escapar(u.email) + "</dd></div>" +
      "<div><dt>Perfil</dt><dd>" + escapar(u.papel) + "</dd></div>" +
      "<div><dt>Senha</dt><dd>" + (dados.senhaPadrao ? "padrão — troque agora" : "definida por você") + "</dd></div>";
  }

  function ligarConta() {
    var form = $("#form-senha"), erro = erroDe("senha");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      limparErro(erro);
      var nova = $("#senha-nova").value;
      if (nova.length < 10) return mostrarErro(erro, "A nova senha precisa ter ao menos 10 caracteres.");
      if (nova !== $("#senha-confirma").value) return mostrarErro(erro, "As senhas não conferem.");

      var botao = $('button[type="submit"]', form);
      botao.disabled = true;
      pedir("/auth/senha", { method: "PATCH", json: { atual: $("#senha-atual").value, nova: nova } })
        .then(function () {
          form.reset();
          $("#aviso-senha").classList.add("is-hidden");
          toast("Senha alterada.", "ok");
          return pedir("/auth/eu").then(preencherConta);
        })
        .catch(function (e) { mostrarErro(erro, e.message); })
        .finally(function () { botao.disabled = false; });
    });
  }

  // ============================================================ ARRASTAR/SOLTAR
  function ligarDrop(idDrop, idInput) {
    var drop = $(idDrop), campo = $(idInput);
    var textoOriginal = $(".adm-drop__txt", drop).innerHTML;
    var metaOriginal = $(".adm-drop__meta", drop).textContent;

    function mostrar() {
      var f = campo.files[0];
      drop.classList.toggle("tem-arquivo", !!f);
      $(".adm-drop__txt", drop).innerHTML = f ? "<b>" + escapar(f.name) + "</b>" : textoOriginal;
      $(".adm-drop__meta", drop).textContent = f ? tamanho(f.size) + " · clique para trocar" : metaOriginal;
    }

    drop.addEventListener("click", function () { campo.click(); });
    drop.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); campo.click(); }
    });
    campo.addEventListener("change", mostrar);

    ["dragenter", "dragover"].forEach(function (evt) {
      drop.addEventListener(evt, function (ev) { ev.preventDefault(); drop.classList.add("is-sobre"); });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      drop.addEventListener(evt, function (ev) { ev.preventDefault(); drop.classList.remove("is-sobre"); });
    });
    drop.addEventListener("drop", function (ev) {
      var arquivos = ev.dataTransfer && ev.dataTransfer.files;
      if (arquivos && arquivos.length) { campo.files = arquivos; mostrar(); }
    });

    return { limpar: function () { campo.value = ""; mostrar(); } };
  }

  // =================================================================== MODAL
  var aoSalvarModal = null;

  function ligarModal() {
    var modal = $("#modal");
    $$("[data-fechar]").forEach(function (b) {
      b.addEventListener("click", function () { modal.close(); });
    });
    $("#form-edicao").addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!aoSalvarModal) return;
      var erro = erroDe("modal");
      limparErro(erro);
      var valores = {};
      $$("#modal-campos [data-campo]").forEach(function (el) { valores[el.dataset.campo] = el.value; });

      var botao = $('button[type="submit"]', $("#form-edicao"));
      botao.disabled = true;
      Promise.resolve(aoSalvarModal(valores))
        .then(function () { modal.close(); toast("Alterações salvas.", "ok"); })
        .catch(function (e) { mostrarErro(erro, e.message); })
        .finally(function () { botao.disabled = false; });
    });
  }

  function abrirModal(titulo, campos, aoSalvar) {
    aoSalvarModal = aoSalvar;
    limparErro(erroDe("modal"));
    $("#modal-titulo").textContent = titulo;
    $("#modal-campos").innerHTML = campos.map(campoModal).join("");
    $("#modal").showModal();
    var primeiro = $("#modal-campos [data-campo]");
    if (primeiro) primeiro.focus();
  }

  function campoModal(c) {
    var id = "ed-" + c.id;
    var entrada;
    if (c.tipo === "select") {
      entrada = '<select class="input adm-input" id="' + id + '" data-campo="' + c.id + '">' +
        c.opcoes.map(function (o) {
          return '<option value="' + escapar(o.v) + '"' + (String(o.v) === String(c.valor) ? " selected" : "") +
            ">" + escapar(o.r) + "</option>";
        }).join("") + "</select>";
    } else if (c.tipo === "textarea") {
      entrada = '<textarea class="input adm-input adm-textarea" id="' + id + '" data-campo="' + c.id +
        '" rows="3" maxlength="400">' + escapar(c.valor || "") + "</textarea>";
    } else {
      entrada = '<input class="input adm-input" id="' + id + '" data-campo="' + c.id +
        '" type="' + (c.tipo === "number" ? "number" : "text") + '"' +
        (c.min !== undefined ? ' min="' + c.min + '"' : "") +
        (c.max !== undefined ? ' max="' + c.max + '"' : "") +
        ' maxlength="200" value="' + escapar(c.valor == null ? "" : c.valor) + '">';
    }
    return '<div><label class="adm-label" for="' + id + '">' + escapar(c.rotulo) + "</label>" + entrada +
      (c.dica ? '<p class="adm-dica">' + escapar(c.dica) + "</p>" : "") + "</div>";
  }

  return { iniciarLogin: iniciarLogin, iniciarPainel: iniciarPainel };
})();
