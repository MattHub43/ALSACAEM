#!/bin/bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
info "Current branch and remote"
git status -sb
echo
git remote -v || true
info "Changed and untracked files"
git status --short
info "Unstaged change summary"
git diff --stat || true
info "Staged change summary"
git diff --cached --stat || true
