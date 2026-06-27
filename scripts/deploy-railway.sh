#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f bin/railway ]; then
  echo "Downloading Railway CLI..."
  mkdir -p bin
  curl -fsSL -o /tmp/railway.tgz \
    "https://github.com/railwayapp/cli/releases/download/v5.23.1/railway-v5.23.1-aarch64-apple-darwin.tar.gz"
  tar -xzf /tmp/railway.tgz -C bin
  chmod +x bin/railway
fi

RAILWAY="./bin/railway"

if ! $RAILWAY whoami &>/dev/null; then
  echo "Log in to Railway first:"
  $RAILWAY login
fi

if [ ! -f .railway/project.json ]; then
  echo "Creating Railway project..."
  $RAILWAY init --name seo-audit-agent
fi

echo "Deploying to Railway..."
$RAILWAY up --detach

echo ""
echo "Set environment variables (optional, for AI recommendations):"
echo "  $RAILWAY variables set OPENAI_API_KEY=sk-..."
echo ""
echo "Generate public URL:"
echo "  $RAILWAY domain"
