---
description: Orchestrates comprehensive research workflows from question definition through findings documentation.
---

# Maister Research (OpenCode)

Load the skill `maister-research` using the `skill` tool and execute its workflow.

Task / arguments (`$ARGUMENTS`): $ARGUMENTS

Usage: `/maister/research [question | task-path] [--type=TYPE] [--brainstorm | --no-brainstorm]`.

If no arguments are given, extract the task from the current conversation.

Instructions:
1. Call the `skill` tool with `{"id": "maister-research"}` to load the full workflow instructions.
2. Follow the loaded SKILL.md phases exactly, including all `question`-tool gates (these fire even in auto/acceptEdits mode).
3. Delegate to subagents via the `subagent` tool with `agent: maister/<agent-name>`, e.g. `maister/task-classifier`, `maister/specification-creator`, `maister/implementation-planner`, `maister/task-group-implementer`.
4. Track progress in `.maister/tasks/` + `orchestrator-state.yml`.
5. Use the `shell` tool for commands, `read`/`glob`/`grep`/`edit`/`write` for files, `question` to ask the user at every gate.
6. Standards: read `.maister/docs/INDEX.md` (a hidden directory — always address it by explicit path, since wildcard listings omit dotfiles) plus the specific standard files it points to before spec/plan/implement. If missing, note "No Maister standards found. Consider running `/maister/init`."
7. Resume: if `$ARGUMENTS` is an existing `.maister/tasks/...` folder, load its `orchestrator-state.yml` and resume from the first incomplete phase.

