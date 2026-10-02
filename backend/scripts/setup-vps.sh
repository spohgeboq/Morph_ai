#!/usr/bin/env bash
# ================================================================
# MorphAI VPS Initial Setup & Deployment Script
# Target: Ubuntu 24.04 LTS (IP: 91.201.215.21)
# Domain: api.morph-ai.asia
# ================================================================

set -e

echo "🚀 [MorphAI] Начало настройки сервера api.morph-ai.asia..."

# 1. Обновление пакетов системы
echo "📦 Обновление пакетов..."
sudo apt update && sudo apt upgrade -y

# 2. Установка необходимых утилит
sudo apt install -y curl wget git ufw nginx certbot python3-certbot-nginx postgresql postgresql-contrib

# 3. Установка Node.js 20 LTS
if ! command -v node &> /dev/null; then
    echo "📦 Установка Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "✓ Node.js $(node -v) и NPM $(npm -v) установлены"

# 4. Установка PM2 для автозапуска бэкенда
if ! command -v pm2 &> /dev/null; then
    echo "📦 Установка PM2..."
    sudo npm install -g pm2
fi

# 5. Настройка PostgreSQL
echo "🐘 Проверка базы данных PostgreSQL..."
sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN CREATE ROLE postgres WITH SUPERUSER LOGIN PASSWORD 'nurka12'; ELSE ALTER ROLE postgres WITH PASSWORD 'nurka12'; END IF; END \$\$;" || true
sudo -u postgres psql -c "CREATE DATABASE morphi_ai_db;" || true

# 6. Настройка Nginx
echo "🌐 Настройка Nginx для api.morph-ai.asia..."
sudo tee /etc/nginx/sites-available/morph-ai.conf > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name api.morph-ai.asia;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/morph-ai.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 7. Настройка брандмауэра UFW
echo "🛡️ Настройка фаервола UFW..."
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true
sudo ufw --force enable || true

echo ""
echo "✅ Базовая настройка завершена!"
echo "➡️ Для получения бесплатного SSL-сертификата выполните:"
echo "   sudo certbot --nginx -d api.morph-ai.asia --non-interactive --agree-tos -m support@morph-ai.asia"
echo ""
