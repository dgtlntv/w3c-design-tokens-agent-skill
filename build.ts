#!/usr/bin/env npx tsx

/**
 * @fileoverview Build script for design-tokens plugin
 *
 * Builds the plugin by:
 * 1. Copying spec files from the W3C DTCG submodule
 * 2. Copying JSON schemas from the submodule
 * 3. Copying skill assets (.claude-plugin, SKILL.md)
 * 4. Compiling the validation script with Vite
 *
 * @example
 * ```bash
 * pnpm build
 * ```
 */

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { execSync } from "node:child_process"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ============================================================================
// Paths
// ============================================================================

/** Root path to the W3C DTCG git submodule */
const VENDOR_ROOT = join(__dirname, "vendor", "w3c-dtcg")

/** Source paths */
const TECHNICAL_REPORTS = join(VENDOR_ROOT, "technical-reports")
const SCHEMA_SOURCE = join(VENDOR_ROOT, "www", "public", "schemas", "2025.10")
const SKILL_SOURCE = join(__dirname, "src", "skills", "design-tokens")
const PLUGIN_SOURCE = join(__dirname, "src", ".claude-plugin")
const THIRD_PARTY_NOTICES = join(__dirname, "THIRD_PARTY_NOTICES.md")
const LICENSE = join(__dirname, "LICENSE")

/** Destination paths (all under dist/) */
const DIST = join(__dirname, "dist")
const SKILL_DEST = join(DIST, "skills", "design-tokens")
const SPEC_DEST = join(SKILL_DEST, "spec")
const SCHEMA_DEST = join(SKILL_DEST, "schemas")
const PLUGIN_DEST = join(DIST, ".claude-plugin")

// ============================================================================
// Spec file mapping
// ============================================================================

const SPEC_DIRS: Record<string, readonly string[]> = {
  format: [
    "aliases.md",
    "composite-types.md",
    "design-token.md",
    "file-format.md",
    "groups.md",
    "terminology.md",
    "types.md",
  ],
  color: [
    "overview.md",
    "color-type.md",
    "color-terminology.md",
    "interpolation.md",
    "gamut-mapping.md",
    "token-naming.md",
  ],
  resolver: [
    "introduction.md",
    "terminology.md",
    "inputs.md",
    "syntax.md",
    "resolution-logic.md",
    "bundling.md",
    "filetype.md",
    "http-headers.md",
    "conformance.md",
  ],
}

// ============================================================================
// Build functions
// ============================================================================

function cleanDist(): void {
  console.log("Cleaning dist/...")
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true })
  }
  mkdirSync(DIST, { recursive: true })
}

function copySpecFiles(): void {
  console.log("\nCopying spec files...")

  mkdirSync(SPEC_DEST, { recursive: true })

  for (const [dir, files] of Object.entries(SPEC_DIRS)) {
    const srcDir = join(TECHNICAL_REPORTS, dir)
    const destDir = join(SPEC_DEST, dir)
    mkdirSync(destDir, { recursive: true })

    console.log(`  ${dir}/`)
    for (const file of files) {
      const src = join(srcDir, file)
      const dest = join(destDir, file)
      if (existsSync(src)) {
        cpSync(src, dest)
        console.log(`    ✓ ${file}`)
      } else {
        console.warn(`    ⚠ ${file} not found, skipping`)
      }
    }
  }
}

function copySchemas(): void {
  console.log("\nCopying schemas...")
  mkdirSync(SCHEMA_DEST, { recursive: true })
  cpSync(SCHEMA_SOURCE, SCHEMA_DEST, { recursive: true })
  console.log("  ✓ Copied schemas to skill folder")
}

function copySkillAssets(): void {
  console.log("\nCopying skill assets...")

  // Copy .claude-plugin
  mkdirSync(PLUGIN_DEST, { recursive: true })
  cpSync(PLUGIN_SOURCE, PLUGIN_DEST, { recursive: true })
  console.log("  ✓ Copied .claude-plugin/")

  // Copy SKILL.md
  const skillMdSrc = join(SKILL_SOURCE, "SKILL.md")
  const skillMdDest = join(SKILL_DEST, "SKILL.md")
  if (existsSync(skillMdSrc)) {
    cpSync(skillMdSrc, skillMdDest)
    console.log("  ✓ Copied SKILL.md")
  }
}

function buildValidationScript(): void {
  console.log("\nBuilding validation script...")
  execSync("npx vite build", { cwd: __dirname, stdio: "inherit" })
  console.log("  ✓ Built validate.js")
}

function copyLicenseNotices(): void {
  console.log("\nCopying license notices...")
  if (existsSync(LICENSE)) {
    cpSync(LICENSE, join(SKILL_DEST, "LICENSE"))
    console.log("  ✓ Copied LICENSE")
  } else {
    console.warn("  ⚠ LICENSE not found")
  }
  if (existsSync(THIRD_PARTY_NOTICES)) {
    cpSync(THIRD_PARTY_NOTICES, join(SKILL_DEST, "THIRD_PARTY_NOTICES.md"))
    console.log("  ✓ Copied THIRD_PARTY_NOTICES.md")
  } else {
    console.warn("  ⚠ THIRD_PARTY_NOTICES.md not found")
  }
}

function build(): void {
  console.log("Building design-tokens plugin...\n")

  // Check if submodule exists
  if (!existsSync(VENDOR_ROOT)) {
    console.error("Error: W3C DTCG submodule not found at vendor/w3c-dtcg")
    console.error("Run: git submodule update --init")
    process.exit(1)
  }

  cleanDist()
  copySpecFiles()
  copySchemas()
  copySkillAssets()
  copyLicenseNotices()
  buildValidationScript()

  console.log("\n✓ Build complete! Output in dist/")
}

build()
