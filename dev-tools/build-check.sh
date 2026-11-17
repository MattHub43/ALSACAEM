#!/bin/bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
command -v npm >/dev/null 2>&1 || fail "npm is missing. Install Node.js 20+ first."
[[ -d node_modules ]] || fail "Node modules aren't installed. Run toolkit option 7 first."
info "Generate XWalk Universal Editor JSON"
npm run build:json
info "Run repo lint checks (JavaScript, CSS)"
npm run lint
info "Build and lint passed. Review generated component-*.json before committing."
