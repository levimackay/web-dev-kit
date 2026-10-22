#!/usr/bin/env bash
# Installs the web dev kit's plugins and skills for Claude Code.
# Usage: install.sh [--extras] [--dry-run] [--yes]
#   --extras   also install 3D (three.js), React motion, scroll-craft, diagrams, video tools and 67 style skills
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

skills vercel-labs/agent-skills#063bee94c3f4df8453406c830b0a7df0f2860278 web-design-guidelines vercel-composition-patterns vercel-react-view-transitions
skills leonxlnx/taste-skill#6010f91a9935f1c167dfc500fb1a475681892e6b design-taste-frontend
skills nextlevelbuilder/ui-ux-pro-max-skill#076a2b3a31394ad788afaa71f55d0bf789e7b3ec ui-ux-pro-max
skills coreyhaines31/marketingskills#e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b copywriting cro
skills AgriciDaniel/claude-seo#6be93f45064ffbadced572b5d5c95f55fd263af0 seo-local seo-schema seo-technical
skills nucliweb/webperf-snippets#bc853751e9b8d57f75268753efa17a0e4bd70802 webperf webperf-core-web-vitals webperf-interaction webperf-loading webperf-media webperf-resources
skills emilkowalski/skills#2d228630ba1446365f614a108cb8252f1feda202 review-animations animation-performance break-ui mobile-native
skills microsoft/playwright-cli#b1a5903c5b633b8c9f843ad7b629c2a78437040c playwright-cli
skills jakubkrehel/skills#4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63 better-typography better-colors better-layout better-ui better-accessibility better-writing interface-review
skills ibelick/ui-skills#55363c305097d4c84487bd5f323d29b3f067bf72 baseline-ui fixing-accessibility fixing-motion-performance fixing-metadata
skills Nutlope/hallmark#7ec868225c6caa040558c321ee0fefa0e73f83a8 hallmark
skills blader/humanizer#8c307f367c91bd974002f10f2be2965d642c13df humanizer
skills meodai/skill.color-expert#5bf7c7704d56bccc6aeea38c36bcf449abe56a6c color-expert
skills GoogleChrome/modern-web-guidance#65e7edd67e77420eaf02c5df00fdc0521417d809 modern-web-guidance

if [ "$extras" = 1 ]; then
  plugin latent-spaces/brag#v0.3.0 brag@brag
  plugin textura-agency/getlayers-plugin getlayers@getlayers
  skills remotion-dev/skills#6c67adcd9cdbe6eb84d76342da89b225f9161cb2 '*'
  skills heygen-com/hyperframes#1cf4975d2f6fc58d148561c1e682eb8667bf1c55 hyperframes hyperframes-cli hyperframes-registry media-use
  skills CloudAI-X/threejs-skills#0e181866f095b5f06d005133876e926515390d95 '*'
  skills affaan-m/ECC#90606c8315ee09cafc303515c5f33024db6b9882 motion-foundations motion-patterns motion-advanced
  skills nateherkai/scroll-craft#75d81f74e83692add18cd7a8a8e078b8a887a579 scroll-craft
  skills cathrynlavery/diagram-design#7a12007b5a4246894f342a2e52e78facbc62eca3 diagram-design
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
