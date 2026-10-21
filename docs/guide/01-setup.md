# Set up pstack

In this page you install the plugin, pick which models pstack uses, and run your first task. pstack runs in Claude Code and OpenCode 2. Setup is one or two commands plus a short conversation.

## Install the plugin

### Claude Code

pstack is its own plugin marketplace. In a Claude Code session, run:

```text
/plugin marketplace add AndBoyS/pstack
/plugin install pstack@pstack
```

`/plugin` then lists pstack as installed. Its skills run as `/poteto-mode`, `/how`, and so on. If another plugin uses the same name, add the prefix, as in `/pstack:how`.

### OpenCode 2

Install from git:

```bash
opencode plugin add 'git+https://github.com/AndBoyS/pstack.git'
```

For a local clone, add its absolute path to `plugins` in `~/.config/opencode/opencode.jsonc` instead:

```jsonc
{ "plugins": ["/path/to/pstack"] }
```

`opencode plugin list` then shows pstack. In OpenCode you attach a skill by typing `@` and its name, as in `@poteto-mode`. Where this guide types `/poteto-mode` or `/how`, type `@poteto-mode` or `@how`.

## Pick your models

Run:

```text
/setup-pstack
```

[`/setup-pstack`](../../skills/setup-pstack/SKILL.md) detects the models you have access to, asks for a reasoning budget, shows you each role (code delegates, judgment, the review panels), and asks what you want. Answer the questions. It writes a small model file that every pstack skill reads, `~/.claude/pstack-models.md` in Claude Code or `~/.config/opencode/pstack-models.md` in OpenCode.

In Claude Code the defaults put code delegates on Sonnet and judgment on Opus, at `xhigh` reasoning, the same as the `large` budget. `unlimited` lifts each model to its highest level, up to `max`. A model whose highest level is below `max` stays at that level. `medium` and `small` lower the reasoning and spend fewer tokens.

OpenCode can reach any provider you have configured, so pstack has no default models there. Every role runs on your chat's model until you pick some. Setup offers to pick a judgment model and a code model, from different families when you have them, so the review panels get model diversity. In OpenCode a value looks like `provider/model#variant`, where the variant is the reasoning level.

You only override what you care about. A role with no line in the file keeps the skill's default. To restore a default, delete that role's line. A rerun of `/setup-pstack` keeps any role whose model differs from the default. When a default changes, a file written before the change still pins the old default, so delete those role lines, or delete the file, then run `/setup-pstack` again.

Set a role to `inherit-parent` and pstack omits the subagent `model` field, so the subagent inherits your parent chat model. `inherit-parent` is not a model name. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size. Setup also configures `swarm workers`, the default model for every `/swarm` worker unless a race names a model for each arm.

## Accept the verification offer, or don't

At the end of setup, `/setup-pstack` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `.claude/skills/verify-<app>/`, a project-local skill that teaches agents to drive your app the way a user does. Claude Code and OpenCode both load it. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

If you're new to pstack, say yes. An agent that can check its own work keeps going until the check passes. An agent that can't hands every result back to you to check by hand. Of everything in this guide, the verification skill pays off the most.

After setup, start a new session. The model file applies to new sessions.

## Keep the cost in check

pstack spends extra tokens on subagents and review panels. That's the price of the rigor. To spend fewer:

- Rerun `/setup-pstack` and pick a smaller reasoning budget or cheaper models. A strong model in the main chat with cheaper, faster models in the code roles is a good split.
- Set a role to `inherit-parent` so it runs on the chat's own model.
- Shorten a panel list. Each entry runs one subagent.
- Save `/poteto-mode` for work that needs rigor. A small, obvious edit doesn't.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/poteto-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. `/poteto-mode` stays in the conversation after you invoke it. In Claude Code it survives compaction, so invoke it again only after `/clear`. In OpenCode you attach the skill to one message, and compaction drops attachments, so attach `@poteto-mode` again after the chat compacts.

Next: [Route work through `/poteto-mode`](./02-poteto-mode.md).
