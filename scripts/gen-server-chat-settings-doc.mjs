/**
 * Generate src/_data/serverChatSettings.json from config/contextmint.defaults.yaml.
 * Run via npm run gen:settings in contextmint-ai/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  formatYamlDefault,
  humanizeKey,
  loadFlattenedDefaults,
} from "./parse-defaults-yaml.mjs";
import {
  SERVER_OPERATOR_KEYS,
  SERVER_SECTIONS,
  SERVER_SETTING_DESCRIPTIONS,
  assignServerSection,
} from "./server-setting-catalog.mjs";
import {
  SERVER_DEPENDENCY_NOTES,
  SERVER_ROLLOUT_SCENARIOS,
  SERVER_SETTING_USAGE,
  SERVER_VERIFY_TIPS,
  buildDefaultServerUsage,
} from "./settings-usage-guides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DEFAULTS_PATH = path.join(ROOT, "config/contextmint.defaults.yaml");
const PLAN_PATH = path.join(ROOT, "config/plans/api_registration_chain.yaml");
const OUT_PATH = path.join(__dirname, "../src/_data/serverChatSettings.json");

/**
 * @param {string} planText
 * @returns {{ planId: string, intent: string }}
 */
function readPlanMeta(planText) {
  const planId = planText.match(/^plan_id:\s*(.+)$/m)?.[1]?.trim() || "api_registration_chain";
  const intent = planText.match(/^intent:\s*(.+)$/m)?.[1]?.trim() || "structural_lookup";
  return { planId, intent };
}

/**
 * @param {{ id: string, value: unknown, type: string }} row
 * @returns {{ id: string, default: string, description: string, operator: boolean, type: string, usage?: import('./settings-usage-guides.mjs').SettingUsage }}
 */
function mapFlatRow(row) {
  const description =
    SERVER_SETTING_DESCRIPTIONS[row.id] ??
    `${humanizeKey(row.id)} — server tunable from contextmint.defaults.yaml.`;
  const type = row.type === "null" ? "string" : row.type;
  const usage =
    SERVER_SETTING_USAGE[row.id] ?? buildDefaultServerUsage(row.id, description, type);
  return {
    id: row.id,
    default: formatYamlDefault(row.value, type),
    description,
    operator: SERVER_OPERATOR_KEYS.has(row.id),
    type,
    usage,
  };
}

function main() {
  const sourcesMissing = !fs.existsSync(DEFAULTS_PATH);
  if (sourcesMissing) {
    if (fs.existsSync(OUT_PATH)) {
      console.warn(
        `Skip: ${DEFAULTS_PATH} not found (standalone site repo). Using committed ${OUT_PATH}`,
      );
      return;
    }
    console.error(`Missing monorepo config (${DEFAULTS_PATH}) and no committed ${OUT_PATH}`);
    process.exit(1);
  }

  const flatRows = loadFlattenedDefaults(DEFAULTS_PATH);
  const planText = fs.existsSync(PLAN_PATH) ? fs.readFileSync(PLAN_PATH, "utf8") : "";
  const { planId, intent } = planText ? readPlanMeta(planText) : { planId: "api_registration_chain", intent: "structural_lookup" };

  /** @type {Map<string, ReturnType<typeof mapFlatRow>[]>} */
  const buckets = new Map(SERVER_SECTIONS.map((s) => [s.id, []]));
  /** @type {ReturnType<typeof mapFlatRow>[]} */
  const unassigned = [];

  for (const row of flatRows) {
    const section = assignServerSection(row.id);
    const mapped = mapFlatRow(row);
    if (section) {
      buckets.get(section.id)?.push(mapped);
    } else {
      unassigned.push(mapped);
    }
  }

  if (unassigned.length > 0) {
    buckets.set("other", unassigned);
  }

  const sections = SERVER_SECTIONS.filter((def) => (buckets.get(def.id)?.length ?? 0) > 0).map(
    (def) => ({
      id: def.id,
      title: def.title,
      description: def.description,
      settings: (buckets.get(def.id) ?? []).sort((a, b) => a.id.localeCompare(b.id)),
    }),
  );

  if (unassigned.length > 0) {
    sections.push({
      id: "other",
      title: "Other server defaults",
      description: "Additional keys from contextmint.defaults.yaml not yet grouped — file an issue if a section is missing.",
      settings: unassigned.sort((a, b) => a.id.localeCompare(b.id)),
    });
  }

  const totalKeys = flatRows.length;

  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: "config/contextmint.defaults.yaml",
    overlayPath: "~/.contextmint/server.defaults.yaml",
    totalCount: totalKeys,
    planDefinition: {
      planId,
      intent,
      path: "config/plans/api_registration_chain.yaml",
      rulesPath: "config/intent_classifier_rules.yaml",
      description:
        "Optional declarative graph-reconstruct plan for route registration chains. Selected by the query router when lookup misses and reconstruct is enabled — not a boolean toggle.",
    },
    sections,
    usageGuide: {
      title: "Evidence assembly & EOP rollout",
      summary:
        "Production default (2026+): query router + route & symbol registries + knowledge lookup + EOP on; optional graph executor and intent classifier for staging. LLM inference for evidence selection is off by default (last resort only). api_surface is a legacy rollback bridge — not the primary path. After enabling EOP, re-index and run B2 cold (symbol definition, no open file) before sign-off.",
      rolloutScenarios: SERVER_ROLLOUT_SCENARIOS,
      dependencyNotes: SERVER_DEPENDENCY_NOTES,
      verifyTips: SERVER_VERIFY_TIPS,
    },
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT_PATH} (${totalKeys} keys, ${sections.length} sections, plan ${planId})`);
}

main();
