#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="${ROOT}/.npm-cache"
TMP="${TMPDIR:-/tmp}/seo-audit-verify-$$"

echo "==> 1/4  npm install --include=dev (Docker deps stage)"
mkdir -p "$TMP/deps"
cp "$ROOT/package.json" "$ROOT/.npmrc" "$TMP/deps/"
(cd "$TMP/deps" && npm install --include=dev --omit=optional --cache "$CACHE" --no-audit --no-fund)

echo "==> 2/4  npm run build (Docker builder stage)"
cp -R "$ROOT/app" "$ROOT/components" "$ROOT/lib" "$ROOT/public" "$TMP/deps/"
cp "$ROOT/next.config.ts" "$ROOT/tsconfig.json" "$ROOT/postcss.config.mjs" "$ROOT/next-env.d.ts" "$TMP/deps/"
(cd "$TMP/deps" && npm run build)

echo "==> 3/4  npm prune --omit=dev (Docker runner stage)"
mkdir -p "$TMP/runner"
cp "$ROOT/package.json" "$ROOT/.npmrc" "$TMP/runner/"
cp -R "$TMP/deps/node_modules" "$TMP/runner/node_modules"
(cd "$TMP/runner" && npm prune --omit=dev)

echo "==> 4/4  Verify runtime deps present"
for pkg in next playwright lighthouse cheerio chrome-launcher openai; do
  test -d "$TMP/runner/node_modules/$pkg" || { echo "Missing runtime dep: $pkg"; exit 1; }
done

for pkg in typescript eslint tailwindcss; do
  if test -d "$TMP/runner/node_modules/$pkg"; then
    echo "Dev dep should have been pruned: $pkg"
    exit 1
  fi
done

rm -rf "$TMP"
echo ""
echo "All pre-deploy checks passed."
