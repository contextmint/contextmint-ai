/**
 * Flatten config/contextmint.defaults.yaml into dot-notation setting rows.
 */
import fs from "fs";
import YAML from "yaml";

const SKIP_TOP_LEVEL = new Set(["version"]);

/**
 * @param {unknown} val
 * @returns {"boolean" | "number" | "string" | "array" | "object" | "null"}
 */
function inferType(val) {
  if (val === null || val === undefined) return "null";
  if (Array.isArray(val)) return "array";
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "number") return "number";
  if (typeof val === "object") return "object";
  return "string";
}

/**
 * @param {unknown} value
 * @param {ReturnType<inferType>} type
 * @returns {string}
 */
export function formatYamlDefault(value, type) {
  if (value === null || value === undefined) return "—";
  if (type === "boolean") return value ? "true" : "false";
  if (type === "number") return String(value);
  if (type === "string") return value === "" ? '""' : String(value);
  if (type === "array") {
    const arr = /** @type {unknown[]} */ (value);
    if (arr.length === 0) return "[]";
    if (typeof arr[0] === "string") {
      // Always emit parseable JSON — catalog consumers compare to factory defaults.
      return JSON.stringify(arr);
    }
    return `[${arr.length} items]`;
  }
  if (type === "object") {
    const obj = /** @type {Record<string, unknown>} */ (value);
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    if (keys.length <= 3) return JSON.stringify(value);
    return `{${keys.length} keys — see contextmint.defaults.yaml}`;
  }
  return String(value);
}

/**
 * @param {Record<string, unknown>} doc
 * @param {number} [maxDepth]
 * @returns {Array<{ id: string, value: unknown, type: ReturnType<inferType> }>}
 */
export function flattenDefaults(doc, maxDepth = 4) {
  /** @type {Array<{ id: string, value: unknown, type: ReturnType<inferType> }>} */
  const rows = [];

  /**
   * @param {Record<string, unknown>} obj
   * @param {string} prefix
   * @param {number} depth
   */
  function walk(obj, prefix, depth) {
    for (const [key, val] of Object.entries(obj)) {
      const id = prefix ? `${prefix}.${key}` : key;
      const valType = inferType(val);
      if (valType === "object" && depth < maxDepth) {
        walk(/** @type {Record<string, unknown>} */ (val), id, depth + 1);
        continue;
      }
      rows.push({ id, value: val, type: valType });
    }
  }

  for (const [section, content] of Object.entries(doc)) {
    if (SKIP_TOP_LEVEL.has(section)) continue;
    if (content !== null && typeof content === "object" && !Array.isArray(content)) {
      walk(/** @type {Record<string, unknown>} */ (content), section, 1);
    }
  }

  rows.sort((a, b) => a.id.localeCompare(b.id));
  return rows;
}

/**
 * @param {string} defaultsPath
 * @returns {Array<{ id: string, value: unknown, type: ReturnType<inferType> }>}
 */
export function loadFlattenedDefaults(defaultsPath) {
  const text = fs.readFileSync(defaultsPath, "utf8");
  const doc = YAML.parse(text);
  return flattenDefaults(/** @type {Record<string, unknown>} */ (doc));
}

/**
 * @param {string} key
 * @returns {string}
 */
export function humanizeKey(key) {
  const leaf = key.split(".").pop() ?? key;
  return leaf
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
