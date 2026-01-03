#!/usr/bin/env bash
set -euo pipefail

# Load deployment configuration
if [ ! -f ".deploy.config" ]; then
  echo "Error: .deploy.config file not found!"
  echo "Please create .deploy.config with HOST and APP_DIR variables."
  exit 1
fi

source .deploy.config

echo "Building locally..."
npm ci
npm run build

echo "Syncing to server..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='src' \
  --exclude='.gitignore' \
  --exclude='README.md' \
  --exclude='PLAN.md' \
  --exclude='AGENTS.md' \
  --exclude='vite.config.js' \
  --exclude='public' \
  --exclude='package-lock.json' \
  dist \
  package.json \
  "$HOST:$APP_DIR/"

echo "Installing serve and restarting application..."
ssh -o StrictHostKeyChecking=accept-new "$HOST" 'bash -lc '"'"'
  set -euo pipefail
  cd "'"$APP_DIR"'"
  npm install -g serve 2>/dev/null || true
  pm2 restart tictactoe-3d || pm2 start "serve -s dist -l 5173" --name tictactoe-3d
  pm2 save
'"'"

echo "Deployed!"

