# Maister for OpenCode

A community port of [SkillPanel/maister](https://github.com/SkillPanel/maister)
(a Claude Code workflow plugin) to [OpenCode](https://opencode.ai) V2.
Upstream code is MIT licensed (see `../LICENSE`); this port keeps the same license.
Upstream `plugins/maister/*` files in this repo are untouched — everything
OpenCode-specific lives in this `opencode/` directory.

What you get, installed globally (works in every project):

- **18 slash commands** → `/maister/work`, `/maister/development`,
  `/maister/research`, `/maister/performance`, `/maister/migration`,
  `/maister/product-design`, `/maister/mockup-studio`, `/maister/init`,
  `/maister/standards-discover`, `/maister/standards-update`,
  `/maister/quick-plan`, `/maister/quick-dev`, `/maister/quick-bugfix`,
  `/maister/reviews-code|pragmatic|production-readiness|reality-check|spec-audit`
- **17 skills** (`maister-development`, `maister-research`, …) with full
  references and the orchestrator dashboard assets
- **25 subagents** (`maister/task-classifier`, `maister/specification-creator`, …)
- **1 guard plugin** (`maister-guards`): blocks destructive git/rm commands for
  non-implementation agents, reminds the model of skill-first invocation and
  mandatory question-tool gates, and re-anchors `orchestrator-state.yml` after
  compaction

## Install

**Windows (PowerShell):**

```powershell
git clone https://github.com/kswiorek/maister-opencode.git
.\maister-opencode\opencode\install.ps1
```

**macOS / Linux:**

```bash
git clone https://github.com/kswiorek/maister-opencode.git
./maister-opencode/opencode/install.sh
```

The installer copies `skills/`, `agents/`, `commands/`, `plugins/` into your
global OpenCode config (`~/.config/opencode`, honoring `$XDG_CONFIG_HOME`) and
enables `"experimental": { "todo": true }` in `opencode.jsonc` (Maister tracks
phases; OpenCode todos are off by default). Existing config is preserved — a
`.bak` backup is written first. Then run `/reload` in OpenCode (or restart the
background service) and use `/maister/init` in your first project.

To update later: `git pull` in this repo and re-run the installer (it just
overwrites the `maister-*` / `maister/` entries).

To uninstall: delete `skills/maister-*`, `agents/maister/`, `commands/maister/`,
`plugins/maister-guards/` from the global config (and optionally the
`experimental.todo` flag).

## Translation notes (Claude Code → OpenCode)

| Claude Code | OpenCode |
|---|---|
| `/maister:xxx` | `/maister/xxx` |
| Skill `maister:xxx` (Skill tool) | Skill `maister-xxx` (`skill` tool) |
| Agent `maister:xxx` (`Task` tool, `subagent_type:`) | Agent `maister/xxx` (`subagent` tool, `agent:`) |
| `AskUserQuestion` (mandatory gates) | `question` tool (same rule — never skip gates) |
| `Bash` | `shell` |
| `TaskCreate` / `TaskUpdate` | `orchestrator-state.yml` + work-log (plus experimental todos) |
| `EnterPlanMode` / `ExitPlanMode` | Switch to `plan` / back to `build` agent |
| `CLAUDE_PLUGIN_ROOT` | The skill's own directory |
| `CLAUDE.md` | `AGENTS.md` (OpenCode prefers it; keep both in sync for cross-tool use) |
| `../orchestrator-framework/` | `../maister-orchestrator-framework/` |

## Cross-tool notes

- Project artifacts under `.maister/` (`docs/`, `tasks/`, `orchestrator-state.yml`,
  `config.yml`) are tool-agnostic: start a workflow in Claude Code, resume it in
  OpenCode with `/maister/development .maister/tasks/...`, or vice versa.
- Keep both `AGENTS.md` and `CLAUDE.md` pointing at `.maister/docs/INDEX.md` in
  your projects so standards apply in both tools.
- The guard plugin's destructive-command list and agent whitelist mirror
  upstream `plugins/maister/hooks/block-destructive-commands.sh` exactly.
