#!/usr/bin/env bash
# Shows which fonts a reference page really renders and what each font file says about its licence.
# Usage: fonts.sh <url>
set -eu
here=$(cd "$(dirname "$0")" && pwd)
if [ ! -d "$here/check/node_modules" ]; then
  npm ci --prefix "$here/check" --silent --no-audit --no-fund
fi
exec node "$here/check/fonts.mjs" "$@"
