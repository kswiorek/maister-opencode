#!/usr/bin/env bash
# Maister for OpenCode — macOS/Linux installer.
# Copies opencode/skills, agents, commands, plugins into the global OpenCode
# config and enables experimental.todo (Maister phase tracking).
# Idempotent: re-running after `git pull` just overwrites the maister entries.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
mkdir -p "$DEST"
for d in skills agents commands plugins; do
  if [ -d "$HERE/$d" ]; then
    mkdir -p "$DEST/$d"
    cp -r "$HERE/$d/." "$DEST/$d/"
  fi
done

CFG="$DEST/opencode.jsonc"
if [ ! -f "$CFG" ]; then
  printf '{\n  "$schema": "https://opencode.ai/config.json",\n  "experimental": {\n    "todo": true\n  }\n}\n' > "$CFG"
  echo "Created $CFG"
elif grep -Eq '"todo"[[:space:]]*:[[:space:]]*true' "$CFG"; then
  echo "experimental.todo already enabled."
elif grep -Eq '"experimental"' "$CFG"; then
  cp "$CFG" "$CFG.bak"
  echo "opencode.jsonc already has an experimental block — add \"todo\": true manually (backup at $CFG.bak)."
else
  cp "$CFG" "$CFG.bak"
  python3 - "$CFG" <<'EOF'
import re, sys
p = sys.argv[1]
t = open(p, encoding="utf-8").read()
t = re.sub(r"\}\s*$", ',\n  "experimental": {\n    "todo": true\n  }\n}', t, count=1)
open(p, "w", encoding="utf-8").write(t)
EOF
  echo "Enabled experimental.todo (backup at $CFG.bak)."
fi

echo "Installed Maister for OpenCode to $DEST"
echo "In OpenCode, run /reload, then /maister/init in your project."
