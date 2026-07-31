# -*- coding: utf-8 -*-
"""Gera o site estático da AEUMA em apps/site/ (monorepo)."""
import os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Sem isto o console do Windows (cp1252) quebra ao imprimir acento ou "✓".
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

from theme import CSS
import shell
from shell import (head, header, footer, FAVICON_SVG, ICONE_CLARO_SVG, ICONE_ESCURO_SVG,
                   LOGO_FULL_SVG, LOGO_VERTICAL_SVG, LOGO_WHITE_SVG, SIMBOLO_MONO_SVG)
import pages_a as A
import pages_b as B

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = os.path.join(RAIZ, "apps", "site")
ASSETS = os.path.join(OUT, "assets")
os.makedirs(ASSETS, exist_ok=True)

# (arquivo gerado, URL pública, título, descrição, função)
# O servidor entrega "/itinerarios" a partir de "itinerarios.html" e redireciona
# os endereços com .html para a versão limpa — ver apps/api/src/servidor.js.
PAGES = [
    ("index.html", "/", "AEUMA — Associação dos Estudantes Universitários de Angatuba/SP",
     "Transporte universitário organizado por estudantes de Angatuba/SP: as linhas, os destinos e as contas abertas mês a mês.",
     A.home),
    ("itinerarios.html", "/itinerarios", "Itinerários — AEUMA",
     "Horários, destinos e instituições atendidas por cada linha da AEUMA em Angatuba/SP.",
     A.itinerarios),
    ("diretoria.html", "/diretoria", "Diretoria — AEUMA",
     "Conheça a diretoria executiva, tesouraria, secretaria e conselho fiscal da AEUMA.",
     A.diretoria),
    ("calculos-mensais.html", "/calculos-mensais", "Cálculos Mensais — AEUMA",
     "Demonstrativos mensais do rateio do transporte universitário da AEUMA, por ano.",
     B.calculos),
    ("transparencia.html", "/transparencia", "Portal da Transparência — AEUMA",
     "Contratos, prestações de contas, termos de fomento e normas internas da AEUMA, com acesso livre.",
     B.transparencia),
    ("estatuto.html", "/estatuto", "Estatuto Social — AEUMA",
     "Estatuto Social da Associação dos Estudantes Universitários do Município de Angatuba/SP.",
     B.estatuto),
    ("identidade.html", "/identidade", "Identidade visual — AEUMA",
     "Sistema de marca da AEUMA: símbolo, paleta, tipografia e componentes.",
     B.identidade),
]


def build():
    for fname, rota, title, desc, fn in PAGES:
        html = head(title, desc, rota) + header(rota) + fn() + footer()
        with open(os.path.join(OUT, fname), "w", encoding="utf-8") as f:
            f.write(html)
        print("  ✓", f"{rota:<20}", f"({len(html)//1024} KB)")

    # folha de estilo isolada (para o dev trocar por <link> se preferir)
    with open(os.path.join(ASSETS, "aeuma.css"), "w", encoding="utf-8") as f:
        f.write(CSS.strip() + "\n")

    simbolo = FAVICON_SVG.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ')
    marcas = {
        "simbolo-aeuma.svg": simbolo,
        "favicon.svg": simbolo,
        "logo-aeuma.svg": LOGO_FULL_SVG,
        "logo-aeuma-branco.svg": LOGO_WHITE_SVG,
        "logo-aeuma-vertical.svg": LOGO_VERTICAL_SVG,
        "simbolo-aeuma-mono.svg": SIMBOLO_MONO_SVG,
        "icone-app-claro.svg": ICONE_CLARO_SVG,
        "icone-app-escuro.svg": ICONE_ESCURO_SVG,
    }
    for nome, conteudo in marcas.items():
        with open(os.path.join(ASSETS, nome), "w", encoding="utf-8") as f:
            f.write(conteudo)
    print(f"  ✓ assets/ (css + {len(marcas)} svg da marca)")


if __name__ == "__main__":
    print("Gerando site AEUMA…")
    build()
    print("Pronto:", os.path.realpath(OUT))
