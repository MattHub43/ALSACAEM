#!/bin/bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
branch="$(git branch --show-current)"
[[ -n "$branch" ]] || fail "Detached HEAD. Check out a branch first."
[[ -z "$(git status --porcelain)" ]] || fail "You have local changes. Commit or stash them before pulling."
info "Pull latest commits for $branch (fast-forward only)"
git pull --ff-only
info "Pull complete."
