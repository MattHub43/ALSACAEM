#!/bin/bash
# Common location, output, and dependency helpers.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
if [[ ! -d .git || ! -f package.json ]]; then
  echo "ERROR: This toolkit must be placed in the root of a cloned EDS Git repository." >&2
  exit 1
fi
if [[ -f "$REPO_ROOT/dev-tools/config.sh" ]]; then
  # Not a secret file. Configuration is intentionally local project metadata.
  # shellcheck disable=SC1091
  source "$REPO_ROOT/dev-tools/config.sh"
fi
info() { printf '\n==> %s\n' "$*"; }
fail() { echo "ERROR: $*" >&2; exit 1; }
confirm() {
  local prompt="${1:-Continue?}" answer
  read -r -p "$prompt [y/N]: " answer
  [[ "$answer" == "y" || "$answer" == "Y" || "$answer" == "yes" || "$answer" == "YES" ]]
}
