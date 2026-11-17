#!/bin/bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
command -v node >/dev/null 2>&1 || fail "Node.js not found. Install Node.js 20+ before continuing."
command -v npm >/dev/null 2>&1 || fail "npm not found. Install Node.js 20+ before continuing."
node_major="$(node -p 'process.versions.node.split(".")[0]')"
if (( node_major < 20 )); then
  fail "Node.js 20+ is required; detected $(node --version)."
fi
info "Node $(node --version), npm $(npm --version)"
info "Install project dependencies"
if [[ -f package-lock.json ]]; then
  echo "Using npm ci for a lockfile-based, reproducible install."
  npm ci
else
  echo "No package-lock.json found; using npm install."
  npm install
fi
if command -v aem >/dev/null 2>&1; then
  info "AEM CLI already installed: $(aem --version 2>/dev/null || true)"
else
  echo
  if confirm "Install Adobe AEM CLI globally with npm?"; then
    npm install -g @adobe/aem-cli
  else
    echo "Skipped. Install later with: npm install -g @adobe/aem-cli"
  fi
fi
info "Setup complete"
