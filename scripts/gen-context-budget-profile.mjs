/**
 * Export context budget profile JSON for the docs calculator.
 * Run via npm run gen:settings in contextmint-ai/.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DEFAULTS_PATH = path.join(ROOT, "config/contextmint.defaults.yaml");
const OUT_PATH = path.join(__dirname, "../src/_data/contextBudgetProfile.json");

/** Mirrors app/runtime/detector.py _CHAT_CAPS_BY_TIER (docs only). */
const TIER_RAG_SCALE = 4000 / 150;

function scaledRag(base) {
  return Math.round(base * TIER_RAG_SCALE);
}

function scaledGen(base, ceiling) {
  return Math.min(Math.round(base * TIER_RAG_SCALE), ceiling);
}

const HARDWARE_TIERS = [
  {
    id: "T0",
    typical_host: "< 32 GB RAM, CPU / iGPU",
    context_tokens: scaledRag(150),
    max_gen_tokens: scaledGen(256, 2048),
    num_ctx_ceiling: 10240,
    selection_max_tokens: 100,
    note: "T0 <32GB CPU/iGPU: RAG cap 4000 (install default)",
  },
  {
    id: "T1",
    typical_host: "32–64 GB RAM, CPU",
    context_tokens: scaledRag(400),
    max_gen_tokens: scaledGen(512, 4096),
    num_ctx_ceiling: 6144,
    selection_max_tokens: 300,
    note: "T1 32-64GB CPU (proportional)",
  },
  {
    id: "T2",
    typical_host: "64 GB+ RAM, CPU",
    context_tokens: scaledRag(800),
    max_gen_tokens: scaledGen(1024, 4096),
    num_ctx_ceiling: 8192,
    selection_max_tokens: 600,
    note: "T2 64GB+ CPU (proportional)",
  },
  {
    id: "T3",
    typical_host: "4 GB VRAM GPU",
    context_tokens: scaledRag(4000),
    max_gen_tokens: scaledGen(2048, 8192),
    num_ctx_ceiling: 0,
    selection_max_tokens: Math.min(1024, 8192),
    note: "T3 4GB GPU — num_ctx 0 = Ollama model default",
  },
  {
    id: "T4",
    typical_host: "6 GB VRAM GPU",
    context_tokens: scaledRag(4000),
    max_gen_tokens: scaledGen(2048, 8192),
    num_ctx_ceiling: 0,
    selection_max_tokens: Math.min(1024, 8192),
    note: "T4 6GB GPU",
  },
  {
    id: "T5",
    typical_host: "8 GB VRAM GPU",
    context_tokens: scaledRag(4000),
    max_gen_tokens: scaledGen(2048, 8192),
    num_ctx_ceiling: 0,
    selection_max_tokens: Math.min(1024, 8192),
    note: "T5 8GB GPU",
  },
  {
    id: "T7",
    typical_host: "12 GB VRAM GPU",
    context_tokens: scaledRag(4000),
    max_gen_tokens: scaledGen(2048, 8192),
    num_ctx_ceiling: 0,
    selection_max_tokens: Math.min(1024, 8192),
    note: "T7 12GB GPU",
  },
  {
    id: "T8",
    typical_host: "16 GB VRAM GPU",
    context_tokens: scaledRag(4000),
    max_gen_tokens: scaledGen(2048, 8192),
    num_ctx_ceiling: 0,
    selection_max_tokens: Math.min(1024, 8192),
    note: "T8 16GB GPU",
  },
  {
    id: "T9",
    typical_host: "24 GB+ VRAM GPU",
    context_tokens: scaledRag(4000),
    max_gen_tokens: scaledGen(2048, 8192),
    num_ctx_ceiling: 0,
    selection_max_tokens: Math.min(1024, 8192),
    note: "T9 24GB+ GPU",
  },
];

const MAX_CONTEXT_TOKENS_MIN = 500;
const MAX_CONTEXT_TOKENS_MAX = 200000;
const MAX_CONTEXT_TOKENS_STEP = 500;

const RATIO_KEYS = [
  "canonical_pack_budget",
  "canonical_overview_pack_max",
  "canonical_overview_anchor_slot",
  "canonical_overview_pack_seed_per_file",
  "canonical_overview_pack_seed_topup_max",
  "canonical_overview_pack_seed_per_file_max",
  "canonical_overview_retrieval",
  "conceptual_context_floor",
  "work_lane_pack",
];

const COUNT_KEYS = [
  "anchor_max_slots_at_baseline",
  "pack_seed_max_files_at_baseline",
  "grep_max_snippets_at_baseline",
];

/**
 * @param {string} text
 * @param {string} key
 * @returns {string | undefined}
 */
function readYamlScalar(text, key) {
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
 * @param {string} text
 * @param {string} parent
 * @returns {Record<string, number>}
 */
function readRatioBlock(text, parent) {
  const blockRe = new RegExp(`${parent}:\\s*\\n([\\s\\S]*?)(?=\\n\\S|\\n*$)`);
  const block = text.match(blockRe)?.[1] ?? "";
  /** @type {Record<string, number>} */
  const out = {};
  for (const key of RATIO_KEYS) {
    const re = new RegExp(`^\\s+${key}:\\s*([0-9.]+)`, "m");
    const m = block.match(re);
    if (m) out[key] = Number(m[1]);
  }
  return out;
}

function clampInt(value, lo, hi) {
  return Math.max(lo, Math.min(hi, Math.round(value)));
}

function scaleToken(maxTokens, ratio, lo, hi) {
  return clampInt(maxTokens * ratio, lo, hi);
}

function scaleCount(baselineCount, baselineTokens, maxTokens, lo, hi) {
  if (!baselineTokens) return baselineCount;
  return clampInt((baselineCount * maxTokens) / baselineTokens, lo, hi);
}

/**
 * @param {number} maxTokens
 * @param {object} profile
 */
function computeScaled(maxTokens, profile) {
  const r = profile.ratios;
  const b = profile.baseline_tokens;
  return {
    max_context_tokens: maxTokens,
    canonical_pack_budget_tokens: scaleToken(maxTokens, r.canonical_pack_budget, 400, 8000),
    canonical_overview_pack_max_tokens: scaleToken(
      maxTokens,
      r.canonical_overview_pack_max,
      400,
      16000,
    ),
    canonical_overview_anchor_slot_tokens: scaleToken(
      maxTokens,
      r.canonical_overview_anchor_slot,
      50,
      4000,
    ),
    canonical_overview_pack_seed_tokens_per_file: scaleToken(
      maxTokens,
      r.canonical_overview_pack_seed_per_file,
      50,
      2000,
    ),
    canonical_overview_pack_seed_topup_max_tokens: scaleToken(
      maxTokens,
      r.canonical_overview_pack_seed_topup_max,
      0,
      24000,
    ),
    canonical_overview_pack_seed_tokens_per_file_max: scaleToken(
      maxTokens,
      r.canonical_overview_pack_seed_per_file_max,
      100,
      8000,
    ),
    canonical_overview_retrieval_budget_tokens: scaleToken(
      maxTokens,
      r.canonical_overview_retrieval,
      150,
      8000,
    ),
    conceptual_context_floor_tokens: scaleToken(
      maxTokens,
      r.conceptual_context_floor,
      150,
      16000,
    ),
    work_lane_pack_token_budget: scaleToken(maxTokens, r.work_lane_pack, 500, 24000),
    canonical_overview_anchor_max_slots: scaleCount(
      profile.anchor_max_slots_at_baseline,
      b,
      maxTokens,
      4,
      32,
    ),
    canonical_overview_pack_seed_max_files: scaleCount(
      profile.pack_seed_max_files_at_baseline,
      b,
      maxTokens,
      3,
      24,
    ),
    canonical_overview_grep_max_snippets: scaleCount(
      profile.grep_max_snippets_at_baseline,
      b,
      maxTokens,
      0,
      12,
    ),
  };
}

function overviewCeiling(scaled) {
  const pack = Math.min(
    scaled.canonical_pack_budget_tokens,
    scaled.canonical_overview_pack_max_tokens,
  );
  const seed =
    scaled.canonical_overview_pack_seed_max_files *
    scaled.canonical_overview_pack_seed_tokens_per_file;
  const retrieval =
    scaled.canonical_overview_anchor_max_slots *
    scaled.canonical_overview_anchor_slot_tokens;
  return {
    pack_slot_max_tokens: pack,
    pack_seed_slot_max_tokens: seed,
    retrieval_slots_max_tokens: retrieval,
    theoretical_overview_ship_max_tokens: pack + seed + retrieval,
    canonical_overview_chunk_floor_tokens:
      scaled.canonical_overview_pack_max_tokens +
      scaled.canonical_overview_anchor_slot_tokens * scaled.canonical_overview_anchor_max_slots,
  };
}

function main() {
  if (!fs.existsSync(DEFAULTS_PATH)) {
    if (fs.existsSync(OUT_PATH)) {
      console.warn(`Skip: ${DEFAULTS_PATH} missing; using committed ${OUT_PATH}`);
      return;
    }
    console.error(`Missing ${DEFAULTS_PATH}`);
    process.exit(1);
  }

  const text = fs.readFileSync(DEFAULTS_PATH, "utf8");
  const budgetBlock = text.match(/context_budget:\s*\n([\s\S]*?)(?=\n  [a-z_]+:|\n[a-z]+:)/)?.[1] ?? "";

  const profile = {
    auto_scale: readYamlScalar(budgetBlock, "auto_scale") !== "false",
    baseline_tokens: Number(readYamlScalar(budgetBlock, "baseline_tokens") ?? "10000"),
    ratios: readRatioBlock(text, "ratios"),
    anchor_max_slots_at_baseline: Number(
      readYamlScalar(budgetBlock, "anchor_max_slots_at_baseline") ?? "15",
    ),
    pack_seed_max_files_at_baseline: Number(
      readYamlScalar(budgetBlock, "pack_seed_max_files_at_baseline") ?? "6",
    ),
    grep_max_snippets_at_baseline: Number(
      readYamlScalar(budgetBlock, "grep_max_snippets_at_baseline") ?? "2",
    ),
    max_context_tokens: Number(readYamlScalar(text, "max_context_tokens") ?? "10000"),
    max_gen_tokens: Number(readYamlScalar(text, "max_gen_tokens") ?? "4096"),
  };

  const presets = [4000, 6000, 8000, 10000, 12000, 16000, 20000, 24000, 32000, 50000, 100000, 200000].filter(
    (cap) => cap <= MAX_CONTEXT_TOKENS_MAX,
  ).map((cap) => {
    const scaled = computeScaled(cap, profile);
    return {
      max_context_tokens: cap,
      scaled,
      overview_ceiling: overviewCeiling(scaled),
    };
  });

  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: "config/contextmint.defaults.yaml",
    overlayPath: "~/.contextmint/server.defaults.yaml",
    profile,
    presets,
    hardwareTiers: HARDWARE_TIERS,
    maxContextTokensBounds: {
      min: MAX_CONTEXT_TOKENS_MIN,
      max: MAX_CONTEXT_TOKENS_MAX,
      step: MAX_CONTEXT_TOKENS_STEP,
    },
    api_endpoint: "/api/v1/config/context-budget",
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${OUT_PATH}`);
}

main();
