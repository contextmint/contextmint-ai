/**
 * Generate src/_data/serverChatSettings.json from API defaults + structural plan YAML.
 * Run via npm run gen:settings in contextmint-ai/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  EXTENSION_RETRIEVAL_GUIDE,
  EXTENSION_SETTING_USAGE,
  SERVER_DEPENDENCY_NOTES,
  SERVER_ROLLOUT_SCENARIOS,
  SERVER_SETTING_USAGE,
  SERVER_VERIFY_TIPS,
} from "./settings-usage-guides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DEFAULTS_PATH = path.join(ROOT, "config/contextmint.defaults.yaml");
const PLAN_PATH = path.join(ROOT, "config/plans/api_registration_chain.yaml");
const OUT_PATH = path.join(__dirname, "../src/_data/serverChatSettings.json");

/** @type {Array<{ id: string, yamlKey: string, description: string, operator?: boolean }>} */
const STRUCTURAL_SETTINGS = [
  {
    id: "chat.api_surface_enabled",
    yamlKey: "api_surface_enabled",
    description:
      "Legacy pattern-detection bridge for route-wiring questions. Superseded by the query router and knowledge layer — disable in production unless debugging a regression.",
    operator: true,
  },
  {
    id: "chat.route_registry_enabled",
    yamlKey: "route_registry_enabled",
    description:
      "Index-time route registry (RouteObject knowledge). Powers O(1) structural lookup on any workspace the extractor supports.",
    operator: true,
  },
  {
    id: "chat.plan_selector_enabled",
    yamlKey: "plan_selector_enabled",
    description:
      "Query router — routes structural questions to knowledge lookup, graph expand, or full search + expand. Production default.",
    operator: true,
  },
  {
    id: "chat.plan_executor_enabled",
    yamlKey: "plan_executor_enabled",
    description:
      "Optional declarative YAML plans for graph reconstruct when registry lookup misses. Off by default.",
    operator: true,
  },
  {
    id: "chat.knowledge_object_lookup_enabled",
    yamlKey: "knowledge_object_lookup_enabled",
    description:
      "Render structured facts from index-time knowledge objects when the query router selects a lookup path.",
    operator: true,
  },
  {
    id: "chat.intent_classifier_enabled",
    yamlKey: "intent_classifier_enabled",
    description:
      "Optional paraphrase hints for the plan selector. Expands candidates only — never overrides routing alone.",
    operator: true,
  },
  {
    id: "chat.intent_classifier_rules_path",
    yamlKey: "intent_classifier_rules_path",
    description: "YAML file mapping paraphrase hints to structural plans (default: api_registration_chain).",
    operator: false,
  },
  {
    id: "chat.intent_classifier_model_path",
    yamlKey: "intent_classifier_model_path",
    description:
      "Optional DistilBERT/ONNX model artifact path. Empty = regex fast path only.",
    operator: false,
  },
  {
    id: "chat.plan_executor_max_ops",
    yamlKey: "plan_executor_max_ops",
    description: "Safety limit: maximum operations per structural plan execution.",
    operator: false,
  },
  {
    id: "chat.plan_executor_max_traverse_depth",
    yamlKey: "plan_executor_max_traverse_depth",
    description: "Safety limit: maximum graph traversal depth per plan operation.",
    operator: false,
  },
  {
    id: "chat.plan_executor_max_ms",
    yamlKey: "plan_executor_max_ms",
    description: "Safety limit: maximum wall time (ms) for a single plan execution.",
    operator: false,
  },
];

/**
 * @param {string} text
 * @param {string} key
 * @returns {string | undefined}
 */
function readChatYamlValue(text, key) {
  const re = new RegExp(`^\\s+${key}:\\s*(.+)$`, "m");
  const match = text.match(re);
  if (!match) return undefined;
  let value = match[1].trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

/**
 * @param {string} planText
 * @returns {{ planId: string, intent: string }}
 */
function readPlanMeta(planText) {
  const planId = planText.match(/^plan_id:\s*(.+)$/m)?.[1]?.trim() || "api_registration_chain";
  const intent = planText.match(/^intent:\s*(.+)$/m)?.[1]?.trim() || "structural_lookup";
  return { planId, intent };
}

function main() {
  const sourcesMissing = !fs.existsSync(DEFAULTS_PATH) || !fs.existsSync(PLAN_PATH);
  if (sourcesMissing) {
    if (fs.existsSync(OUT_PATH)) {
      const missing = [DEFAULTS_PATH, PLAN_PATH].filter((p) => !fs.existsSync(p));
      console.warn(
        `Skip: ${missing.join(", ")} not found (standalone site repo). Using committed ${OUT_PATH}`,
      );
      return;
    }
    console.error(
      `Missing monorepo config (${DEFAULTS_PATH}, ${PLAN_PATH}) and no committed ${OUT_PATH}`,
    );
    process.exit(1);
  }

  const defaultsText = fs.readFileSync(DEFAULTS_PATH, "utf8");
  const planText = fs.readFileSync(PLAN_PATH, "utf8");
  const { planId, intent } = readPlanMeta(planText);

  const settings = STRUCTURAL_SETTINGS.map((row) => {
    const raw = readChatYamlValue(defaultsText, row.yamlKey);
    const usage = SERVER_SETTING_USAGE[row.id];
    return {
      id: row.id,
      default: raw ?? "—",
      description: row.description,
      operator: Boolean(row.operator),
      type: typeof raw === "string" && /^(true|false)$/i.test(raw) ? "boolean" : "string",
      ...(usage ? { usage } : {}),
    };
  });

  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: "config/contextmint.defaults.yaml",
    overlayPath: "~/.contextmint/server.defaults.yaml",
    planDefinition: {
      planId,
      intent,
      path: "config/plans/api_registration_chain.yaml",
      rulesPath: "config/intent_classifier_rules.yaml",
      description:
        "Optional declarative graph-reconstruct plan for route registration chains. Selected by the query router when lookup misses and reconstruct is enabled — not a boolean toggle.",
    },
    sections: [
      {
        id: "evidence-assembly",
        title: "Evidence assembly (server)",
        description:
          "Server-side tunables for how ContextMint assembles evidence: index-time knowledge objects first, then hybrid search + expand (file windows, workspace grep, dependency graph). Set in contextmint.defaults.yaml on the API host or ~/.contextmint/server.defaults.yaml overlay. VS Code extension settings do not control these keys.",
        settings,
      },
    ],
    usageGuide: {
      title: "Evidence assembly rollout",
      summary:
        "Production default: query router + route registry + knowledge lookup on; optional graph executor and intent classifier for staging. LLM inference for evidence selection is off by default (last resort only). api_surface is a legacy rollback bridge — not the primary path.",
      rolloutScenarios: SERVER_ROLLOUT_SCENARIOS,
      dependencyNotes: SERVER_DEPENDENCY_NOTES,
      verifyTips: SERVER_VERIFY_TIPS,
    },
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT_PATH} (${settings.length} chat keys, plan ${planId})`);
}

main();
