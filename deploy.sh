#!/bin/bash
# Deploy know to a DigitalOcean droplet
# Usage: ./deploy.sh <droplet-ip>

set -e

IP=${1:?Usage: ./deploy.sh <droplet-ip>}
APP_DIR="/opt/know"

echo "Building locally..."
npm run build

echo "Syncing to $IP..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.svelte-kit' \
  --exclude='.git' \
  --exclude='.claude' \
  --exclude='know.db*' \
  . root@$IP:$APP_DIR/

echo "Installing and starting on server..."
ssh root@$IP << 'REMOTE'
set -e
cd /opt/know

# Install Node if needed
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# Install deps
npm ci --omit=dev

# Create data dir
mkdir -p /data

# Seed DB if it doesn't exist
if [ ! -f /data/know.db ]; then
  KNOW_DB_PATH=/data/know.db npx tsx seed.ts
fi

# Install Caddy if needed
if ! command -v caddy &>/dev/null; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
fi

# Setup systemd service
cat > /etc/systemd/system/know.service << 'EOF'
[Unit]
Description=know ontology wiki
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/know
Environment=NODE_ENV=production
Environment=KNOW_DB_PATH=/data/know.db
Environment=PORT=3000
ExecStart=/usr/bin/node build/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable know
systemctl restart know

echo "know is running on port 3000"
REMOTE

echo ""
echo "Done. Point knowww.net DNS to $IP"
echo "Then SSH in and configure Caddy:"
echo "  ssh root@$IP"
echo "  echo 'knowww.net { reverse_proxy localhost:3000 }' > /etc/caddy/Caddyfile"
echo "  systemctl restart caddy"
