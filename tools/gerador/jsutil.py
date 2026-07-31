# -*- coding: utf-8 -*-
"""Trechos de JavaScript compartilhados pelas páginas que leem a API."""

import json

from shell import I


def icones_js(*chaves):
    """Expõe ao JS os ícones usados na montagem das listas."""
    return "<script>var ICO=" + json.dumps({k: I[k] for k in chaves}) + ";</script>"


# Utilidades disponíveis para todos os scripts de página.
JS_COMUM = r"""
function escHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function buscarApi(caminho){
  return fetch(caminho,{headers:{'Accept':'application/json'}}).then(function(r){
    if(!r.ok) throw new Error('falha'); return r.json();});
}
function mostrarFalha(id){
  var el=document.getElementById(id||'falha');
  if(el) el.classList.remove('is-hidden');
}
function preencherNumeros(totais){
  Object.keys(totais||{}).forEach(function(chave){
    Array.prototype.forEach.call(document.querySelectorAll('[data-num="'+chave+'"]'),function(el){
      el.textContent=totais[chave];
    });
  });
}
"""


def abrir_script():
    return "<script>\n(function(){\n" + JS_COMUM


FECHA_SCRIPT = "\n})();\n</script>"
