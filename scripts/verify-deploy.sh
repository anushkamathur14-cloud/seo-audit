#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="${ROOT}/.npm-cache"
TMP="${TMPDIR:-/tmp}/seo-audit-verify-$$"

echo "==> 1/4  npm ci --include=dev (Docker deps stage)"
mkdir -p "$TMP/deps"
cp "$ROOT/package.json" "$ROOT/package-lock.json" "$ROOT/.npmrc" "$TMP/deps/"
(cd "$TMP/deps" && npm ci --include=dev --cache "$CACHE" --no-audit --no-fund)

echo "==> 2/4  npm run build (Docker builder stage)"
cp -R "$ROOT"/{app,components,lib,public,next.config.ts,tsconfig.json,postcss.config.mjs,eslint.config.mjs,next-env.d.ts} "$TMP/deps/" 2>/dev/null || true
cp -R "$ROOT/app" "$ROOT/components" "$ROOT/lib" "$ROOT/public" "$TMP/deps/"
cp "$ROOT/next.config.ts" "$ROOT/tsconfig.json" "$ROOT/postcss.config.mjs" "$ROOT/next-env.d.ts" "$TMP/deps/"
(cd "$TMP/deps" && npm run build)

echo "==> 3/4  npm ci --omit=dev (Docker runner stage)"
mkdir -p "$TMP/runner"
cp "$ROOT/package.json" "$ROOT/package-lock.json" "$ROOT/.npmrc" "$TMP/runner/"
(cd "$TMP/runner" && npm ci --omit=dev --cache "$CACHE" --no-audit --no-fund)

echo "==> 4/4  Verify runtime deps present"
for pkg in next playwright lighthouse cheerio chrome-launcher openai; do
  test -d "$TMP/runner/node_modules/$pkg" || { echo "Missing runtime dep: $pkg"; exit 1; }
done

rm -rf "$TMP"
echo ""
echo "All pre-deploy checks passed."
