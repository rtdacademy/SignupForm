# Schema Helper

The Schema Helper module provides types and utilities for working with JSON schemas and function declarations.

## JSONSchemaType

```typescript
type JSONSchemaType =
  | "string"
  | "number"
  | "integer"
  | "object"
  | "array"
  | "boolean"
  | "null"
```

Represents the possible JSON schema types.

## JSONSchema Interface

```typescript
interface JSONSchema {
  anyOf?: JSONSchema[];
  default?: unknown;
  description?: string;
  enum?: unknown[];
  format?: string;
  items?: JSONSchema;
  maximum?: number;
  maxItems?: string;
  maxLength?: string;
  maxProperties?: string;
  minimum?: number;
  minItems?: string;
  minLength?: string;
  minProperties?: string;
  pattern?: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  title?: string;
  type?: JSONSchemaType | JSONSchemaType[];
}
```

A subset of JSON Schema according to 2020-12 JSON Schema draft. This interface is compatible with OpenAPI 3.1 schema objects.

### Properties

- `anyOf?`: Used for Union types and Intersection types
- `default?`: Supply a default JSON value (not supported for Gemini API)
- `description?`: Explanation about the purpose of the schema
- `enum?`: Specify possible values for an enum
- `format?`: Defines semantic information about a string instance (e.g., "date-time", "email")
- `items?`: Used for arrays to define the schema of elements
- `maximum?`: Specify maximum value for a number
- `maxItems?`: Specify maximum number of elements in an array
- `maxLength?`: Specify maximum length of a string
- `maxProperties?`: Specify maximum number of properties in an object
- `minimum?`: Specify minimum value for a number
- `minItems?`: Specify minimum number of elements in an array
- `minLength?`: Specify minimum length of a string
- `minProperties?`: Specify minimum number of properties in an object
- `pattern?`: Specify a regular expression for string validation
- `properties?`: Define the schema of properties in an object
- `required?`: Specify properties that must be present
- `title?`: Short description (not supported for Gemini API)
- `type?`: Validation type or array of types

## Functions

### functionDeclarationFromZodFunction

```typescript
function functionDeclarationFromZodFunction(
  zodFunction: ZodFunction
): FunctionDeclaration
```

[Experimental] Converts a Zod function schema definition into a FunctionDeclaration object. Currently, the function only supports functions with one parameter value, which can be an object or void.

Parameters:
- `zodFunction`: The ZodFunction object containing name and zod function schema

Returns:
- A FunctionDeclaration object

Throws:
- If the input zodFunction contains parameters that cannot be converted to Schema objects
- If the input zodFunction contains more than one parameter or the parameter is not an object