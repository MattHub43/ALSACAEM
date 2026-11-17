#!/bin/bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
info "Start local Edge Delivery Services development"
if ! command -v node >/dev/null 2>&1; then
  fail "Node.js is missing. Install Node.js 20+ first, then choose option 7 in the toolkit."
fi
if ! command -v aem >/dev/null 2>&1; then
  echo "AEM CLI isn't installed. Run option 7 (One-time setup) first."
  exit 1
fi
echo "Starting local EDS preview at http://localhost:3000"
echo "Stop the server with Ctrl+C. This runs the EDS CLI, NOT your Java-based AEM Author SDK."
echo
exec aem up
