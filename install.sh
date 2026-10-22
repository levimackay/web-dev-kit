#!/usr/bin/env bash
# Installs the web dev kit's plugins and skills for Claude Code.
# Usage: install.sh [--extras] [--dry-run] [--yes]
#   --extras   also install video tools (Remotion, HyperFrames, brag), GetLayers and 67 style skills
#   --dry-run  print what would be installed and stop
#   --yes      install without asking first
set -u

extras=0
dry=0
yes=0
for arg in "$@"; do
  case "$arg" in
    --extras) extras=1 ;;
    --dry-run) dry=1 ;;
    --yes) yes=1 ;;
    -h|--help) sed -n '2,6p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

skills_cli="skills@1.7.4"
plan=()

plugin() {
  plan+=("plugin	$1	$2")
}

skills() {
  local source=$1
  shift
  plan+=("skills	$source	$*")
}

official=anthropics/claude-plugins-official
for p in frontend-design vercel supabase chrome-devtools-mcp code-review pr-review-toolkit feature-dev code-simplifier claude-security; do
  plugin "$official" "$p@claude-plugins-official"
done
plugin pbakaus/impeccable#skill-v4.7.0 impeccable@impeccable
plugin greensock/gsap-skills gsap-skills@gsap-skills
plugin addyosmani/web-quality-skills web-quality-skills@addy-web-quality-skills

skills vercel-labs/agent-skills#063bee94c3f4df8453406c830b0a7df0f2860278 web-design-guidelines vercel-composition-patterns
skills leonxlnx/taste-skill#6010f91a9935f1c167dfc500fb1a475681892e6b design-taste-frontend
skills nextlevelbuilder/ui-ux-pro-max-skill#076a2b3a31394ad788afaa71f55d0bf789e7b3ec ui-ux-pro-max
skills coreyhaines31/marketingskills#e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b copywriting cro
skills AgriciDaniel/claude-seo#6be93f45064ffbadced572b5d5c95f55fd263af0 seo-local seo-schema seo-technical
skills nucliweb/webperf-snippets#bc853751e9b8d57f75268753efa17a0e4bd70802 webperf webperf-core-web-vitals webperf-interaction webperf-loading webperf-media webperf-resources
skills emilkowalski/skills#2d228630ba1446365f614a108cb8252f1feda202 review-animations animation-performance break-ui mobile-native
skills microsoft/playwright-cli#b1a5903c5b633b8c9f843ad7b629c2a78437040c playwright-cli

if [ "$extras" = 1 ]; then
  plugin latent-spaces/brag#v0.3.0 brag@brag
  plugin textura-agency/getlayers-plugin getlayers@getlayers
  skills remotion-dev/skills#6c67adcd9cdbe6eb84d76342da89b225f9161cb2 '*'
  skills heygen-com/hyperframes#1cf4975d2f6fc58d148561c1e682eb8667bf1c55 hyperframes hyperframes-cli hyperframes-registry media-use
  skills bergside/awesome-design-skills#f631a09b4fcc0166f2e2c1a8c81906ef680c57e8 '*'
fi

echo "This installs:"
for entry in "${plan[@]}"; do
  IFS=$'\t' read -r kind source what <<<"$entry"
  case "$source" in
    *#*) pin="pinned to ${source#*#}" ;;
    *) pin="latest" ;;
  esac
  [ "$what" = "*" ] && what="every skill in the repo"
  printf '  %-7s %-58s from %s (%s)\n' "$kind" "$what" "${source%%#*}" "${pin:0:22}"
done
echo

[ "$dry" = 1 ] && exit 0

for cmd in claude npx git; do
  command -v "$cmd" >/dev/null || { echo "missing $cmd, install it and rerun" >&2; exit 1; }
done

if [ "$yes" = 0 ]; then
  if [ ! -t 0 ]; then
    echo "Not a terminal, so nothing was installed. Rerun with --yes once the list above looks right." >&2
    exit 1
  fi
  read -r -p "Install all of this? [y/N] " answer
  case "$answer" in
    y|Y|yes) ;;
    *) echo "Nothing installed."; exit 0 ;;
  esac
fi

failed=()
added=" "

run() {
  echo "+ $*"
  "$@" || failed+=("$*")
}

add_marketplace() {
  local repo=${1%%#*}
  case "$added" in *" $repo "*) return 0 ;; esac
  added="$added$repo "
  if claude plugin marketplace list 2>/dev/null | grep -q "($repo[@)]"; then
    echo "= marketplace $repo already added"
    return 0
  fi
  run claude plugin marketplace add "$1"
}

for entry in "${plan[@]}"; do
  IFS=$'\t' read -r kind source what <<<"$entry"
  if [ "$kind" = plugin ]; then
    add_marketplace "$source"
    run claude plugin install "$what"
  else
    read -r -a names <<<"$what"
    run npx -y "$skills_cli" add "$source" -g -a claude-code -y --skill "${names[@]}"
  fi
done

echo
if [ ${#failed[@]} -gt 0 ]; then
  echo "These steps failed:"
  printf '  %s\n' "${failed[@]}"
  exit 1
fi
echo "Done. Restart Claude Code to load everything."
