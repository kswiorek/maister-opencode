---
description: Initialize Maister framework with intelligent project analysis and documentation generation
---

> Translated from Claude Code (SkillPanel/maister) to OpenCode. Tool mapping: subagent tool + subagent_type â†’ `subagent` tool with `agent: maister/<name>`; Skill tool â†’ `skill` tool with `id: maister-<skill>`; `AskUserQuestion` â†’ `question` tool; `Bash` â†’ `shell` tool; `/maister:xxx` â†’ `/maister/xxx`; `TaskCreate`/`TaskUpdate` â†’ track in `orchestrator-state.yml` + work-log (no native task tool in OpenCode); `EnterPlanMode`/`ExitPlanMode` â†’ use the `plan` agent; `CLAUDE_PLUGIN_ROOT` â†’ local skill directory; `CLAUDE.md` â†’ `AGENTS.md` (OpenCode) â€” both are updated where possible.

# Maister Init (OpenCode)

Load the skill `maister-init` using the `skill` tool and execute its workflow.

Task / arguments (`$ARGUMENTS`): $ARGUMENTS

If no arguments are given, extract the task from the current conversation (same as Claude Code `/maister:init` did).

Instructions:
1. Call the `skill` tool with `{"id": "maister-init"}` to load the full workflow instructions.
2. Follow the loaded SKILL.md phases exactly, including all `question`-tool gates (originally `AskUserQuestion` MANDATORY GATEs â€” they fire even in auto/acceptEdits mode).
3. Delegate to subagents via the `subagent` tool with `agent: maister/<agent-name>` (originally Task tool `maister:<agent>`), e.g. `maister/task-classifier`, `maister/specification-creator`, `maister/implementation-planner`, `maister/task-group-implementer`.
4. Track progress in `.maister/tasks/` + `orchestrator-state.yml` (originally `TaskCreate`/`TaskUpdate`).
5. Use the `shell` tool for commands (originally `Bash`), `read`/`glob`/`grep`/`edit`/`write` for files, `question` to ask the user at every gate.
6. Standards: read `.maister/docs/INDEX.md` plus the specific standard files it points to before spec/plan/implement. If missing, note "No Maister standards found. Consider running `/maister/init`."
7. Resume: if `$ARGUMENTS` is an existing `.maister/tasks/...` folder, load its `orchestrator-state.yml` and resume from the first incomplete phase.

Original Claude Code command: `/maister:init` â†’ OpenCode: `/maister/init`.
Full skill description: Initialize Maister framework with intelligent project analysis and documentation generation
