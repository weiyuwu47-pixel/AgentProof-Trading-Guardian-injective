import { createHash } from "node:crypto";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function normalize(value: unknown): JsonValue {
  if (value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .reduce<Record<string, JsonValue>>((sorted, key) => {
        sorted[key] = normalize(record[key]);
        return sorted;
      }, {});
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return String(value);
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export function hashStableJson(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}
