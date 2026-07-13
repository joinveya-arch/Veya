#!/usr/bin/env bash
#
# Installs the repo's git hooks. Run once, after cloning:
#
#     ./scripts/install-hooks.sh
#
# Uses core.hooksPath, so the hooks are version-controlled in .githooks/
# rather than living untracked in .git/hooks/ where nobody can review them.
#
set -euo pipefail
cd "$(dirname "$0")/.."

git config core.hooksPath .githooks
chmod +x .githooks/* scripts/*.sh

echo "✓ Git hooks installed (core.hooksPath → .githooks)"
echo ""
echo "  pre-commit now runs ./scripts/check-docs.sh"
echo "  Bypass a specific commit with:  SKIP_DOC_CHECK=1 git commit …"
