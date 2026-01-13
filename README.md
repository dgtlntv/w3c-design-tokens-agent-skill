# Design Token Claude Plugin

A Claude Code plugin monorepo providing design token tooling with modular, distributable packages.

## Structure

```
design-token-claude-plugin/
├── packages/
│   ├── skill/              # Standalone skill plugin
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   │       └── design-tokens/
│   │           └── SKILL.md
│   └── subagent/           # Standalone subagent plugin
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── agents/
│           └── design-tokens.md
├── plugin/                 # Combined plugin
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── skills/             # Built from @design-tokens/skill
│   ├── agents/             # Built from @design-tokens/subagent
│   └── build.js
├── package.json
└── pnpm-workspace.yaml
```

## Packages

| Package | Description | Standalone Distribution |
|---------|-------------|------------------------|
| `@design-tokens/skill` | Design tokens skill following W3C DTCG spec | Yes |
| `@design-tokens/subagent` | Specialized agent for token management | Yes |
| `@design-tokens/plugin` | Combined plugin with both skill and agent | Yes |

## Setup

```bash
# Install pnpm if needed
npm install -g pnpm

# Install dependencies
pnpm install

# Build the combined plugin
pnpm build
```

## Development

### Testing Individual Packages

```bash
# Test the skill plugin
pnpm test:skill

# Test the subagent plugin
pnpm test:agent

# Test the combined plugin
pnpm test:combined
```

### Testing with --plugin-dir

You can test any package directly:

```bash
# Test skill standalone
claude --plugin-dir ./packages/skill

# Test subagent standalone
claude --plugin-dir ./packages/subagent

# Test combined (after build)
claude --plugin-dir ./plugin
```

## Distribution

Each package can be distributed independently:

### As Standalone Plugins

Users can install individual packages:

```bash
# Install just the skill
claude /plugin install ./packages/skill

# Install just the subagent
claude /plugin install ./packages/subagent
```

### As Combined Plugin

For the full experience:

```bash
# Build first
pnpm build

# Install combined plugin
claude /plugin install ./plugin
```

### Publishing to npm

Each package has `private: false` and appropriate `files` fields for npm publishing:

```bash
# Publish packages
pnpm -r publish

# Or individually
cd packages/skill && pnpm publish
cd packages/subagent && pnpm publish
cd plugin && pnpm build && pnpm publish
```

## Adding New Components

### Adding a New Skill

1. Create a directory in `packages/skill/skills/your-skill-name/`
2. Add a `SKILL.md` with required frontmatter:

```yaml
---
name: your-skill-name
description: Description of when to use this skill (max 200 chars)
---

# Your Skill Name

Instructions for Claude...
```

### Adding a New Agent

1. Create a file in `packages/subagent/agents/your-agent.md`
2. Add required frontmatter:

```yaml
---
name: your-agent
description: Description of the agent's purpose
tools:
  - Read
  - Write
  - Edit
---

# Your Agent

Agent instructions...
```

## License

MIT
