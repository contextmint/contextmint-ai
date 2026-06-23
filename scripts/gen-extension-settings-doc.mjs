/**
 * Generate src/_data/extensionSettings.json from extension package.json.
 * Run before `eleventy` (see contextmint-ai/package.json).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  EXTENSION_RETRIEVAL_GUIDE,
  EXTENSION_SETTING_USAGE,
} from "./settings-usage-guides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PKG_PATH = path.join(ROOT, "extensions/contextmint-vscode/package.json");
const OUT_PATH = path.join(__dirname, "../src/_data/extensionSettings.json");

/** E-014 — shown in Engine mode; infra keys deprecated in extension UI. */
const OPERATOR_KEYS = [
  "contextmint.serverUrl",
  "contextmint.engine.dashboardUrl",
  "contextmint.engine.devAllowExtensionSpawn",
  "contextmint.logLevel",
];

const DEPRECATED_EXACT = new Set([
  "contextmint.autoStart",
  "contextmint.pythonPath",
  "contextmint.backendPath",
  "contextmint.serverTimeoutMs",
  "contextmint.engine.lockPath",
  "contextmint.engine.lockStaleSec",
  "contextmint.engine.pollIntervalMs",
  "contextmint.engine.statusTimeoutMs",
  "contextmint.engine.showStatusBarItem",
]);

const DEPRECATED_PREFIXES = ["contextmint.server.", "contextmint.models."];

function isDeprecated(key) {
  if (DEPRECATED_EXACT.has(key)) return true;
  return DEPRECATED_PREFIXES.some((p) => key.startsWith(p));
}

function isOperator(key) {
  return OPERATOR_KEYS.includes(key);
}

/** User-facing description overrides (strip internal ticket IDs from package.json). */
const DESCRIPTION_OVERRIDES = {
  "contextmint.chat.governanceTrustChipEnabled":
    "Show HIGH/MEDIUM/LOW trust chip under store-backed quality answers.",
  "contextmint.chat.canonicalOverviewGrepMaxSnippets":
    "Max entry-point grep snippets on architecture and overview questions.",
  "contextmint.chat.canonicalOverviewGrepHeadLines":
    "File head lines used when entry-point grep has no keyword match.",
  "contextmint.chat.trivialQueryFastPathEnabled":
    "Skip client grep and retrieval UI for short greetings (hi, hello, etc.).",
  "contextmint.chat.laneSuggestEnabled":
    "Suggest the Work lane when repository retrieval looks weak.",
  "contextmint.chat.imageAttachmentsEnabled":
    "Enable paste, drop, and file-picker image attachments in chat compose.",
  "contextmint.chat.imageMaxCountPerMessage": "Maximum images per outgoing chat message.",
  "contextmint.chat.imageMaxBytes": "Maximum bytes per image before ingest rejects the file.",
  "contextmint.chat.imageTempTtlSec":
    "Temporary image blob lifetime (seconds) under ~/.contextmint/images/.",
  "contextmint.chat.imageSensitivityNotice":
    "First-time Context Lens notice when attaching images.",
  "contextmint.chat.pullVisionModelPrompt":
    "Primary call-to-action when no local vision model is installed.",
  "contextmint.chat.cloudVisionOptInHint":
    "Secondary hint for optional cloud vision with your own API key.",
  "contextmint.models.knownEmbedModels": "Quick-pick aliases for embedding models.",
  "contextmint.models.knownChatModels":
    "Quick-pick aliases for chat models, including RAM warning tiers.",
  "contextmint.models.knownVisionModels":
    "Curated local-first vision models plus optional cloud entries.",
  "contextmint.argus.auditButtonLabel":
    "Context Lens / message action label for visual paste audit.",
  "contextmint.argus.auditTimeoutMs":
    "Timeout for visual audit requests (vision model + browser capture).",
  "contextmint.models.recommendedPresets":
    "Hugging Face GGUF import presets when a model is not yet installed.",
  "contextmint.models.installedListPollMs":
    "Refresh installed Ollama models while the Models tab is open.",
  "contextmint.models.hfApiTimeoutMs": "Hugging Face model metadata fetch timeout.",
  "contextmint.models.ramHeadroomGb":
    "Gigabytes reserved for OS, IDE, and index when blocking a model download.",
  "contextmint.models.ramEstimateMultiplier":
    "Multiply GGUF size to estimate KV cache RAM overhead.",
  "contextmint.models.ramWarnUtilizationRatio":
    "Warn when estimated model RAM exceeds this fraction of available RAM.",
  "contextmint.models.pullProgressPollMs": "Ollama pull progress poll interval.",
  "contextmint.server.ollamaProbeTimeoutMsDuringIndexing":
    "Ollama probe timeout (ms) while indexing is active.",
  "contextmint.server.systemStatePollIntervalMs":
    "Interval (ms) between system-state polls when the repo is idle.",
  "contextmint.server.systemStateIndexPollIntervalMs":
    "Interval (ms) between system-state polls while indexing.",
  "contextmint.design.accentColor":
    "Brand accent color for status dots, links, and success states.",
  "contextmint.design.maxContextLensFiles":
    "Maximum file cards shown in the Context Lens drawer.",
  "contextmint.sandbox.enabled":
    "Enable git worktree sandbox for isolated test and apply. Requires sandbox enabled on the server.",
};

/**
 * @param {string} id
 * @param {string} raw
 * @returns {string}
 */
function publicDescription(id, raw) {
  if (DESCRIPTION_OVERRIDES[id]) return DESCRIPTION_OVERRIDES[id];
  return raw
    .replace(/^U-\d+:\s*/i, "")
    .replace(/^Block U\d*\s+U-\d+:\s*/i, "")
    .replace(/\s*\(Block U\d*\s+U-\d+\)\.?$/i, "")
    .replace(/\s*\(Block U design tokens\)\.?$/i, "")
    .replace(/\s*\(Block U\)\.?$/i, "")
    .replace(/\s*\(GF-\d+\)\.?$/i, "")
    .replace(/\s*\(B1-R-\d+[a-z]?\)\.?$/i, "")
    .replace(/\s*\(U-\d+\)\.?$/i, "")
    .replace(/\s*\(never Hub71 gate\)\.?$/i, "")
    .replace(/^Phase \d+:\s*/i, "")
    .trim();
}


/** @param {unknown} val */
function formatDefault(val) {
  if (val === undefined || val === null) return "—";
  if (typeof val === "string") return val;
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    if (typeof val[0] === "string") {
      return val.length <= 4
        ? JSON.stringify(val)
        : `[${val.length} items] ${val.slice(0, 3).join(", ")}…`;
    }
    if (typeof val[0] === "object" && val[0] !== null) {
      const ids = val
        .map((item) => item.alias || item.id || item.label)
        .filter(Boolean)
        .slice(0, 4);
      return `[${val.length} presets] ${ids.join(", ")}${val.length > 4 ? "…" : ""}`;
    }
    return `[${val.length} items]`;
  }
  return JSON.stringify(val);
}

/**
 * @param {string} key
 * @returns {string}
 */
function categorize(key) {
  if (isOperator(key)) return "operator";
  if (key.startsWith("contextmint.governance.")) return "governance";
  if (key.startsWith("contextmint.chat.")) return "chat";
  if (
    key === "contextmint.defaultModel" ||
    key === "contextmint.maxSessionsInList" ||
    key === "contextmint.maxAttachedFiles"
  ) {
    return "chat";
  }
  if (
    key === "contextmint.trustGateEnabled" ||
    key === "contextmint.lensPreviewEnabled" ||
    key === "contextmint.lensPreviewFirstNSends" ||
    key === "contextmint.cloudEnabled" ||
    key === "contextmint.xaiDevMode" ||
    key === "contextmint.enterpriseMode" ||
    key === "contextmint.oidcProviderId" ||
    key === "contextmint.localJwtSecret"
  ) {
    return "trust";
  }
  if (key.startsWith("contextmint.packs.")) return "packs";
  if (key.startsWith("contextmint.sandbox.")) return "sandbox";
  if (key.startsWith("contextmint.inline.")) return "inline";
  if (key.startsWith("contextmint.argus.")) return "argus";
  if (key.startsWith("contextmint.design.")) return "design";
  if (key.startsWith("contextmint.engine.")) return "engine";
  if (key.startsWith("contextmint.models.") || key.includes("ollama")) return "models";
  if (key === "contextmint.localFallbackUrl" || key === "contextmint.serverTimeoutMs") {
    return "connectivity";
  }
  if (isDeprecated(key)) return "engine-managed";
  return "connectivity";
}

const SECTION_META = {
  operator: {
    title: "Operator essentials (start here)",
    description:
      "With ContextMint Engine installed, change these in VS Code only. Server lifecycle, Ollama, models, and indexing are managed in Engine → Settings.",
  },
  connectivity: {
    title: "Server & connectivity",
    description:
      "How the extension reaches the API. For remote/team servers set serverUrl to your on-prem host and see BYOK & enterprise.",
  },
  chat: {
    title: "Chat, sessions & lanes",
    description:
      "Compose placement, history limits, context lanes (Repo / Work / Hybrid), client grep, trivial-query fast path, and answer formatting.",
  },
  trust: {
    title: "Context Lens, trust gate & cloud",
    description:
      "Pre-send Context Lens preview, optional trust gate, cloud routing toggle, and enterprise auth fields.",
  },
  governance: {
    title: "Governance & quality map",
    description:
      "Quality scan UI, pre-send governance notes in Context Lens, and assisted-apply gate for duplication findings.",
  },
  packs: {
    title: "Repo memory (packs)",
    description: "Auto-sync draft packs when repo files change.",
  },
  argus: {
    title: "Image evidence & ARGUS",
    description:
      "Screenshot attachments, vision routing hints, and the Run visual audit action. See Image evidence & ARGUS for the full workflow.",
  },
  sandbox: {
    title: "Sandbox (beta)",
    description:
      "Isolated git worktrees for assisted patch preview. Requires server sandbox.enabled and extension sandbox.enabled.",
  },
  inline: {
    title: "Inline completion (optional)",
    description: "Ghost-text completions in the editor. Off by default.",
  },
  design: {
    title: "Design tokens (advanced)",
    description: "Webview spacing, motion, and Context Lens drawer caps. Rarely changed.",
  },
  "engine-managed": {
    title: "Engine-managed (deprecated in extension UI)",
    description:
      "Still defined for git-clone dev workflows. In packaged Engine mode these are hidden or deprecated — configure the equivalent in ContextMint Engine instead.",
  },
  models: {
    title: "Model catalogs (Engine-managed)",
    description:
      "Curated embed/chat/vision model lists and RAM heuristics. Managed by Engine in normal installs; extension reads models from the API.",
  },
  engine: {
    title: "Engine detection",
    description: "Lock file, poll intervals, and status bar — dev/operator plumbing.",
  },
};

const SECTION_ORDER = [
  "operator",
  "connectivity",
  "chat",
  "trust",
  "governance",
  "packs",
  "argus",
  "sandbox",
  "inline",
  "design",
  "engine",
  "models",
  "engine-managed",
];

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function build() {
  if (!fs.existsSync(PKG_PATH)) {
    if (fs.existsSync(OUT_PATH)) {
      console.warn(
        `Skip: ${PKG_PATH} not found (standalone site repo). Using committed ${OUT_PATH}`,
      );
      return;
    }
    console.error(`Missing ${PKG_PATH} and no committed ${OUT_PATH}`);
    process.exit(1);
  }

  const pkg = loadJson(PKG_PATH);
  const props = pkg.contributes?.configuration?.properties ?? {};
  const keys = Object.keys(props)
    .filter((k) => k.startsWith("contextmint."))
    .sort();

  const buckets = Object.fromEntries(SECTION_ORDER.map((id) => [id, []]));

  for (const id of keys) {
    const meta = props[id];
    const sectionId = categorize(id);
    const bucket = buckets[sectionId] ?? buckets.connectivity;
    bucket.push({
      id,
      description: publicDescription(id, (meta.description || "").trim()),
      default: formatDefault(meta.default),
      deprecated: isDeprecated(id) || Boolean(meta.deprecationMessage),
      operator: isOperator(id),
      type: meta.type || "unknown",
      ...(EXTENSION_SETTING_USAGE[id] ? { usage: EXTENSION_SETTING_USAGE[id] } : {}),
    });
  }

  for (const sectionId of SECTION_ORDER) {
    buckets[sectionId].sort((a, b) => a.id.localeCompare(b.id));
  }

  const sections = SECTION_ORDER.filter((id) => buckets[id].length > 0).map((id) => ({
    id,
    title: SECTION_META[id].title,
    description: SECTION_META[id].description,
    settings: buckets[id],
  }));

  const payload = {
    generatedAt: new Date().toISOString().slice(0, 10),
    source: "extensions/contextmint-vscode/package.json",
    totalCount: keys.length,
    operatorKeys: OPERATOR_KEYS,
    sections,
    retrievalGuide: EXTENSION_RETRIEVAL_GUIDE,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`Wrote ${OUT_PATH} (${keys.length} settings, ${sections.length} sections)`);
}

build();
