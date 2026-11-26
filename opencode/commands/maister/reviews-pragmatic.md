---
description: Run pragmatic code review to detect over-engineering and ensure code matches project scale
---

> Translated from Claude Code (SkillPanel/maister) to OpenCode. Tool mapping: subagent tool + subagent_type → `subagent` tool with `agent: maister/<name>`; Skill tool → `skill` tool with `id: maister-<skill>`; `AskUserQuestion` → `question` tool; `Bash` → `shell` tool; `/maister:xxx` → `/maister/xxx`; `TaskCreate`/`TaskUpdate` → track in `orchestrator-state.yml` + work-log (no native task tool in OpenCode); `EnterPlanMode`/`ExitPlanMode` → use the `plan` agent; `CLAUDE_PLUGIN_ROOT` → local skill directory; `CLAUDE.md` → `AGENTS.md` (OpenCode) — both are updated where possible.


**ACTION REQUIRED**: This command delegates to a different skill. The `<command-name>` tag refers to THIS command, not the target. Call the subagent tool with agent="maister/code-quality-pragmatist" NOW. Pass the path to analyze in the prompt. Do not read files, explore code, or execute workflow steps yourself.

You are running a pragmatic code review using the `code-quality-pragmatist` agent.

## Your Task

You are performing pragmatic analysis to identify over-engineering, unnecessary complexity, and developer experience issues.

## Parse User Request

**Determine the following from the user's request:**

1. **Path to analyze**:
   - If provided: Use the specified path
   - If not provided: Use question to ask what to analyze (file, directory, or task path)

## Your Instructions

**Invoke the code-quality-pragmatist agent NOW using the subagent tool:**

```
subagent tool:
- agent: "maister/code-quality-pragmatist"
- description: Pragmatic code review
- prompt: |
    Review the code at: [path]
    Project scale docs: .maister/docs/project/
    Spec (if any): [spec path]
    Write the report to: verification/pragmatic-review.md
```

**Wait for the agent to complete before proceeding.**

The code-quality-pragmatist agent will:
1. Assess complexity relative to project scale (MVP vs Enterprise)
2. Detect over-engineering (Redis in MVP, excessive layers, premature optimization)
3. Identify developer experience friction points
4. Compare implementation to requirements (if spec available)
5. Recommend concrete simplifications with impact estimates
6. Provide top 3 priority actions

## Examples

**Example 1**: Review specific feature
```
User: /maister/reviews-pragmatic .maister/tasks/development/2025-11-17-user-management/
```

**Example 2**: Review source directory
```
User: /maister/reviews-pragmatic src/features/payments/
```

**Example 3**: Review specific file
```
User: /maister/reviews-pragmatic src/services/cache-service.ts
```

## What to Expect

The code-quality-pragmatist will provide:
- Complexity assessment (Low/Medium/High) relative to project scale
- Over-engineering patterns with severity (Critical/High/Medium/Low)
- Developer experience issues and friction points
- Requirements alignment assessment
- Concrete simplification recommendations with before/after examples
- Top 3 priority actions with estimated impact
- Summary statistics (LOC reduction potential, dependencies removable)

## Notes

- This is analysis only - no code will be modified
- Focus on pragmatism: appropriate complexity for actual needs
- Identifies unnecessary infrastructure, abstractions, and patterns
- Severity levels guide prioritization:
  - **Critical**: Severe over-engineering blocking development
  - **High**: Significant unnecessary complexity
  - **Medium**: Moderate complexity issues
  - **Low**: Minor improvements

Arguments (OpenCode `$ARGUMENTS`): $ARGUMENTS
