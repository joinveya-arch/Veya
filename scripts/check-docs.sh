#!/usr/bin/env bash
#
# check-docs — fail when a code change should have carried a doc change.
#
# Docs rot the moment they become optional. This makes the coupling mechanical:
# touch a route, you touch the API reference; touch a token, you touch the design
# system. It is a heuristic, not a proof — but it catches the case that actually
# happens, which is "meant to update the docs, forgot".
#
#   ./scripts/check-docs.sh            # staged changes   (pre-commit)
#   ./scripts/check-docs.sh --branch   # whole branch vs master  (CI)
#
# Bypass (rare, and say why in the commit message):
#   SKIP_DOC_CHECK=1 git commit ...
#
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

if [ "${SKIP_DOC_CHECK:-}" = "1" ]; then
  echo "check-docs: skipped via SKIP_DOC_CHECK=1"
  exit 0
fi

MODE="${1:---staged}"

if [ "$MODE" = "--branch" ]; then
  BASE="${BASE_REF:-origin/master}"
  git rev-parse --verify --quiet "$BASE" >/dev/null || BASE="master"
  CHANGED=$(git diff --name-only "$(git merge-base "$BASE" HEAD)"...HEAD)
  WHAT="this branch"
else
  CHANGED=$(git diff --cached --name-only)
  WHAT="your staged changes"
fi

if [ -z "$CHANGED" ]; then
  echo "check-docs: nothing to check."
  exit 0
fi

# changed <pattern> — did anything matching this change?
changed() { echo "$CHANGED" | grep -qE "$1"; }

ERRORS=0
NOTES=0

# require <trigger-regex> <doc-path> <why>
#   Code matching the trigger changed, but the doc did not → hard failure.
require() {
  local trigger="$1" doc="$2" why="$3"
  if changed "$trigger" && ! changed "^${doc//./\\.}$"; then
    echo ""
    echo "  ✗ $doc was not updated"
    echo "    $why"
    echo "    (changed: $(echo "$CHANGED" | grep -E "$trigger" | head -3 | tr '\n' ' '))"
    ERRORS=$((ERRORS + 1))
  fi
}

# suggest — same idea, but advisory. Prints, never blocks.
suggest() {
  local trigger="$1" doc="$2" why="$3"
  if changed "$trigger" && ! changed "^${doc//./\\.}$"; then
    echo ""
    echo "  • consider updating $doc"
    echo "    $why"
    NOTES=$((NOTES + 1))
  fi
}

echo "check-docs: inspecting ${WHAT}..."

# ---- Hard requirements -------------------------------------------------------

require '^backend/src/(routes|validators)/' \
  'docs/API.md' \
  'Routes or validators changed — the endpoint contract may have moved. docs/API.md is what people read INSTEAD of the route files, so a stale one is worse than none.'

require '^backend/prisma/schema\.prisma$' \
  'frontend/types/index.ts' \
  'The schema is the source of truth for data shapes, and frontend/types mirrors it BY HAND. If they drift, the frontend lies to you at compile time.'

require '^frontend/app/globals\.css$' \
  'DESIGN_SYSTEM.md' \
  'Design tokens changed. Every token is documented — an undocumented one gets re-invented by the next person.'

require '^frontend/components/ui/' \
  'DESIGN_SYSTEM.md' \
  'A shared primitive changed. Its variants/contract are documented in §8 — reuse depends on people being able to see what exists.'

# ---- Advisory ----------------------------------------------------------------

suggest '^backend/src/services/' \
  'docs/API.md' \
  'Business rules live in services (booking state machine, review eligibility). If you changed one, the rules section is now wrong.'

suggest '^frontend/lib/mock/' \
  'README.md' \
  'The mock layer backs the public demo, including its sign-in credentials.'

suggest '^\.github/workflows/' \
  'README.md' \
  'Deployment behaviour changed.'

# A new backend route almost always means a gap in HANDOFF.md just closed.
if changed '^backend/src/routes/' && ! changed '^docs/HANDOFF\.md$'; then
  echo ""
  echo "  • consider updating docs/HANDOFF.md"
  echo "    Routes changed. If this closed one of the known GAPs (forgot-password,"
  echo "    admin users, profile update, …), tick it off so nobody re-does it."
  NOTES=$((NOTES + 1))
fi

# ---- Verdict -----------------------------------------------------------------

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "check-docs: FAILED — $ERRORS doc(s) need updating."
  echo ""
  echo "  Update them, stage them, and try again."
  echo "  If a doc genuinely doesn't need to change, bypass with:"
  echo "      SKIP_DOC_CHECK=1 git commit …"
  echo "  and say why in the commit message."
  echo ""
  exit 1
fi

if [ "$NOTES" -gt 0 ]; then
  echo "check-docs: passed, with $NOTES suggestion(s) above."
else
  echo "check-docs: passed."
fi
exit 0
