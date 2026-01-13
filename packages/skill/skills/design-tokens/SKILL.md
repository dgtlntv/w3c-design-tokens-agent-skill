---
name: design-tokens
description: Create W3C-compliant design token JSON files. Use when writing tokens.json or editing design token definitions. Focused on correct JSON structure and type validation.
allowed-tools: Read, Grep, Glob, Bash(node:*), Bash(npx:*)
---

# W3C Design Tokens Skill

This skill helps you write design token JSON that conforms to the W3C Design Token Community Group (DTCG) specification. The focus is on **correct JSON structure and type compliance**, not token naming conventions or design token taxonomy.

## Quick Reference

**File extensions**: `.tokens` or `.tokens.json`
**MIME type**: `application/design-tokens+json`

Basic token structure:

```json
{
  "token-name": {
    "$type": "color",
    "$value": { "colorSpace": "srgb", "components": [1, 0, 0] },
    "$description": "Optional description"
  }
}
```

## When to Use This Skill

Use this skill when:

- Creating new design token JSON files
- Validating token structure against the W3C specification
- Implementing specific token types (color, dimension, typography, etc.)
- Setting up token groups and aliases
- Working with resolver files for theming/modes
- Debugging malformed token JSON

## Token Properties

Every design token supports these properties:

| Property       | Required | Description                                        |
| -------------- | -------- | -------------------------------------------------- |
| `$value`       | Yes\*    | The token's value (type-specific format)           |
| `$type`        | Yes\*\*  | Token type identifier                              |
| `$description` | No       | Plain text explaining the token's purpose          |
| `$deprecated`  | No       | Boolean or string explaining deprecation reason    |
| `$extensions`  | No       | Vendor-specific data (use reverse domain notation) |

\*Required unless using `$ref` for JSON Pointer references
\*\*Required unless inherited from parent group

For complete property definitions, see [spec/format/design-token.md](spec/format/design-token.md).

## Token Types

The W3C DTCG specification defines 13 token types divided into simple and composite types.

### Simple Types

#### color

Colors use a structured format with explicit color space:

```json
{
  "brand-red": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [1, 0, 0],
      "alpha": 1
    }
  }
}
```

**Supported color spaces**: srgb, srgb-linear, hsl, hwb, lab, lch, oklab, oklch, display-p3, a98-rgb, prophoto-rgb, rec2020, xyz-d65, xyz-d50

**Properties**:

- `colorSpace` (required): One of the supported color spaces
- `components` (required): Array of 3 numbers (channel values)
- `alpha` (optional): Number 0-1, defaults to 1
- `hex` (optional): Fallback hex string for legacy tools

Component values can be `"none"` for unspecified channels (useful for interpolation).

For complete color space definitions and component ranges, see [spec/color/color-type.md](spec/color/color-type.md).

#### dimension

Distance/size values with explicit units:

```json
{
  "spacing-medium": {
    "$type": "dimension",
    "$value": { "value": 16, "unit": "px" }
  }
}
```

**Supported units**: `px` (viewport pixels), `rem` (relative to system default font size)

#### fontFamily

Font names as string or array (most to least preferred):

```json
{
  "font-body": {
    "$type": "fontFamily",
    "$value": ["Inter", "Helvetica Neue", "sans-serif"]
  }
}
```

Single font: `"$value": "Inter"`

#### fontWeight

Numeric weight [1-1000] or string alias:

```json
{
  "weight-bold": {
    "$type": "fontWeight",
    "$value": 700
  }
}
```

**String aliases**: thin (100), extra-light (200), light (300), normal/regular/book (400), medium (500), semi-bold/demi-bold (600), bold (700), extra-bold/ultra-bold (800), black/heavy (900), extra-black/ultra-black (950)

#### duration

Time values for animations:

```json
{
  "animation-fast": {
    "$type": "duration",
    "$value": { "value": 200, "unit": "ms" }
  }
}
```

**Supported units**: `ms` (milliseconds), `s` (seconds)

#### cubicBezier

Easing function as array of 4 numbers [P1x, P1y, P2x, P2y]:

```json
{
  "ease-out": {
    "$type": "cubicBezier",
    "$value": [0, 0, 0.58, 1]
  }
}
```

X values must be in [0, 1]. Y values can be any number.

#### number

Raw numeric values (unitless):

```json
{
  "line-height-normal": {
    "$type": "number",
    "$value": 1.5
  }
}
```

Use cases: gradient stop positions, line-height multipliers, z-index values.

For all simple type definitions, see [spec/format/types.md](spec/format/types.md).

### Composite Types

Composite types contain structured sub-values that reference other token types.

#### shadow

Single shadow or array of shadows:

```json
{
  "shadow-medium": {
    "$type": "shadow",
    "$value": {
      "color": {
        "colorSpace": "srgb",
        "components": [0, 0, 0],
        "alpha": 0.25
      },
      "offsetX": { "value": 0, "unit": "px" },
      "offsetY": { "value": 4, "unit": "px" },
      "blur": { "value": 8, "unit": "px" },
      "spread": { "value": 0, "unit": "px" }
    }
  }
}
```

**Properties**: `color`, `offsetX`, `offsetY`, `blur`, `spread` (all required), `inset` (optional boolean)

For layered shadows, use an array of shadow objects.

#### border

Complete border definition:

```json
{
  "border-default": {
    "$type": "border",
    "$value": {
      "color": { "colorSpace": "srgb", "components": [0.8, 0.8, 0.8] },
      "width": { "value": 1, "unit": "px" },
      "style": "solid"
    }
  }
}
```

**Properties**: `color` (color), `width` (dimension), `style` (strokeStyle)

#### transition

Animation transition definition:

```json
{
  "transition-default": {
    "$type": "transition",
    "$value": {
      "duration": { "value": 200, "unit": "ms" },
      "delay": { "value": 0, "unit": "ms" },
      "timingFunction": [0.25, 0.1, 0.25, 1]
    }
  }
}
```

**Properties**: `duration` (duration), `delay` (duration), `timingFunction` (cubicBezier)

#### strokeStyle

String preset or object with dash configuration:

String values: `solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `outset`, `inset`

Object format:

```json
{
  "stroke-dashed": {
    "$type": "strokeStyle",
    "$value": {
      "dashArray": [
        { "value": 4, "unit": "px" },
        { "value": 2, "unit": "px" }
      ],
      "lineCap": "round"
    }
  }
}
```

**lineCap values**: `round`, `butt`, `square`

#### gradient

Array of gradient stops:

```json
{
  "gradient-primary": {
    "$type": "gradient",
    "$value": [
      {
        "color": { "colorSpace": "srgb", "components": [0, 0.4, 1] },
        "position": 0
      },
      {
        "color": { "colorSpace": "srgb", "components": [0, 0.6, 0.8] },
        "position": 1
      }
    ]
  }
}
```

**Stop properties**: `color` (color), `position` (number 0-1, clamped)

#### typography

Complete typography definition:

```json
{
  "typography-body": {
    "$type": "typography",
    "$value": {
      "fontFamily": ["Inter", "sans-serif"],
      "fontSize": { "value": 16, "unit": "px" },
      "fontWeight": 400,
      "letterSpacing": { "value": 0, "unit": "px" },
      "lineHeight": 1.5
    }
  }
}
```

**Properties**: `fontFamily` (fontFamily), `fontSize` (dimension), `fontWeight` (fontWeight), `letterSpacing` (dimension), `lineHeight` (number)

For complete composite type definitions, see [spec/format/composite-types.md](spec/format/composite-types.md).

## Groups

Groups organize tokens hierarchically. Child tokens inherit `$type` from their parent group.

```json
{
  "color": {
    "$type": "color",
    "$description": "All color tokens",
    "brand": {
      "primary": {
        "$value": { "colorSpace": "srgb", "components": [0, 0.4, 0.8] }
      },
      "secondary": {
        "$value": { "colorSpace": "srgb", "components": [0.4, 0.2, 0.6] }
      }
    }
  }
}
```

**Group properties**:

- `$type`: Inherited by child tokens (can be overridden)
- `$description`: Group purpose
- `$extends`: Reference another group for inheritance
- `$deprecated`: Mark entire group as deprecated
- `$extensions`: Vendor-specific data

**Reserved names**: Properties starting with `$` are reserved. Use `$root` for a token at the group level itself.

For complete group definitions, see [spec/format/groups.md](spec/format/groups.md).

## Aliases and References

### Curly Brace Syntax (Recommended)

Reference another token's complete value:

```json
{
  "color": {
    "brand": {
      "$type": "color",
      "$value": { "colorSpace": "srgb", "components": [0, 0.4, 0.8] }
    },
    "button-background": {
      "$type": "color",
      "$value": "{color.brand}"
    }
  }
}
```

The path uses dot notation and always resolves to the referenced token's `$value`.

### JSON Pointer Syntax

For property-level access using RFC 6901:

```json
{
  "source": {
    "$type": "color",
    "$value": { "colorSpace": "srgb", "components": [1, 0, 0] },
    "$description": "Source color"
  },
  "target": {
    "$ref": "#/source",
    "$description": "Overrides description but inherits value and type"
  }
}
```

**Important**: Curly brace references resolve to `$value` only. JSON Pointer references can access any property.

For complete alias documentation, see [spec/format/aliases.md](spec/format/aliases.md).

## Resolver Files

Resolver files serve as the **entry point** for design token systems. Rather than pointing tools at individual `.tokens.json` files, you point them at a resolver file which orchestrates how multiple token files are loaded, merged, and resolved based on context (themes, modes, density, etc.).

Use resolvers when your design system needs:

- Multiple themes (light/dark mode)
- Conditional variations (compact/comfortable density)
- Layered token architecture (primitives → semantic → component tokens)
- A single source of truth for tool configuration

Basic resolver structure:

```json
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/resolver.json",
  "version": "2025.10",
  "sets": {
    "core": {
      "sources": [{ "$ref": "./tokens/core.tokens.json" }]
    }
  },
  "modifiers": {
    "colorScheme": {
      "contexts": {
        "light": [{ "$ref": "./tokens/light.tokens.json" }],
        "dark": [{ "$ref": "./tokens/dark.tokens.json" }]
      },
      "default": "light"
    }
  },
  "resolutionOrder": ["core", "colorScheme"]
}
```

### Sets

Named collections of design tokens:

```json
"sets": {
  "foundation": {
    "description": "Core primitive tokens",
    "sources": [
      { "$ref": "./primitives.tokens.json" },
      { "inline": { "token": { "$type": "number", "$value": 1 } } }
    ]
  }
}
```

Multiple sources merge in array order (last wins on conflict).

### Modifiers

Conditional token variations with 2+ contexts:

```json
"modifiers": {
  "density": {
    "description": "UI density settings",
    "contexts": {
      "comfortable": [{ "$ref": "./density-comfortable.tokens.json" }],
      "compact": [{ "$ref": "./density-compact.tokens.json" }]
    },
    "default": "comfortable"
  }
}
```

### Resolution Order

Array defining token merge sequence:

```json
"resolutionOrder": ["foundation", "colorScheme", "density"]
```

Tokens resolve left-to-right, later entries override earlier ones.

For complete resolver documentation, see [spec/resolver/introduction.md](spec/resolver/introduction.md).

## Schema Validation

JSON schemas are available for validating token files:

**Token format schema**: Use to validate `.tokens.json` files
**Resolver schema**: Use to validate resolver configuration files

Type-specific schemas validate:

- Correct `$value` structure for each token type
- Required properties for composite types
- Valid color spaces and component counts
- Unit strings for dimension/duration types
- Number ranges for fontWeight, cubicBezier, etc.

## Common Mistakes

### Incorrect color format

```json
// WRONG: Legacy hex format
{ "$type": "color", "$value": "#ff0000" }

// CORRECT: Structured color space format
{ "$type": "color", "$value": { "colorSpace": "srgb", "components": [1, 0, 0] } }
```

### Missing required properties

```json
// WRONG: Missing $type (unless inherited from group)
{ "spacing": { "$value": { "value": 16, "unit": "px" } } }

// CORRECT: Include $type
{ "spacing": { "$type": "dimension", "$value": { "value": 16, "unit": "px" } } }
```

### Invalid composite type structure

```json
// WRONG: Using token references as strings
{
  "$type": "shadow",
  "$value": {
    "color": "#000000",  // Should be color object
    "offsetX": "4px"     // Should be dimension object
  }
}

// CORRECT: Full type-compliant values
{
  "$type": "shadow",
  "$value": {
    "color": { "colorSpace": "srgb", "components": [0, 0, 0], "alpha": 0.5 },
    "offsetX": { "value": 4, "unit": "px" },
    "offsetY": { "value": 4, "unit": "px" },
    "blur": { "value": 8, "unit": "px" },
    "spread": { "value": 0, "unit": "px" }
  }
}
```

### Circular references

```json
// WRONG: Creates infinite loop
{
  "a": { "$type": "color", "$value": "{b}" },
  "b": { "$type": "color", "$value": "{a}" }
}
```

### Invalid property names

Token and group names cannot:

- Start with `$` (reserved for specification properties)
- Contain `{` or `}` (reserved for alias syntax)
- Contain `.` (reserved for path notation)

## Extensions

Vendor-specific data uses `$extensions` with reverse domain notation:

```json
{
  "button-color": {
    "$type": "color",
    "$value": { "colorSpace": "srgb", "components": [0, 0.4, 0.8] },
    "$extensions": {
      "com.figma": {
        "variableId": "VariableID:123:456"
      },
      "com.example.tool": {
        "customProperty": "value"
      }
    }
  }
}
```

Extensions are tool-specific and should be ignored by tools that don't recognize them.

## Additional Resources

For detailed specification sections:

- **File format basics**: [spec/format/file-format.md](spec/format/file-format.md)
- **Terminology**: [spec/format/terminology.md](spec/format/terminology.md)
- **Token definition**: [spec/format/design-token.md](spec/format/design-token.md)
- **Type definitions**: [spec/format/types.md](spec/format/types.md)
- **Composite types**: [spec/format/composite-types.md](spec/format/composite-types.md)
- **Groups**: [spec/format/groups.md](spec/format/groups.md)
- **Aliases**: [spec/format/aliases.md](spec/format/aliases.md)
- **Color spaces**: [spec/color/color-type.md](spec/color/color-type.md)
- **Resolver system**: [spec/resolver/introduction.md](spec/resolver/introduction.md)
- **Resolver inputs**: [spec/resolver/inputs.md](spec/resolver/inputs.md)
- **Resolver syntax**: [spec/resolver/syntax.md](spec/resolver/syntax.md)
- **Resolution logic**: [spec/resolver/resolution-logic.md](spec/resolver/resolution-logic.md)
