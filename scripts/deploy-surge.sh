#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/design-system-sandbox/dist/design-system-sandbox"
DOMAIN="${SURGE_DOMAIN:-curinos-primeng-sandbox.surge.sh}"

echo "Building production bundle in Docker..."
docker compose -f "$ROOT/docker-compose.yml" run --rm ng bash -c "
  cd design-system-sandbox &&
  npm install &&
  npm run build -- --prod
"

if [[ ! -f "$DIST/index.html" ]]; then
  echo "Build output not found at $DIST" >&2
  exit 1
fi

echo "Adding SPA fallback (200.html)..."
cp "$DIST/index.html" "$DIST/200.html"

echo "Deploying to https://${DOMAIN} ..."
cd "$DIST"
npx --yes surge . "$DOMAIN"
