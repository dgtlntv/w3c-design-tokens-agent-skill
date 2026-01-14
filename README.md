# W3C Design Tokens Agent Skill

An agent skill for creating and validating design token files that conform to the [W3C Design Token Community Group (DTCG)](https://www.w3.org/community/design-tokens/) specification.

## What it does

- Creates W3C-compliant `.tokens.json` files with correct structure and types
- Validates token files against official JSON schemas
- Supports all 13 token types: color, dimension, fontFamily, fontWeight, duration, cubicBezier, number, shadow, border, transition, strokeStyle, gradient, typography
- Handles aliases, references, groups, and resolver files for theming

## Installation

This skill follows the open [Agent Skills](https://agentskills.io) standard and works with multiple AI coding tools.

### Claude Code

```shell
/plugin marketplace add dgtlntv/w3c-design-tokens-agent-skill
/plugin install design-tokens@w3c-design-tokens-agent-skill
```

[Claude Code Plugin Docs](https://docs.anthropic.com/en/docs/claude-code/plugins)

### Gemini CLI

```shell
# Enable experimental.skills in /settings first
gemini skills install https://github.com/dgtlntv/w3c-design-tokens-agent-skill.git --path dist/skills/design-tokens
```

[Gemini CLI Skills Docs](https://geminicli.com/docs/cli/skills/)

### OpenAI Codex CLI

Use the `$skill-installer` skill and prompt it to install from this repository:

```
$skill-installer install design-tokens from https://github.com/dgtlntv/w3c-design-tokens-agent-skill, path dist/skills/design-tokens
```

[Codex Skills Docs](https://developers.openai.com/codex/skills/)

### GitHub Copilot (VS Code & CLI)

Copy the skill to your skills directory:

```shell
# Clone and copy the skill folder
git clone https://github.com/dgtlntv/w3c-design-tokens-agent-skill /tmp/dtcg-skill
cp -r /tmp/dtcg-skill/dist/skills/design-tokens ~/.copilot/skills/

# Or add to your repo
cp -r /tmp/dtcg-skill/dist/skills/design-tokens .github/skills/
```

[VS Code Agent Skills Docs](https://code.visualstudio.com/docs/copilot/customization/agent-skills) | [GitHub Copilot Agent Skills Docs](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

## Usage

Once installed, the agent automatically activates when you:

- Ask about design tokens or the W3C DTCG specification
- Create or edit `.tokens.json` files
- Need to validate token file structure

Example prompts:

- "Create a color palette with primary, secondary, and neutral colors"
- "Add a typography scale to my tokens file"
- "Why is my token file failing validation?"

## License

See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for license information.
