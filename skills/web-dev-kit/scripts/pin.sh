#!/usr/bin/env bash
# Moves every commit pin in install.sh to the current head of that repo, so the new versions can be reviewed in one diff.
set -eu
cd "$(dirname "$0")/.."
grep -oE '[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+#[0-9a-f]{40}' install.sh | sort -u | while IFS='#' read -r repo old; do
  new=$(git ls-remote "https://github.com/$repo" HEAD | cut -f1)
  [ ${#new} -eq 40 ] || { echo "could not read $repo, left it at ${old:0:7}" >&2; continue; }
  [ "$new" = "$old" ] && continue
  perl -pi -e "s/$old/$new/g" install.sh
  echo "$repo ${old:0:7} -> ${new:0:7}"
done
