# -*- coding: utf-8 -*-
"""Rasteriza os PNG da marca (favicon, ícone de app e imagem social) a partir dos SVG.

Usa o Chrome/Edge em modo headless — só precisa rodar quando a marca mudar:

    python tools/gerador/icones.py

Os SVG continuam sendo a fonte da verdade; os PNG existem por causa do iOS e do
Android, que não aceitam SVG em apple-touch-icon nem no manifesto.
"""
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

from shell import CAPELO, FONTE_APOIO, FONTE_LOGO, gradiente

RAIZ = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
ASSETS = os.path.join(RAIZ, "apps", "site", "assets")

NAVEGADORES = [
    os.environ.get("CHROME", ""),
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]


def achar_navegador():
    for caminho in NAVEGADORES:
        if caminho and os.path.exists(caminho):
            return caminho
    return None


def simbolo_svg(raio):
    """Símbolo em caixa 48×48. raio=0 gera quadrado cheio (exigido pelo iOS)."""
    return (f'<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">'
            f'<defs>{gradiente("i")}</defs>'
            f'<rect width="48" height="48" rx="{raio}" fill="url(#ig)"/>{CAPELO}</svg>')


def pagina(conteudo, largura, altura, fundo="transparent"):
    return f'''<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@600;700&display=swap" rel="stylesheet">
<style>html,body{{margin:0;padding:0;background:{fundo};width:{largura}px;height:{altura}px;overflow:hidden}}
/* só o SVG solto ocupa a página inteira; peças compostas cuidam do próprio tamanho */
body>svg{{display:block;width:{largura}px;height:{altura}px}}</style></head><body>{conteudo}</body></html>'''


SOCIAL = f'''<div style="width:1200px;height:630px;background:linear-gradient(150deg,#062A47 0%,#083A5F 55%,#0A4C7C 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Inter,sans-serif">
  <div style="width:150px;height:150px">{simbolo_svg(13)}</div>
  <div style="font-family:{FONTE_LOGO};font-weight:700;font-size:88px;letter-spacing:10px;color:#fff;margin-top:40px">AEUMA</div>
  <div style="display:flex;align-items:center;gap:22px;margin-top:26px">
    <span style="width:60px;height:1px;background:#3A9BE0"></span>
    <span style="font-family:{FONTE_APOIO};font-size:19px;letter-spacing:3px;color:#C6DAEA;font-weight:600">
      ESTUDANTES UNIVERSITÁRIOS · ANGATUBA/SP</span>
    <span style="width:60px;height:1px;background:#3A9BE0"></span>
  </div>
</div>'''

# (arquivo, largura, altura, html, fundo)
ARQUIVOS = [
    ("favicon-16.png", 16, 16, simbolo_svg(13), "transparent"),
    ("favicon-32.png", 32, 32, simbolo_svg(13), "transparent"),
    ("favicon-48.png", 48, 48, simbolo_svg(13), "transparent"),
    ("apple-touch-icon.png", 180, 180, simbolo_svg(0), "#083A5F"),
    ("icone-192.png", 192, 192, simbolo_svg(0), "#083A5F"),
    ("icone-512.png", 512, 512, simbolo_svg(0), "#083A5F"),
    ("og-aeuma.png", 1200, 630, SOCIAL, "#062A47"),
]


def gerar():
    navegador = achar_navegador()
    if not navegador:
        print("Chrome ou Edge não encontrado. Defina a variável CHROME com o caminho do executável.")
        return 1

    os.makedirs(ASSETS, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for nome, largura, altura, conteudo, fundo in ARQUIVOS:
            html = os.path.join(tmp, nome + ".html")
            with open(html, "w", encoding="utf-8") as f:
                f.write(pagina(conteudo, largura, altura, fundo))

            destino = os.path.join(ASSETS, nome)
            subprocess.run([
                navegador, "--headless", "--disable-gpu", "--hide-scrollbars",
                "--default-background-color=00000000",
                f"--window-size={largura},{altura}",
                f"--screenshot={destino}",
                "--virtual-time-budget=3000",
                "file:///" + html.replace("\\", "/"),
            ], check=False, capture_output=True, timeout=120)

            ok = os.path.exists(destino)
            print(("  ✓ " if ok else "  ✗ ") + nome, f"({largura}×{altura})")
    return 0


if __name__ == "__main__":
    print("Gerando PNG da marca…")
    sys.exit(gerar())
