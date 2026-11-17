#!/bin/bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
branch="$(git branch --show-current)"
[[ -n "$branch" ]] || fail "Detached HEAD. Check out a branch first."
[[ -n "$(git remote)" ]] || fail "No Git remote configured; cannot push."
info "Git branch: $branch"
git status -sb
if [[ -z "$(git status --porcelain)" ]]; then
  echo "No local changes to commit."
  exit 0
fi
cat <<'MENU'

What would you like to stage?
  1) All changes, including new files (git add -A)
  2) Tracked-file changes only (git add -u)
  3) Only what you've already staged
  0) Cancel
MENU
read -r -p "Choose: " stage_choice
case "$stage_choice" in
  1) git add -A ;;
  2) git add -u ;;
  3) : ;;
  *) echo "Cancelled."; exit 0 ;;
esac
if git diff --cached --quiet; then
  echo "Nothing staged. No commit created."
  exit 0
fi
info "Files about to be committed"
git diff --cached --name-status
info "Staged change summary"
git diff --cached --stat
if ! git diff --cached --check; then
  fail "The staged changes have whitespace errors. Fix or review them first."
fi
suspicious="$(git diff --cached --name-only | grep -Ei '(^|/)(\.env(\.|$)|.*(secret|credentials|private[-_]?key).*)|\.(pem|p12|pfx|key)$' || true)"
if [[ -n "$suspicious" ]]; then
  echo
  echo "WARNING: Potential credential/private files are staged:"
  echo "$suspicious"
  confirm "Are you sure none contain sensitive information?" || { echo "Cancelled; staging remains as-is."; exit 0; }
fi
if [[ "$branch" == main || "$branch" == master ]]; then
  echo
  echo "WARNING: You're on '$branch'. For team work, a feature branch + PR is safer."
fi
confirm "Commit the staged changes?" || { echo "Cancelled; staging remains as-is."; exit 0; }
read -r -p "Enter a commit message: " message
[[ -n "${message//[[:space:]]/}" ]] || fail "Commit message can't be empty."
git commit -m "$message"
echo
if confirm "Push the commit to origin/$branch now?"; then
  if [[ -n "$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)" ]]; then
    git push
  else
    git push -u origin "$branch"
  fi
  info "Push successful. Check deployment from toolkit option 5."
else
  echo "Commit saved locally. Push later with: git push"
fi
