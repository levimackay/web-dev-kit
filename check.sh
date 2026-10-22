#!/usr/bin/env bash
# Renders a page at 1440, 768 and 390 and reports the defects described in rules/.
# Usage: check.sh <url or folder> [--src <folder>] [--external] [--json]
set -eu
here=$(cd "$(dirname "$0")" && pwd)
if [ ! -d "$here/check/node_modules" ]; then
  npm ci --prefix "$here/check" --silent --no-audit --no-fund
fi
exec node "$here/check/check.mjs" "$@"
