#!/bin/bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
command -v curl >/dev/null 2>&1 || fail "curl is required."
owner="${EDS_OWNER:-matthub43}"
site="${EDS_SITE:-alsacaem}"
branch="${EDS_CHECK_BRANCH:-$(git branch --show-current)}"
[[ -n "$branch" ]] || fail "No branch detected; set EDS_CHECK_BRANCH in dev-tools/config.sh."
# The aem.page URL uses lowercase project identifiers.
owner="$(printf '%s' "$owner" | tr '[:upper:]' '[:lower:]')"
site="$(printf '%s' "$site" | tr '[:upper:]' '[:lower:]')"
branch="$(printf '%s' "$branch" | tr '[:upper:]' '[:lower:]')"
base="https://${branch}--${site}--${owner}.aem.page"
info "EDS preview deployment check: $base"
for route in '/scripts/aem.js' '/blocks/geo-hero/geo-hero.js' '/blocks/geo-hero/geo-hero.css'; do
  status="$(curl --location --silent --show-error --max-time 15 --output /dev/null --write-out '%{http_code}' "${base}${route}" || true)"
  case "$status" in
    200) printf 'OK  HTTP 200   %s\n' "${base}${route}" ;;
    404) printf 'NOT FOUND 404  %s\n' "${base}${route}" ;;
    *) printf 'HTTP %-8s %s\n' "${status:-ERR}" "${base}${route}" ;;
  esac
done
echo
printf 'Page URL (only works after content is published): %s/geo-demo?geo=tn\n' "$base"
echo "HTTP 200 confirms file delivery, not Universal Editor publishing or user permissions."
