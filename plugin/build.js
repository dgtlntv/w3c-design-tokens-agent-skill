#!/usr/bin/env node

/**
 * Build script for the combined plugin
 * Copies skills and agents from workspace dependencies
 */

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const SKILL_SOURCE = join(__dirname, "..", "packages", "skill", "skills")
const AGENT_SOURCE = join(__dirname, "..", "packages", "subagent", "agents")

const SKILL_DEST = join(__dirname, "skills")
const AGENT_DEST = join(__dirname, "agents")

console.log("Building combined plugin...\n")

// Clean and copy skills
if (existsSync(SKILL_DEST)) {
  rmSync(SKILL_DEST, { recursive: true })
}
mkdirSync(SKILL_DEST, { recursive: true })
cpSync(SKILL_SOURCE, SKILL_DEST, { recursive: true })
console.log("✓ Copied skills from @design-tokens/skill")

// Clean and copy agents
if (existsSync(AGENT_DEST)) {
  rmSync(AGENT_DEST, { recursive: true })
}
mkdirSync(AGENT_DEST, { recursive: true })
cpSync(AGENT_SOURCE, AGENT_DEST, { recursive: true })
console.log("✓ Copied agents from @design-tokens/subagent")

console.log("\nBuild complete!")
