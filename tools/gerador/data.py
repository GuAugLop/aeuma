# -*- coding: utf-8 -*-
"""Dados que o gerador ainda precisa em tempo de build.

Quase tudo migrou para o banco (data/db.json), editável no painel administrativo:
itinerários, diretoria, estatuto, cálculos mensais e documentos da transparência.
A carga inicial fica em apps/api/src/catalogo.js.

Só sobram aqui os rótulos que o HTML precisa ter prontos antes de a API responder.
"""

# As categorias montam os botões de filtro da página de Transparência e precisam
# continuar iguais às de apps/api/src/catalogo.js.
CATEGORIAS = [
    ("todos", "Todos os documentos"),
    ("contas", "Prestações de contas"),
    ("contratos", "Contratos"),
    ("termos", "Termos e planos de trabalho"),
    ("atas", "Atas"),
    ("normas", "Normas internas"),
]
