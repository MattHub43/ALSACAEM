#!/bin/bash
# Mac-friendly launcher for EDS project utilities.
set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT" || exit 1

if [[ ! -d .git || ! -f package.json ]]; then
  echo "ERROR: Place 'EDS Toolkit.command' and 'dev-tools/' in your ALSACAEM repo root."
  echo "Expected to find both .git and package.json in: $ROOT"
  echo
  read -r -p "Press Enter to close..." _
  exit 1
fi

while true; do
  echo
  echo "========================================"
  echo "        ALSACAEM | EDS TOOLKIT"
  echo "========================================"
  echo "Repo: $ROOT"
  echo "Branch: $(git branch --show-current 2>/dev/null || true)"
  echo
  echo "1) Start local EDS (aem up)"
  echo "2) View Git status / changes"
  echo "3) Build XWalk config + run lint"
  echo "4) Commit and optionally push code"
  echo "5) Check EDS deployment URLs"
  echo "6) Pull latest changes (fast-forward only)"
  echo "7) One-time Node / AEM CLI setup"
  echo "8) Register Geo Hero in Universal Editor (if installed)"
  echo "0) Exit"
  echo
  read -r -p "Choose an option: " choice
  echo
  case "$choice" in
    1) bash dev-tools/start-eds.sh ;;
    2) bash dev-tools/git-status.sh ;;
    3) bash dev-tools/build-check.sh ;;
    4) bash dev-tools/git-commit-push.sh ;;
    5) bash dev-tools/verify-sync.sh ;;
    6) bash dev-tools/pull-latest.sh ;;
    7) bash dev-tools/setup.sh ;;
    8)
      if [[ -f scripts/register-geo-hero.py ]]; then
        python3 scripts/register-geo-hero.py || echo "Registration failed; review output above."
      else
        echo "No scripts/register-geo-hero.py found. Install the Geo Hero block package first."
      fi
      ;;
    0) exit 0 ;;
    *) echo "Unknown option." ;;
  esac
  echo
  read -r -p "Press Enter to return to the menu..." _
done
