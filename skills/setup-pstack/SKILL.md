---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Detects your available models and writes a model file that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write the pstack model file, which sets pstack's model per role. It lives at `~/.claude/pstack-models.md` in Claude Code and at `~/.config/opencode/pstack-models.md` in OpenCode. The Subagents section of the **poteto-mode** skill (`../poteto-mode/SKILL.md`) explains how each value maps to the spawn tool's fields.

## Steps

### 1. Detect available models

In Claude Code, the detected set is the aliases the `Agent` tool's `model` field lists, such as `opus` and `sonnet`. The reasoning levels are the values its `effort` field lists. If the tool has no `effort` field, write values without a level.

In OpenCode, call `tools.opencode.models` inside the `execute` tool, or run `opencode models`. The detected set is each `provider/model` it lists, with that model's variants as its reasoning levels.

If you cannot detect any, ask the user to paste the models they have access to. Never write a model you have not confirmed is available. `inherit-parent` is always valid even though it is not a detected model.

### 2. Load current state

The defaults are the Model roles table in poteto-mode's Subagents section, in the column for the tool you run in. If the model file already exists, read it and treat its `# budget` line and its role values as the current choices. Otherwise start from the defaults. A line whose role is not in step 5, such as `how critics`, is from a retired role. Drop it.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Prefer the structured question tool over free text. Offer these four options with these exact labels, and name the current budget when the file records one. With no file, say that `large` matches the defaults.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** Build the working table from the defaults, and on a re-run keep any role you changed by model, list, or `inherit-parent`. `unlimited`, `large`, `medium`, and `small` set the reasoning level of every model value, panel entries included, to `max`, `xhigh`, `high`, or `medium`. The level is the part after `#`, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. If the model doesn't accept that level, use its highest accepted level at or below the target. Drop the suffix for a model with no levels. `inherit-parent` does not change. So in Claude Code `unlimited` turns `opus#xhigh` into `opus#max`, `large` keeps the defaults, and `small` turns them into `opus#medium` and `sonnet#medium`.

**(c) Show the roles and confirm.** Show every role with its value, marking any model not in the detected set as needing a choice. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` (the role runs on the parent chat model) as the options. Prefer the structured question tool over free text. When there are more choices than the tool shows at once, offer the likeliest and let the user type any other.

In OpenCode every default is `inherit-parent`, so the panels start with no model diversity. Before the per-role question, offer to pick one judgment model and one code model, from different families when the detected set allows it. Fill the judgment roles with the first, the code roles with the second, and each panel with both, each at the budget's level per (b).

For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list, and one subagent runs per entry, `inherit-parent` entries included, so the list length sets the count. `arena cross-judge pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every model written must be in the detected set, with a level that model accepts. `inherit-parent` always passes. If a chosen model is not available, stop and ask again.

### 5. Write the file

Write the model file with a `# budget` line naming the chosen label and its target level, and one line per role, using the same labels poteto-mode uses. Overwrite the whole file so re-runs stay idempotent. Shape, with the Claude Code defaults:

```
# pstack model configuration. One line per role. Delete a line to fall back to the default.
# A value is a model with an optional #<reasoning level>, a comma-separated list for a panel, or inherit-parent.
# inherit-parent runs the role on the parent chat model. inherit-parent entries in a panel list still count toward its fan-out.
# budget: large (xhigh)
feature, refactoring: sonnet#xhigh
bug-fix: sonnet#xhigh
perf-issue: sonnet#xhigh
judgment and prose: opus#xhigh
hardest tasks: opus#xhigh
how explorer: sonnet#xhigh
how explainer: opus#xhigh
why investigators: sonnet#xhigh
why synthesizer: opus#xhigh
reflect tooling: sonnet#xhigh
reflect judgment, divergent, synthesizer: opus#xhigh
arena runners: opus#xhigh, sonnet#xhigh
arena cross-judge pool: opus#xhigh, sonnet#xhigh
swarm workers: sonnet#xhigh
architect runners: opus#xhigh, sonnet#xhigh
interrogate reviewers: opus#xhigh, sonnet#xhigh
```

In OpenCode the same lines hold `provider/model#variant` values, with the variant as the reasoning level.

### 6. Confirm

Tell the user the file was written and that it applies to new sessions. Re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, read and follow `../create-verification-skill/SKILL.md`. On no, move on without pushing.
