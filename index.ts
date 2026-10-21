import { Plugin, Skill } from "@opencode/plugin"
import { readdir, readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

const skillsDirectory = new URL("./skills/", import.meta.url)
const agentsDirectory = new URL("./agents/", import.meta.url)

// pstack frontmatter holds flat `key: value` pairs, plain, double-quoted, or a
// `>`/`|` block, so a local install needs no YAML dependency. OpenCode installs
// none for a local plugin.
const parse = (text: string) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) throw new Error("missing frontmatter")
  const data: Record<string, string | boolean> = {}
  const lines = match[1].split(/\r?\n/)
  for (let index = 0; index < lines.length; index++) {
    const field = /^([a-z-]+):\s*(.*)$/.exec(lines[index])
    if (!field) continue
    const raw = field[2].trim()
    if (/^[>|][-+]?$/.test(raw)) {
      const block: string[] = []
      while (index + 1 < lines.length && /^\s/.test(lines[index + 1])) block.push(lines[++index].trim())
      data[field[1]] = block.join(raw.startsWith(">") ? " " : "\n")
      continue
    }
    data[field[1]] = raw === "true" ? true : raw === "false" ? false : raw.startsWith('"') ? JSON.parse(raw) : raw
  }
  return { data, content: text.slice(match[0].length) }
}

const loadSkills = async () => {
  const entries = await readdir(skillsDirectory, { withFileTypes: true })
  return Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const file = new URL(`${entry.name}/SKILL.md`, skillsDirectory)
        const markdown = parse(await readFile(file, "utf8"))
        return Skill.Info.make({
          id: Skill.ID.make(entry.name),
          name: Skill.Name.make(String(markdown.data.name)),
          description: String(markdown.data.description),
          autoinvoke: markdown.data["disable-model-invocation"] !== true,
          path: Skill.Info.fields.path.make(fileURLToPath(file)),
          content: markdown.content,
        })
      }),
  )
}

const loadAgents = async () => {
  const files = (await readdir(agentsDirectory)).filter((file) => file.endsWith(".md"))
  return Promise.all(
    files.map(async (file) => {
      const markdown = parse(await readFile(new URL(file, agentsDirectory), "utf8"))
      return {
        id: file.slice(0, -".md".length),
        description: String(markdown.data.description),
        system: markdown.content.trim(),
      }
    }),
  )
}

export default Plugin.define({
  id: "pstack",
  async setup(ctx) {
    const [skills, agents] = await Promise.all([loadSkills(), loadAgents()])
    await ctx.skill.transform((editor) => {
      skills.forEach((skill) => {
        if (!editor.get(skill.id)) editor.add(skill)
      })
    })
    await ctx.agent.transform((editor) => {
      agents.forEach((agent) => {
        if (editor.get(agent.id)) return
        editor.update(agent.id, (item) => {
          item.description = agent.description
          item.system = agent.system
          item.mode = "subagent"
        })
      })
    })
  },
})
