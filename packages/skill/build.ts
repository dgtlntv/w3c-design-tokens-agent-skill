#!/usr/bin/env npx tsx

/**
 * @fileoverview Build script for @design-tokens/skill
 *
 * Copies spec files and JSON schemas from the W3C DTCG submodule into the skill package.
 * This enables the skill to be distributed via npm without requiring the git submodule.
 *
 * @example
 * ```bash
 * pnpm build
 * ```
 *
 * @requires The W3C DTCG submodule must be initialized at `vendor/w3c-dtcg`
 * @see {@link https://github.com/design-tokens/community-group} W3C DTCG Repository
 */

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/** Current directory of this script */
const __dirname = dirname(fileURLToPath(import.meta.url))

/** Root path to the W3C DTCG git submodule */
const VENDOR_ROOT = join(__dirname, "..", "..", "vendor", "w3c-dtcg")

/** Source path for technical report markdown files */
const TECHNICAL_REPORTS = join(VENDOR_ROOT, "technical-reports")

/** Source path for JSON schema files (versioned) */
const SCHEMA_SOURCE = join(VENDOR_ROOT, "www", "public", "schemas", "2025.10")

/** Destination path for spec files within the skill */
const SPEC_DEST = join(__dirname, "skills", "design-tokens", "spec")

/** Destination path for schema files */
const SCHEMA_DEST = join(__dirname, "schemas")

/**
 * Mapping of spec directories to their markdown files.
 * Only includes documentation files - images and changelogs are excluded.
 *
 * @property {string[]} format - Core token format specification
 * @property {string[]} color - Color token specifications
 * @property {string[]} resolver - Token resolution specifications
 */
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

/**
 * Copies spec markdown files from the submodule to the skill package.
 * Creates subdirectories for each spec category (format, color, resolver).
 */
function copySpecFiles(): void {
  console.log("Copying spec files...")

  if (existsSync(SPEC_DEST)) {
    rmSync(SPEC_DEST, { recursive: true })
  }
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

/**
 * Copies JSON schema files from the submodule to the skill package.
 * Preserves the directory structure of the source schemas.
 */
function copySchemas(): void {
  console.log("\nCopying schemas...")

  if (existsSync(SCHEMA_DEST)) {
    rmSync(SCHEMA_DEST, { recursive: true })
  }
  mkdirSync(SCHEMA_DEST, { recursive: true })
  cpSync(SCHEMA_SOURCE, SCHEMA_DEST, { recursive: true })

  console.log("  ✓ Copied schemas")
}

/**
 * Main build function.
 * Validates the submodule exists, then copies spec files and schemas.
 *
 * @throws Exits with code 1 if the W3C DTCG submodule is not found
 */
function build(): void {
  console.log("Building @design-tokens/skill...\n")

  // Check if submodule exists
  if (!existsSync(VENDOR_ROOT)) {
    console.error("Error: W3C DTCG submodule not found at vendor/w3c-dtcg")
    console.error("Run: git submodule update --init")
    process.exit(1)
  }

  copySpecFiles()
  copySchemas()

  console.log("\nBuild complete!")
}

build()
