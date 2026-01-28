#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PORT_RANGE="${PORT_RANGE:-3000-3002}"

echo "==> Killing listeners on ports ${PORT_RANGE}"
PIDS="$(lsof -tiTCP:${PORT_RANGE} -sTCP:LISTEN || true)"
if [[ -n "${PIDS}" ]]; then
  echo "${PIDS}" | xargs kill -9 || true
else
  echo "No listeners found on ${PORT_RANGE}"
fi

echo "==> Rebuilding"
pnpm build

echo "==> Starting dev (API:3002, BFF:3001, WEB:3000)"
pnpm dev
