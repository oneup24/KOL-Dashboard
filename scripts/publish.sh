#!/usr/bin/env bash
#
# publish.sh — publish KOL-Dashboard to GitHub Pages and self-verify the deploy.
#
#   bash scripts/publish.sh
#
# Cycle:  gate (lint + build) -> diff -> commit -> push -> watch Actions -> verify live
#
# Safety: no force-push, no hard reset, no rebase/merge/tag/amend.
#         Only `git add -A`, `git commit -m`, `git push origin main` are used.

set -euo pipefail

# ── Configuration ───────────────────────────────────────────────────────────
REPO_SLUG="oneup24/KOL-Dashboard"
LIVE_BASE="https://oneup24.github.io/KOL-Dashboard"
RUNS_API="https://api.github.com/repos/${REPO_SLUG}/actions/runs?per_page=5"
MARKER="campaign-closed"          # only present in the new build
POLL_INTERVAL=15                  # seconds between Actions polls
POLL_ATTEMPTS=24                  # 24 x 15s = 6 minutes max watch window
VERIFY_ATTEMPTS=12                # 12 x 10s = 2 minutes max wait for Pages to propagate
ROUTES=(
  "/#/applications"
  "/#/campaigns/1"
  "/#/c/summer-collection-2026"
)

# ── State collected for the final summary ──────────────────────────────────
COMMIT_SHA=""
RUN_URL=""
RUN_STATUS=""
RUN_CONCLUSION=""
BUNDLE_PATH=""
BUNDLE_NAME=""
MARKER_COUNT=0
PUSHED=0

# ── Helpers ────────────────────────────────────────────────────────────────
info() { printf '%s\n' "$*"; }
step() { printf '\n== %s\n' "$*"; }

# fail <reason> [detail...] — print the detail, the FAIL summary, exit 1.
fail() {
  local reason="$1"; shift
  if [ "$#" -gt 0 ]; then
    printf '\n%s\n' "$*"
  fi
  printf '\n────────────────────────────────────────\n'
  printf ' PUBLISH RESULT: FAIL\n'
  printf ' failed:  %s\n' "${reason}"
  printf ' commit:  %s\n' "${COMMIT_SHA:-<none>}"
  printf ' deploy:  %s\n' "${RUN_URL:-<none>}"
  printf ' live:    %s\n' "${LIVE_BASE}/"
  printf '────────────────────────────────────────\n'
  exit 1
}

# Catch anything unexpected and still emit a summary.
on_error() {
  local code="$1"
  trap - ERR
  fail "UNEXPECTED ERROR — exit code ${code}"
}
trap 'on_error $?' ERR

# Resolve the repo root from the script location so it can be run from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

# ── 1. Header ──────────────────────────────────────────────────────────────
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  fail "PRE-FLIGHT FAILED — not a git work tree: ${REPO_ROOT}"
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
HEAD_SHA="$(git rev-parse HEAD)"

info "========================================"
info " KOL-Dashboard publish"
info "========================================"
info "repo:    ${REPO_ROOT}"
info "branch:  ${BRANCH}"
info "HEAD:    ${HEAD_SHA}"

if [ "${BRANCH}" != "main" ]; then
  fail "PRE-FLIGHT FAILED — expected branch 'main', found '${BRANCH}'" \
       "The push targets origin/main; publishing from another branch would push the wrong tree."
fi

# ── 2. Gate: lint + build ─────────────────────────────────────────────────
step "GATE — npm run lint"
if ! lint_out="$(npm run lint 2>&1)"; then
  printf '%s\n' "${lint_out}"
  fail "GATE FAILED — npm run lint"
fi
printf '%s\n' "${lint_out}" | tail -n 20

step "GATE — npm run build"
if ! build_out="$(npm run build 2>&1)"; then
  printf '%s\n' "${build_out}"
  fail "GATE FAILED — npm run build"
fi
printf '%s\n' "${build_out}" | tail -n 30
if grep -q "larger than 500 kB" <<< "${build_out}"; then
  info "note: the chunk-size warning above is expected and is not a failure."
fi
info "gate: lint OK, build OK"

# ── 3. Diff stat: exactly what is about to be published ───────────────────
step "DIFF STAT — what will be published"
git diff --stat
git status --short

# ── 4. Commit ──────────────────────────────────────────────────────────────
step "COMMIT"
if ! git add -A; then
  fail "COMMIT FAILED — git add -A"
fi

if git diff --cached --quiet; then
  info "Nothing to commit, tree already clean — skipping commit and push."
  COMMIT_SHA="$(git rev-parse HEAD)"
else
  git diff --cached --stat
  COMMIT_MESSAGE="$(cat <<'EOF'
Add KOL CRM, campaign pipeline, messaging and post tracking

- Split KOL CRM master record from per-campaign applications (kolId FK, dedup by handle)
- Add campaign pipeline board, funnel strip, deadline alerts and campaign detail page
- Add message templates with variable interpolation, WhatsApp deep links and a send log
- Add per-KOL promo code generation, post capture and CRM post history
- Enforce application deadline, application cap and blacklist guard on the public form
- Fix public-page CTA routing and dashboard privacy leaks found in review
- Bump deploy workflow to Node 22
EOF
)"
  if ! git commit -m "${COMMIT_MESSAGE}"; then
    fail "COMMIT FAILED — git commit -m"
  fi
  COMMIT_SHA="$(git rev-parse HEAD)"
  PUSHED=1
  info "created commit ${COMMIT_SHA}"
fi

# ── 5. Push ────────────────────────────────────────────────────────────────
step "PUSH — git push origin main"
if [ "${PUSHED}" -eq 1 ]; then
  if ! push_out="$(git push origin main 2>&1)"; then
    printf '%s\n' "${push_out}"
    fail "PUSH FAILED — git push origin main"
  fi
  printf '%s\n' "${push_out}"
else
  info "skipped — nothing to commit"
fi

# ── 6. Watch the deploy workflow ──────────────────────────────────────────
# Reads the Actions API on stdin, prints "<status>|<conclusion>|<url>" for the
# run whose head_sha matches $1. Exit 0 = found, 2 = unparseable, 3 = not yet.
parse_run() {
  python3 -c '
import sys, json, re

try:
    raw = re.sub(r"[\x00-\x1f]+", " ", sys.stdin.read())
    data = json.loads(raw)
except Exception as exc:
    sys.stderr.write("api parse error: %s\n" % exc)
    sys.exit(2)

target = sys.argv[1]
runs = data.get("workflow_runs")
if runs is None:
    sys.stderr.write("unexpected api payload (no workflow_runs)\n")
    sys.exit(2)
for run in runs:
    if run.get("head_sha") == target:
        sys.stdout.write("%s|%s|%s\n" % (
            run.get("status") or "",
            run.get("conclusion") or "",
            run.get("html_url") or "",
        ))
        sys.exit(0)
sys.exit(3)
' "$1"
}

if [ "${PUSHED}" -eq 1 ]; then
  step "WATCH DEPLOY — Actions run for ${COMMIT_SHA}"
  last_status=""
  last_conclusion=""
  attempt=0
  while [ "${attempt}" -lt "${POLL_ATTEMPTS}" ]; do
    attempt=$((attempt + 1))
    api_body="$(curl -s --max-time 30 -H "Accept: application/vnd.github+json" "${RUNS_API}" || true)"
    if parsed="$(printf '%s' "${api_body}" | parse_run "${COMMIT_SHA}")"; then
      parse_rc=0
    else
      parse_rc=$?
    fi

    case "${parse_rc}" in
      0)
        IFS='|' read -r st concl url <<< "${parsed}" || true
        RUN_STATUS="${st}"
        RUN_CONCLUSION="${concl}"
        RUN_URL="${url}"
        if [ "${st}" != "${last_status}" ] || [ "${concl}" != "${last_conclusion}" ]; then
          info "  [$(date '+%H:%M:%S')] ${st}${concl:+ / ${concl}}  ${url}"
          last_status="${st}"
          last_conclusion="${concl}"
        fi
        if [ "${st}" = "completed" ]; then
          break
        fi
        ;;
      3)
        info "  [$(date '+%H:%M:%S')] waiting for the run to appear (attempt ${attempt}/${POLL_ATTEMPTS})"
        ;;
      *)
        info "  [$(date '+%H:%M:%S')] could not read the Actions API (attempt ${attempt}/${POLL_ATTEMPTS})"
        ;;
    esac

    if [ "${attempt}" -lt "${POLL_ATTEMPTS}" ]; then
      sleep "${POLL_INTERVAL}"
    fi
  done

  if [ "${RUN_STATUS}" != "completed" ]; then
    fail "DEPLOY FAILED — workflow did not complete within $((POLL_ATTEMPTS * POLL_INTERVAL))s" \
         "Last known run: ${RUN_URL:-<none>}"
  fi
  if [ "${RUN_CONCLUSION}" != "success" ]; then
    fail "DEPLOY FAILED — workflow conclusion: ${RUN_CONCLUSION:-unknown}" \
         "Failing run: ${RUN_URL}"
  fi
  info "deploy succeeded: ${RUN_URL}"
else
  info "watch: skipped — no new commit to deploy"
fi

# ── 7. Verify live ────────────────────────────────────────────────────────
step "VERIFY LIVE — ${LIVE_BASE}/"

http_code() {
  local code
  code="$(curl -s --max-time 30 -o /dev/null -w "%{http_code}\n" "$1" 2>/dev/null | tr -d '[:space:]' || true)"
  printf '%s' "${code:-000}"
}

index_code="$(http_code "${LIVE_BASE}/")"
if [ "${index_code}" != "200" ]; then
  fail "VERIFY FAILED — ${LIVE_BASE}/ returned HTTP ${index_code}"
fi
info "  index: HTTP 200"

for route in "${ROUTES[@]}"; do
  code="$(http_code "${LIVE_BASE}${route}")"
  if [ "${code}" != "200" ]; then
    fail "VERIFY FAILED — route ${route} returned HTTP ${code}"
  fi
  info "  route ${route}: HTTP 200"
done

# Pull the live bundle filename out of the live index.html, fetch that exact
# bundle and count the marker. The old live bundle has 0 matches.
verify_bundle() {
  local index_html bundle_path body count
  index_html="$(curl -s --max-time 30 "${LIVE_BASE}/")" || return 1
  bundle_path="$(printf '%s' "${index_html}" | grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' | head -n 1 || true)"
  [ -n "${bundle_path}" ] || return 1
  body="$(curl -s --max-time 60 "${LIVE_BASE}/${bundle_path}")" || return 1
  count="$(printf '%s' "${body}" | python3 -c 'import sys; print(sys.stdin.read().count("campaign-closed"))' 2>/dev/null || printf '0')"
  BUNDLE_PATH="${bundle_path}"
  BUNDLE_NAME="${bundle_path##*/}"
  MARKER_COUNT="${count}"
  [ "${MARKER_COUNT}" -gt 0 ]
}

attempt=0
while [ "${attempt}" -lt "${VERIFY_ATTEMPTS}" ]; do
  attempt=$((attempt + 1))
  if verify_bundle; then
    break
  fi
  if [ "${attempt}" -lt "${VERIFY_ATTEMPTS}" ]; then
    info "  marker '${MARKER}' not visible yet (attempt ${attempt}/${VERIFY_ATTEMPTS}) — waiting for Pages to propagate"
    sleep 10
  fi
done

if [ "${MARKER_COUNT}" -le 0 ]; then
  fail "VERIFY FAILED — marker '${MARKER}' not found in the live bundle" \
       "Live bundle: ${BUNDLE_NAME:-<no bundle found>}"
fi
info "  bundle ${BUNDLE_NAME} contains '${MARKER}' × ${MARKER_COUNT}"

# ── 8. Summary ─────────────────────────────────────────────────────────────
printf '\n────────────────────────────────────────\n'
printf ' PUBLISH RESULT: PASS\n'
printf ' commit:  %s\n' "${COMMIT_SHA}"
printf ' deploy:  %s\n' "${RUN_URL:-<skipped: nothing to commit>}"
printf ' live:    %s\n' "${LIVE_BASE}/"
printf ' bundle:  %s  (%s × %s)\n' "${BUNDLE_NAME}" "${MARKER}" "${MARKER_COUNT}"
printf '────────────────────────────────────────\n'

exit 0
