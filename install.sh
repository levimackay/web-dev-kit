#!/usr/bin/env bash
# Installs the web dev kit's plugins and skills for Claude Code.
# Usage: install.sh [--extras] [--dry-run]
#   --extras   also install video tools (Remotion, HyperFrames, brag), GetLayers and 67 style skills
#   --dry-run  print the commands without running them
set -u

extras=0
dry=0
for arg in "$@"; do
  case "$arg" in
    --extras) extras=1 ;;
    --dry-run) dry=1 ;;
    -h|--help) sed -n '2,5p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

for cmd in claude npx git; do
  command -v "$cmd" >/dev/null || { echo "missing $cmd, install it and rerun" >&2; exit 1; }
done

failed=()

run() {
  echo "+ $*"
  [ "$dry" = 1 ] && return 0
  "$@" || failed+=("$*")
}

marketplace() {
  if [ "$dry" = 0 ] && claude plugin marketplace list 2>/dev/null | grep -q "($1)"; then
    echo "= marketplace $1 already added"
    return 0
  fi
  run claude plugin marketplace add "$1"
}

skills() {
  local repo=$1
  shift
  run npx -y skills add "$repo" -g -a claude-code -y --skill "$@"
}

marketplace anthropics/claude-plugins-official
for p in frontend-design vercel supabase chrome-devtools-mcp code-review pr-review-toolkit feature-dev code-simplifier claude-security; do
  run claude plugin install "$p@claude-plugins-official"
done

marketplace pbakaus/impeccable
run claude plugin install impeccable@impeccable
marketplace greensock/gsap-skills
run claude plugin install gsap-skills@gsap-skills
marketplace addyosmani/web-quality-skills
run claude plugin install web-quality-skills@addy-web-quality-skills

skills vercel-labs/agent-skills web-design-guidelines
skills leonxlnx/taste-skill design-taste-frontend
skills nextlevelbuilder/ui-ux-pro-max-skill ui-ux-pro-max
skills coreyhaines31/marketingskills copywriting cro
skills AgriciDaniel/claude-seo seo-local seo-schema seo-technical
skills nucliweb/webperf-snippets '*'
skills emilkowalski/skills review-animations
skills microsoft/playwright-cli playwright-cli

if [ "$extras" = 1 ]; then
  marketplace latent-spaces/brag
  run claude plugin install brag@brag
  marketplace textura-agency/getlayers-plugin
  run claude plugin install getlayers@getlayers
  skills remotion-dev/skills '*'
  skills heygen-com/hyperframes hyperframes hyperframes-cli hyperframes-registry media-use
  skills bergside/awesome-design-skills '*'
fi

echo
if [ ${#failed[@]} -gt 0 ]; then
  echo "These steps failed:"
  printf '  %s\n' "${failed[@]}"
  exit 1
fi
echo "Done. Restart Claude Code to load everything."
