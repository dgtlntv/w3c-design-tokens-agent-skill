import Ajv from "ajv";
import addFormats from "ajv-formats";
import { dirname, resolve, join } from "path";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
const __dirname$1 = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = resolve(__dirname$1, "../schemas");
const SCHEMA_PATHS = {
  tokens: join(SCHEMA_DIR, "format.json"),
  resolver: join(SCHEMA_DIR, "resolver.json")
};
const schemaCache = /* @__PURE__ */ new Map();
async function loadSchema(uri) {
  let schemaPath;
  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    const urlPath = new URL(uri).pathname;
    const filename = urlPath.split("/").pop();
    schemaPath = join(SCHEMA_DIR, filename);
  } else if (uri.startsWith("/")) {
    schemaPath = uri;
  } else {
    schemaPath = join(SCHEMA_DIR, uri);
  }
  const cached = schemaCache.get(schemaPath);
  if (cached) {
    return cached;
  }
  const content = await readFile(schemaPath, "utf-8");
  const schema = JSON.parse(content);
  schemaCache.set(schemaPath, schema);
  return schema;
}
async function loadReferencedSchemas(ajv, schema, baseDir) {
  const processValue = async (value) => {
    if (typeof value !== "object" || value === null) return;
    if (Array.isArray(value)) {
      for (const item of value) {
        await processValue(item);
      }
      return;
    }
    const obj = value;
    if (typeof obj.$ref === "string" && !obj.$ref.startsWith("#") && !obj.$ref.includes("#")) {
      const refPath = join(baseDir, obj.$ref);
      if (!schemaCache.has(refPath)) {
        const refSchema = await loadSchema(refPath);
        const schemaId = refSchema.$id || obj.$ref;
        if (!ajv.getSchema(schemaId)) {
          ajv.addSchema(refSchema, obj.$ref);
        }
        await loadReferencedSchemas(ajv, refSchema, dirname(refPath));
      }
    }
    for (const key of Object.keys(obj)) {
      if (key !== "$ref") {
        await processValue(obj[key]);
      }
    }
  };
  await processValue(schema);
}
function createValidator() {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false
  });
  addFormats(ajv);
  return ajv;
}
async function validateFile(file, validateFn, schema) {
  const content = await readFile(file, "utf-8");
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    return {
      file,
      valid: false,
      errors: `Invalid JSON: ${e.message}`
    };
  }
  const valid = validateFn(data);
  if (valid) {
    return { file, valid: true };
  }
  const errorMessages = validateFn.errors.map((err) => {
    return `${err.instancePath} ${err.keyword}: ${err.message}`;
  }).join("\n");
  return { file, valid: false, errors: errorMessages };
}
async function validate(type, file) {
  const schemaPath = SCHEMA_PATHS[type];
  const schema = await loadSchema(schemaPath);
  const ajv = createValidator();
  await loadReferencedSchemas(ajv, schema, dirname(schemaPath));
  const validateFn = ajv.compile(schema);
  const result = await validateFile(file, validateFn);
  if (result.valid) {
    console.log(`\x1B[32m✓\x1B[0m ${file}`);
  } else {
    console.log(`\x1B[31m✗\x1B[0m ${file}`);
    console.log(result.errors);
  }
  return result.valid;
}
async function main() {
  const type = process.argv[2];
  const file = process.argv[3];
  const validTypes = ["tokens", "resolver"];
  if (!type || !validTypes.includes(type) || !file) {
    console.error("Usage: node validate.js <tokens|resolver> <file>");
    console.error("");
    console.error("Examples:");
    console.error("  node scripts/validate.js tokens ./colors.tokens.json");
    console.error("  node scripts/validate.js resolver ./theme.resolver.json");
    process.exit(1);
  }
  const valid = await validate(type, file);
  process.exit(valid ? 0 : 1);
}
main().catch((error) => {
  console.error("Validation failed:", error);
  process.exit(1);
});
