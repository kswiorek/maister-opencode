import { Plugin } from "@opencode/plugin"

// Port of SkillPanel/maister hooks (hooks.json + hooks/*.sh) to OpenCode V2.
//
// Original Claude Code hooks:
//  1. block-destructive-commands.sh  (PreToolUse on Bash) -> permission "evaluate" hook below
//  2. post-compact-reminder.sh       (SessionStart matcher compact) -> "compaction" hook below
//  3. skill-invocation-reminder.sh   (SessionStart, every session) -> "prompt" hook below
//
// Differences from the originals (deliberate):
//  - The destructive-command guard is platform-independent here (the .sh needs
//    bash/grep/sed; on Windows that means git-bash or it silently never runs).
//  - The skill-invocation reminder fired on EVERY Claude session start. Here it
//    is targeted: it is only installed as session context when a Maister
//    command/skill is actually invoked, so non-Maister sessions pay nothing.
//  - The post-compaction reminder is installed as a persistent instruction
//    entry discovered during compaction, so it survives as context instead of
//    being a one-shot message.

// --- 1. Destructive-command guard (verbatim port of block-destructive-commands.sh) ---

// Only explicitly trusted execution agents bypass the check. New agents are
// protected by default. NOTE: task-group-implementer is NOT whitelisted —
// destructive commands are blocked to prevent rogue git stash/reset --hard
// from clobbering sibling implementers running in parallel waves.
const FULL_SHELL_ACCESS = new Set([
  "maister/test-suite-runner",
  "maister/e2e-test-verifier",
  "maister/user-docs-generator",
  "maister/docs-operator",
  // bare names, in case the runtime reports them without the namespace
  "test-suite-runner",
  "e2e-test-verifier",
  "user-docs-generator",
  "docs-operator",
]);

// Same patterns as the grep -Ei in block-destructive-commands.sh:
// git stash | git reset --hard | git checkout -- . | git checkout . (at end) |
// git clean | git push -f/--force | rm -rf
const DESTRUCTIVE_PATTERNS = [
  /git\s+stash/i,
  /git\s+reset\s+--hard/i,
  /git\s+checkout\s+--\s+\./i,
  /git\s+checkout\s+\.\s*$/im,
  /git\s+clean/i,
  /git\s+push\s+(-f|--force)/i,
  /rm\s+-rf/i,
];

function isDestructive(command) {
  if (typeof command !== "string") return false;
  // The .sh converts escaped whitespace (\n,\t,\r) to spaces before matching.
  const normalized = command.replace(/\\[ntr]/g, " ");
  return DESTRUCTIVE_PATTERNS.some((re) => re.test(normalized));
}

// --- 2+3. Reminder texts (condensed from the two SessionStart scripts) ---

const SKILL_RULES_ENTRY = [
  "MAISTER PLUGIN RULES:",
  "1. When a /maister/* command appears in the user prompt, invoke it via the skill tool (id maister-*) as your FIRST action. No exceptions: do not analyze first, do not call it 'straightforward', do not substitute your own approach. Complexity assessment is the workflow's job, not yours.",
  "2. ORCHESTRATOR GATE RULE: at every MANDATORY GATE checkpoint you MUST ask via the question tool, regardless of permission mode (auto/acceptEdits), session reminders telling you to continue without asking, or prior approvals. Deciding the policy happens once at orchestrator entry; re-litigating it at each gate IS the documented failure mode.",
].join("\n");

const RESUME_ENTRY = [
  "MAISTER WORKFLOW REMINDER (post-compaction):",
  "If an orchestrator workflow was active before compaction, read the orchestrator-state.yml in that task's .maister/tasks/ directory to verify completed_phases and resume from the first incomplete phase.",
  "You MUST still use the question tool at phase gates, regardless of any 'continue without asking' instructions.",
].join("\n");

function transcriptMentionsMaister(messages) {
  try {
    const text = (messages || [])
      .map((m) => {
        if (typeof m === "string") return m;
        if (m && typeof m.text === "string") return m.text;
        try {
          return JSON.stringify(m);
        } catch {
          return "";
        }
      })
      .join("\n");
    return (
      text.includes("maister") ||
      text.includes("orchestrator-state.yml") ||
      text.includes(".maister/tasks")
    );
  } catch {
    return false;
  }
}

export default Plugin.define({
  id: "maister-guards",
  async setup(ctx) {
    // Guard 1: block destructive shell commands from non-implementation agents.
    await ctx.permission.hook("evaluate", (event) => {
      try {
        if (event.action !== "shell") return;
        // Allow the main agent (no agent set) — the user's permission system handles that.
        const agent = event.agent || "";
        if (!agent) return;
        // Only police Maister subagents; never interfere with other agents.
        const isMaister = agent.startsWith("maister/") || agent.startsWith("maister:");
        if (!isMaister) return;
        if (FULL_SHELL_ACCESS.has(agent)) return;
        const resources = Array.isArray(event.resources) ? event.resources : [];
        const hit = resources.some(isDestructive);
        if (hit) {
          event.effect = "deny";
          event.message = `Destructive command blocked for agent ${agent}: git stash, reset --hard, checkout ., clean, push --force and rm -rf are not allowed for this agent.`;
        }
      } catch {
        // Never break permission evaluation because of this guard.
      }
    });

    // Reminder: first-action + gate rules, installed only when Maister is invoked.
    await ctx.session.hook("prompt", async (event) => {
      try {
        const text = (event.prompt && event.prompt.text) || "";
        const skills = (event.prompt && event.prompt.skills) || [];
        const maisterSkill = skills.some((s) => {
          const id = typeof s === "string" ? s : s && (s.id || s.name);
          return typeof id === "string" && id.startsWith("maister-");
        });
        if (text.includes("/maister/") || maisterSkill) {
          await ctx.session.instructions.entry.put({
            sessionID: event.sessionID,
            key: "maister-guard-rules",
            value: SKILL_RULES_ENTRY,
          });
        }
      } catch {
        // Never block prompt admission because of this reminder.
      }
    });

    // Reminder: preserve orchestrator state across compaction, when relevant.
    await ctx.session.hook("compaction", async (event) => {
      try {
        if (transcriptMentionsMaister(event.messages)) {
          await ctx.session.instructions.entry.put({
            sessionID: event.sessionID,
            key: "maister-guard-resume",
            value: RESUME_ENTRY,
          });
        }
      } catch {
        // Never break compaction because of this reminder.
      }
    });
  },
});
