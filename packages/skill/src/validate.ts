import Ajv, { type AnySchemaObject, type ValidateFunction } from "ajv"
import addFormats from "ajv-formats"
import betterAjvErrors from "better-ajv-errors"
import { resolve, dirname, join } from "path"
import { readFile } from "fs/promises"
import { fileURLToPath } from "url"
import { glob } from "glob"

// ============================================================================
// Types
// ============================================================================

/** Supported validation target types */
type ValidationType = "tokens" | "resolvers"

/** Result of validating a single file */
interface FileValidationResult {
  file: string
  valid: boolean
  errors?: string
}

// ============================================================================
// Configuration
// ============================================================================

/** Directory containing local W3C DTCG schemas */
const __dirname = dirname(fileURLToPath(import.meta.url))
const SCHEMA_DIR = resolve(__dirname, "../schemas")

/** Local schema file paths */
const SCHEMA_PATHS: Record<ValidationType, string> = {
  tokens: join(SCHEMA_DIR, "format.json"),
  resolvers: join(SCHEMA_DIR, "resolver.json"),
}

/** Glob patterns for finding files to validate */
const FILE_PATTERNS: Record<ValidationType, string> = {
  tokens: "**/*.tokens.json",
  resolvers: "**/*.resolver.json",
}

// ============================================================================
// Schema Loading
// ============================================================================

/** Cache for loaded schemas to avoid redundant file reads */
const schemaCache = new Map<string, AnySchemaObject>()

/**
 * Loads a JSON schema from the local filesystem, using cache when available.
 * Resolves relative paths from the schema directory.
 *
 * @param uri - The URI or relative path of the schema to load
 * @returns The parsed JSON schema object
 * @throws Error if the file cannot be read or parsed
 */
async function loadSchema(uri: string): Promise<AnySchemaObject> {
  // Normalize URI to local file path
  let schemaPath: string

  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    // Map remote URLs to local paths (e.g., https://www.designtokens.org/schemas/2025.10/format.json -> schemas/format.json)
    const urlPath = new URL(uri).pathname
    const filename = urlPath.split("/").pop()!
    schemaPath = join(SCHEMA_DIR, filename)
  } else if (uri.startsWith("/")) {
    schemaPath = uri
  } else {
    // Relative path - resolve from schema directory
    schemaPath = join(SCHEMA_DIR, uri)
  }

  const cached = schemaCache.get(schemaPath)
  if (cached) {
    return cached
  }

  const content = await readFile(schemaPath, "utf-8")
  const schema = JSON.parse(content) as AnySchemaObject
  schemaCache.set(schemaPath, schema)
  return schema
}

/**
 * Recursively loads all schemas referenced by $ref in a schema.
 * This ensures AJV has all schemas available before compilation.
 *
 * @param ajv - The AJV instance to add schemas to
 * @param schema - The schema to process
 * @param baseDir - The base directory for resolving relative $ref paths
 */
async function loadReferencedSchemas(
  ajv: Ajv,
  schema: AnySchemaObject,
  baseDir: string
): Promise<void> {
  const processValue = async (value: unknown): Promise<void> => {
    if (typeof value !== "object" || value === null) return

    if (Array.isArray(value)) {
      for (const item of value) {
        await processValue(item)
      }
      return
    }

    const obj = value as Record<string, unknown>

    // Check for $ref that points to another file (not internal #/ references)
    if (typeof obj.$ref === "string" && !obj.$ref.startsWith("#")) {
      const refPath = join(baseDir, obj.$ref)

      // Skip if already loaded
      if (!schemaCache.has(refPath)) {
        const refSchema = await loadSchema(refPath)

        // Add schema with its $id or use the file path
        const schemaId = refSchema.$id || obj.$ref
        if (!ajv.getSchema(schemaId)) {
          ajv.addSchema(refSchema, obj.$ref)
        }

        // Recursively load referenced schemas
        await loadReferencedSchemas(ajv, refSchema, dirname(refPath))
      }
    }

    // Process all properties recursively
    for (const key of Object.keys(obj)) {
      if (key !== "$ref") {
        await processValue(obj[key])
      }
    }
  }

  await processValue(schema)
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Creates and configures an AJV validator instance.
 *
 * @returns Configured AJV instance with format support
 */
function createValidator(): Ajv {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
  })
  addFormats(ajv)
  return ajv
}

/**
 * Finds all files matching a glob pattern.
 *
 * @param pattern - Glob pattern to match files against
 * @returns Array of file paths matching the pattern
 */
async function findFiles(pattern: string): Promise<string[]> {
  const files = await glob(pattern, { nodir: true })
  return files.sort()
}

/**
 * Validates a single JSON file against a schema.
 *
 * @param file - Path to the file to validate
 * @param validateFn - Compiled AJV validation function
 * @param schema - The schema (used for error formatting)
 * @returns Validation result with file path, validity, and any error messages
 */
async function validateFile(
  file: string,
  validateFn: ValidateFunction,
  schema: AnySchemaObject
): Promise<FileValidationResult> {
  const content = await readFile(file, "utf-8")

  let data: unknown
  try {
    data = JSON.parse(content)
  } catch (e) {
    return {
      file,
      valid: false,
      errors: `Invalid JSON: ${(e as Error).message}`,
    }
  }

  const valid = validateFn(data)

  if (valid) {
    return { file, valid: true }
  }

  const errors = betterAjvErrors(schema, data, validateFn.errors!, {
    format: "cli",
    json: content,
  })

  return { file, valid: false, errors: errors as string }
}

/**
 * Validates all files of a given type against the corresponding W3C schema.
 *
 * @param type - The type of files to validate ("tokens" or "resolvers")
 * @returns True if all files are valid, false otherwise
 */
async function validate(type: ValidationType): Promise<boolean> {
  const schemaPath = SCHEMA_PATHS[type]
  const filePattern = FILE_PATTERNS[type]

  // Load the main schema
  console.log(`Loading schema from ${schemaPath}...`)
  const schema = await loadSchema(schemaPath)

  // Create validator and load all referenced schemas
  const ajv = createValidator()
  await loadReferencedSchemas(ajv, schema, dirname(schemaPath))

  // Compile the main schema
  const validateFn = ajv.compile(schema)

  // Find files to validate
  const files = await findFiles(filePattern)

  if (files.length === 0) {
    console.log(`No files found matching ${filePattern}`)
    return true
  }

  console.log(`Found ${files.length} file(s) to validate\n`)

  // Validate each file
  let allValid = true

  for (const file of files) {
    const result = await validateFile(file, validateFn, schema)

    if (result.valid) {
      console.log(`\x1b[32m✓\x1b[0m ${file}`)
    } else {
      console.log(`\x1b[31m✗\x1b[0m ${file}`)
      console.log(result.errors)
      allValid = false
    }
  }

  return allValid
}

// ============================================================================
// CLI Entry Point
// ============================================================================

/**
 * Main entry point for the validation CLI.
 *
 * Usage:
 * - `pnpm validate:tokens` - Validate token files
 * - `pnpm validate:resolvers` - Validate resolver files
 */
async function main(): Promise<void> {
  const type = process.argv[2] as ValidationType | undefined
  const validTypes: ValidationType[] = ["tokens", "resolvers"]

  if (!type || !validTypes.includes(type)) {
    console.error("Usage: tsx src/validate.ts <tokens|resolvers>")
    process.exit(1)
  }

  const valid = await validate(type)
  process.exit(valid ? 0 : 1)
}

main().catch((error) => {
  console.error("Validation failed:", error)
  process.exit(1)
})
