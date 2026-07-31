# Implantação na VPS

Passo a passo para colocar o site, o painel e a API no ar depois de clonar o repositório.
Escrito para **Ubuntu/Debian + nginx**, com o Node servindo em `127.0.0.1:3000` e o nginx
cuidando do domínio e do HTTPS.

> **Python não é necessário na VPS.** O HTML de `apps/site/` é versionado. O Python só entra
> se você for regerar o site (`npm run gerar-site`) — o que é feito na máquina de
> desenvolvimento, não em produção.

---

## 1. Node 20 ou mais novo

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git
node -v    # precisa ser v20 ou maior
```

## 2. Clonar

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone SEU_REPOSITORIO aeuma
sudo chown -R $USER:$USER /var/www/aeuma
cd /var/www/aeuma
```

## 3. Instalar as dependências

```bash
npm ci --omit=dev
```

`npm ci` respeita o `package-lock.json` — é o comando certo em servidor. O projeto não tem
dependências de desenvolvimento, então `--omit=dev` só reforça a intenção.

## 4. Criar o `.env`

```bash
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
nano .env
```

Preencha assim:

```ini
PORTA=3000
NODE_ENV=production
JWT_SEGREDO=cole-aqui-o-valor-gerado-no-comando-acima
ADMIN_EMAIL=diretoria@aeuma.com
ADMIN_NOME=Diretoria AEUMA
ADMIN_SENHA=uma-senha-forte-que-voce-vai-trocar-no-primeiro-acesso
UPLOAD_MAX_MB=25
```

Com `NODE_ENV=production` o servidor **se recusa a subir sem `JWT_SEGREDO`** — é proposital.

## 5. Primeira execução (cria o banco e a conta)

```bash
npm start
```

O terminal imprime as credenciais do administrador. Anote e encerre com `Ctrl+C`.

## 6. Pasta de dados e permissões

O serviço roda como `www-data` e precisa escrever em `data/` — e **essa pasta precisa existir
antes de o systemd subir o serviço**, senão a proteção de sistema de arquivos falha com
`status=226/NAMESPACE`:

```bash
sudo mkdir -p /var/www/aeuma/data/uploads/{calculos,transparencia,estatuto}
sudo chown -R www-data:www-data /var/www/aeuma/data
```

## 7. Serviço systemd

```bash
sudo nano /etc/systemd/system/aeuma.service
```

```ini
[Unit]
Description=AEUMA — site, painel e API
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/aeuma
ExecStart=/usr/bin/node apps/api/src/servidor.js
Restart=always
RestartSec=5

# NÃO declare NODE_ENV aqui. O dotenv não sobrescreve variável que já veio do
# ambiente, então uma linha "Environment=NODE_ENV=..." tornaria o .env inútil —
# e trocar o modo no .env não teria efeito nenhum.

# o processo só precisa escrever na pasta de dados
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
# o "-" evita o erro 226/NAMESPACE se a pasta ainda não existir;
# o erro passa a aparecer no log da aplicação, que é bem mais legível
ReadWritePaths=-/var/www/aeuma/data

[Install]
WantedBy=multi-user.target
```

Confira o caminho do Node com `which node` e ajuste o `ExecStart` se for diferente.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now aeuma
sudo systemctl status aeuma
curl -s localhost:3000/api/saude     # deve responder {"ok":true,"versao":1}
```

### Testar pelo IP, antes de ter o domínio

O servidor escuta em todas as interfaces, então basta liberar a porta — no firewall do Ubuntu
**e** no painel do provedor (são camadas independentes):

```bash
sudo ufw allow 3000/tcp
sudo ss -tlnp | grep 3000     # precisa mostrar *:3000, não 127.0.0.1:3000
```

Acesse `http://SEU_IP:3000`.

> **O painel não deixa entrar por HTTP.** Com `NODE_ENV=production` o cookie de sessão é
> `secure`, e o navegador não o envia sem HTTPS: a tela de login aceita a senha e volta para
> si mesma. Enquanto testa pelo IP, mude para `NODE_ENV=development` no `.env` e reinicie o
> serviço — e **volte para `production` assim que o certificado estiver instalado**.

Terminado o teste, feche a porta nos dois lugares:

```bash
sudo ufw delete allow 3000/tcp
```

## 8. nginx

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/aeuma
```

```nginx
server {
    listen 80;
    server_name aeuma.com.br www.aeuma.com.br;

    # OBRIGATÓRIO: o padrão do nginx é 1 MB e derrubaria os envios de PDF
    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/aeuma /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

`client_max_body_size` precisa ser maior que o `UPLOAD_MAX_MB` do `.env`.
`X-Forwarded-For` é o que faz o bloqueio por tentativas de login enxergar o IP real.

## 9. HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d aeuma.com.br -d www.aeuma.com.br
```

> **Sem HTTPS o login do painel não funciona.** Em produção o cookie de sessão é marcado como
> `secure`, e o navegador simplesmente não o envia em HTTP. O sintoma é a tela de login
> aceitar a senha e voltar para ela mesma. Instale o certificado antes de testar o painel.

## 10. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

A porta 3000 **não** deve ficar aberta — quem fala com o mundo é o nginx.

---

## Depois de publicar

### Primeiro acesso

Entre em `https://seudominio/admin/`, faça login e troque a senha na aba **Conta**.

### Atualizar o site

```bash
cd /var/www/aeuma
git pull
npm ci --omit=dev
sudo chown -R www-data:www-data data     # o git roda como root e pode trocar o dono
sudo systemctl restart aeuma
```

O `chown` não é opcional: sem ele o envio de arquivos passa a falhar com `EACCES`.

### Criar contas para outras pessoas

```bash
cd /var/www/aeuma
sudo -u www-data npm run criar-admin -- --email tesouraria@aeuma.com --nome "Tesouraria"
```

Pode rodar com o serviço no ar: o servidor percebe a alteração e recarrega sozinho.

### Backup

Tudo o que importa está em `data/` — banco e arquivos enviados:

```bash
tar czf /root/aeuma-$(date +%F).tar.gz -C /var/www/aeuma data
```

Para um backup diário às 3h:

```bash
sudo crontab -e
```

```cron
0 3 * * * tar czf /root/backups/aeuma-$(date +\%F).tar.gz -C /var/www/aeuma data
```

### Ver o que está acontecendo

```bash
sudo journalctl -u aeuma -f          # log do servidor, ao vivo
sudo systemctl restart aeuma         # reiniciar
sudo systemctl status aeuma          # estado
```

---

## Se algo der errado

Confira o modo em que o serviço está rodando — a primeira linha do log diz:

```bash
sudo journalctl -u aeuma -n 30 --no-pager | grep "modo"
```

| Sintoma | Causa provável |
|---|---|
| `status=226/NAMESPACE`, serviço em `activating (auto-restart)` | A pasta `data/` não existe — refaça o passo 6 e reinicie |
| Login aceita a senha e volta para a tela de login | Falta HTTPS (cookie `secure`) |
| Trocar `NODE_ENV` no `.env` não muda nada | Sobrou `Environment=NODE_ENV=` na unidade systemd — apague a linha |
| `413 Request Entity Too Large` ao enviar PDF | `client_max_body_size` no nginx |
| Serviço não sobe, log fala em `JWT_SEGREDO` | Variável ausente no `.env` |
| `EADDRINUSE` na porta 3000 | Outra instância rodando — `sudo systemctl stop aeuma` |
| `EACCES` ou "permissão negada" ao publicar arquivo | `data/` não pertence ao `www-data` — comum depois de um `git pull` feito como root |
| Páginas abrem mas as listas ficam vazias com aviso | O Node caiu; veja `journalctl -u aeuma` |
