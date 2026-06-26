/**
 * Operator usage copy for contextmint-ai settings docs (server + extension).
 * User-facing language only — no internal ticket IDs, plan codes, or CI script names.
 * Aligned with workspace-agnostic Retrieve → Expand → Infer (ADR-015).
 */

/** @typedef {{ whenEnable: string, whenDisable: string, pros: string[], cons: string[], recommendation: string }} SettingUsage */

/**
 * Minimal usage guide for server keys without curated copy.
 * @param {string} id
 * @param {string} description
 * @param {string} type
 * @returns {SettingUsage}
 */
export function buildDefaultServerUsage(id, description, type) {
  const label = id.split(".").pop()?.replace(/_/g, " ") ?? id;
  const isBool = type === "boolean";
  return {
    whenEnable: isBool
      ? `When true — ${description}`
      : `Tune ${label} when receipts, latency, or UAT evidence show the shipped default is wrong for your tier.`,
    whenDisable: isBool
      ? `When false — disables or falls back for ${label}.`
      : "N/A — numeric, string, or structured value (not a boolean toggle).",
    pros: [
      "Documented in config/contextmint.defaults.yaml on the API host",
      "Override via ~/.contextmint/server.defaults.yaml or CHAT__* / CONTEXTMINT__* env vars",
    ],
    cons: [
      "Server restart required after overlay changes",
      "Not exposed in Engine desktop or VS Code Settings for most keys",
    ],
    recommendation: "Keep the shipped default unless you are actively tuning with Context Receipt or operator metrics.",
  };
}

/**
 * Minimal usage guide for extension keys without curated copy.
 * @param {string} id
 * @param {string} description
 * @param {string} type
 * @returns {SettingUsage}
 */
export function buildDefaultExtensionUsage(id, description, type) {
  const short = id.replace("contextmint.", "");
  const isBool = type === "boolean";
  return {
    whenEnable: isBool
      ? `When true — ${description}`
      : `Adjust ${short} in VS Code Settings when the default does not match your workflow.`,
    whenDisable: isBool
      ? `When false — ${description.replace(/^Enable|^Show|^Suggest/i, (m) => m.toLowerCase())}`
      : "N/A — value setting (not a boolean toggle).",
    pros: [
      "Changed in VS Code → Settings (search contextmint) or settings.json",
      "Applies on next chat send or webview reload — no server restart for most keys",
    ],
    cons: [
      "Does not replace server-side evidence assembly for structural or overview questions",
      "Engine-managed keys may be hidden when ContextMint Engine is installed",
    ],
    recommendation: "Leave default unless troubleshooting a specific UX or latency issue.",
  };
}

/** @type {Record<string, SettingUsage>} */
export const SERVER_SETTING_USAGE = {
  "chat.max_context_tokens": {
    whenEnable:
      "Always set via operator overlay or Engine Context budget — ceiling for RAG chunks shipped into chat.",
    whenDisable: "N/A — this is a numeric cap, not a boolean toggle.",
    pros: [
      "One knob scales overview pack, seed, and slot budgets when auto_scale is true",
      "Operator explicit value ships unchanged (ADR-017)",
    ],
    cons: [
      "Very high values increase prefill latency on CPU tiers",
      "Requires server restart after overlay apply",
    ],
    recommendation:
      "Use Engine Context budget or ~/.contextmint/server.defaults.yaml; preview with the docs calculator.",
  },
  "chat.max_gen_tokens": {
    whenEnable:
      "Set with max_context_tokens — caps Ollama num_predict (answer length). Engine Apply co-writes tier default.",
    whenDisable: "N/A — numeric cap.",
    pros: [
      "Operator controls generation length independently of RAG cap",
      "Co-applied from desktop when saving context budget",
    ],
    cons: [
      "Long generations increase time-to-last-token on CPU tiers",
      "Requires server restart after overlay apply",
    ],
    recommendation:
      "Let Engine co-apply tier max_gen_tokens on Apply, or set explicitly in server overlay.",
  },
  "server.ollama_warmup_read_timeout_sec": {
    whenEnable:
      "Raise when large chat models on CPU or tight VRAM need more than 120s to load into memory before the first token.",
    whenDisable: "N/A — numeric timeout (seconds), not a boolean.",
    pros: [
      "Applies only to explicit preload (/api/generate), not the chat stream read timeout",
      "Prevents cold-load failures without inflating stream timeout for every token",
    ],
    cons: [
      "Very high values delay error feedback when Ollama is down or the model is missing",
      "Requires server restart after overlay apply",
    ],
    recommendation:
      "Keep 120s unless logs show preload timeouts; pair with runtime.ollama_ensure_model_loaded=true.",
  },
  "runtime.ollama_ensure_model_loaded": {
    whenEnable:
      "Default — checks /api/ps before chat and preloads when the model is cold. UI shows a loading status instead of a silent hang.",
    whenDisable:
      "When you manage warmup externally or want every request to hit Ollama cold-load inline (not recommended).",
    pros: [
      "Separates model load from the chat stream — fewer stream_error events on first query",
      "Fast path when the model is already warm (single /api/ps probe)",
    ],
    cons: [
      "Adds a few milliseconds per warm request for the /api/ps probe",
      "Requires server restart after overlay apply",
    ],
    recommendation: "Leave enabled unless you have a dedicated always-warm inference sidecar.",
  },
  "runtime.ollama_keep_model_loaded": {
    whenEnable:
      "Sovereign server or dedicated inference box — keeps chat and embed models resident (keep_alive=-1). No eviction after idle.",
    whenDisable:
      "Local-first dev machines with limited RAM/VRAM — models evict after the session keep_alive window.",
    pros: [
      "Every chat hits a warm model — lowest latency and most predictable streams",
      "Pairs well with runtime.ollama_ensure_model_loaded for first boot only",
    ],
    cons: [
      "Holds VRAM/RAM until Ollama restarts — can evict other models or starve embedding",
      "Not ideal on laptops sharing GPU with other apps",
    ],
    recommendation:
      "Enable on sovereign server deployments; leave false on developer laptops unless you have spare VRAM.",
  },
  "chat.api_surface_enabled": {
    whenEnable:
      "Legacy rollback only — when you need the older pattern-detection bridge while isolating query-router regressions.",
    whenDisable:
      "Normal operation — the query router and knowledge layer handle structural questions without path-pattern boosts.",
    pros: [
      "Familiar fallback during staged rollouts",
      "Can be toggled independently of the query router",
    ],
    cons: [
      "Not workspace-agnostic — pattern boosts can favour one framework layout",
      "Superseded by index-time knowledge objects plus search + expand",
      "May compete with registry lookup on structural questions",
    ],
    recommendation: "Disable in production unless you are debugging a documented regression.",
  },
  "chat.route_registry_enabled": {
    whenEnable:
      "Always — after indexing completes. Powers index-time route knowledge (RouteObject lookup) for structural questions.",
    whenDisable:
      "Extractor debugging, suspected stale registry, or forcing expand-only retrieval.",
    pros: [
      "O(1) route facts from index-time extraction — any framework the extractor supports",
      "Foundation for knowledge-layer answers before search runs",
      "Works across workspaces without golden-path tables",
    ],
    cons: [
      "Quality depends on index-time route extraction coverage",
      "Stale until you re-index after route changes",
      "Little value if extractors miss your stack",
    ],
    recommendation: "Keep enabled; re-index if structural answers miss routes.",
  },
  "chat.plan_selector_enabled": {
    whenEnable:
      "Production default — routes questions to knowledge lookup, graph expand, or full search based on workspace signals.",
    whenDisable:
      "Emergency rollback to generic hybrid search only, or before hardware verification on a new host.",
    pros: [
      "Workspace-agnostic query router — not regex or repo layout alone",
      "Structural facts from knowledge layer first; semantic questions fall through to search + expand",
      "Enables knowledge object lookup when the registry has a hit",
    ],
    cons: [
      "More moving parts than search-only mode",
      "Weak extractor coverage falls through to expand paths (slower)",
      "Works best with a healthy route registry and dependency graph",
    ],
    recommendation: "Keep enabled in production after indexing completes.",
  },
  "chat.knowledge_object_lookup_enabled": {
    whenEnable:
      "Production default — render structured route facts from the index-time registry when the query router selects a lookup path.",
    whenDisable:
      "Renderer issues, agreement-banner bugs, or preferring narration from expanded excerpts only.",
    pros: [
      "Deterministic structural facts — fewer invented handler or path names",
      "Faster and cheaper than full graph reconstruct plus LLM",
      "Answers cite registry objects instead of guessing wiring",
    ],
    cons: [
      "Only helps when the registry has a hit for the question",
      "Little benefit if extractor coverage is weak on your stack",
      "Renderer must stay aligned with Context Lens in the extension",
    ],
    recommendation: "Keep enabled with plan_selector after registry quality looks solid.",
  },
  "chat.plan_executor_enabled": {
    whenEnable:
      "Staging or pilot when registry misses structural questions and you need declarative graph walks for reconstruct answers.",
    whenDisable:
      "Default production — graph reconstruct at query time is slower than registry lookup or expand.",
    pros: [
      "Declarative YAML plans for graph reconstruct when lookup misses",
      "Complexity capped (operations, depth, wall time)",
      "Optional layer — not required for most route-wiring questions",
    ],
    cons: [
      "Graph reconstruct at query time — higher latency than knowledge lookup",
      "Heavy use may signal registry or extractor gaps worth fixing at index time",
      "Enable only after selector and registry prove value",
    ],
    recommendation: "Off in production unless reconstruct answers are required and lookup is insufficient.",
  },
  "chat.intent_classifier_enabled": {
    whenEnable:
      "Optional polish when paraphrased questions miss routing probes and fall back to generic search.",
    whenDisable:
      "Default — keyword and structural probes are enough for most workspaces.",
    pros: [
      "Catches paraphrases when probes miss",
      "Adds candidates only — never removes existing probe hits",
      "Regex fast path — no ML model required",
    ],
    cons: [
      "Small gain when registry and probes already work",
      "Bad rules could weakly boost reconstruct paths",
      "ML model path reserved for a future release",
    ],
    recommendation: "Optional after plan_selector; not required for basic structural answers.",
  },
  "chat.intent_classifier_rules_path": {
    whenEnable: "Point to your paraphrase rules file (default: config/intent_classifier_rules.yaml).",
    whenDisable: "N/A — file path setting.",
    pros: ["Extend paraphrase coverage without redeploying server code"],
    cons: ["Invalid regex in rules can cause false structural hints"],
    recommendation: "Leave default unless you maintain custom paraphrase lists.",
  },
  "chat.intent_classifier_model_path": {
    whenEnable: "Future: when a trained classifier model is shipped and validated.",
    whenDisable: "Default empty — regex-only classifier (current release).",
    pros: ["Future: better paraphrase recall at scale"],
    cons: ["Future: extra ops, latency, and versioning"],
    recommendation: "Keep empty until an ML classifier is explicitly released.",
  },
  "chat.plan_executor_max_ops": {
    whenEnable: "N/A — safety limit. Change only with deliberate review.",
    whenDisable: "N/A",
    pros: ["Prevents the plan executor from becoming a general workflow engine"],
    cons: ["Raising limits invites scope creep"],
    recommendation: "Do not raise without engineering review.",
  },
  "chat.plan_executor_max_traverse_depth": {
    whenEnable: "N/A — safety limit.",
    whenDisable: "N/A",
    pros: ["Caps graph traversal cost per plan"],
    cons: ["Too low on deep monorepos may truncate chains"],
    recommendation: "Default 3 is intentional; change only with evidence.",
  },
  "chat.plan_executor_max_ms": {
    whenEnable: "N/A — wall-clock budget per plan execution.",
    whenDisable: "N/A",
    pros: ["Protects chat latency on modest hardware"],
    cons: ["Too low may abort valid reconstruct on slow disks"],
    recommendation: "Tune only after profiling; default 500 ms is a sensible starting point.",
  },
  "chat.evidence_obligation_platform_enabled": {
    whenEnable:
      "Production default (2026+) — unified evidence orchestrator: obligations, catalog lookup, ShipLaw sufficiency, and discovery policy for EVIDENCE-mode chat.",
    whenDisable:
      "Legacy assembly path — scattered overview detection and similarity-only symbol answers. Use only for rollback while isolating EOP regressions.",
    pros: [
      "Definition questions resolve via Symbol catalog (R1) instead of grep luck",
      "Overview uses compiled pack-seed + ShipLaw — not ad-hoc rerank patches",
      "Context Receipt exposes obligations_requested / obligations_fulfilled for UAT",
      "Workspace-agnostic — no per-repo golden paths in runtime",
    ],
    cons: [
      "Requires healthy symbol registry after re-index",
      "Server restart required; not exposed in Engine desktop UI yet",
      "Disabling mid-pilot hides obligation telemetry on receipts",
    ],
    recommendation:
      "Keep enabled after B2 cold UAT passes. Set in contextmint.defaults.yaml or ~/.contextmint/server.defaults.yaml — verify with: python -c \"from app.config import settings; print(settings.chat.evidence_obligation_platform_enabled)\"",
  },
  "chat.evidence_receipt_eop_fields_enabled": {
    whenEnable:
      "UAT, pilot, or engineering — dual-write obligation fields on Context Receipt exports.",
    whenDisable:
      "Production noise reduction when you do not read receipt JSON postmortems.",
    pros: [
      "obligations_requested, obligations_fulfilled, execution_mode_eop on every receipt",
      "Easier cold B2 sign-off without inferring path from slot_counts alone",
    ],
    cons: [
      "Slightly larger receipt payloads",
      "Fields empty when EOP master flag is off",
    ],
    recommendation: "Keep enabled during EOP rollout and UAT; optional to disable later for minimal receipts.",
  },
  "chat.symbol_registry_enabled": {
    whenEnable:
      "Always after indexing — index-time SymbolObject sidecar for DEFINITION questions (where is X defined?).",
    whenDisable:
      "Symbol extractor debugging or forcing expand-only definition answers.",
    pros: [
      "O(1) symbol definition lookup — any language with class/def extractors",
      "Powers B2 cold bar: registry excerpt ships before similarity search",
      "content_hash supports stale-catalog detection after edits",
    ],
    cons: [
      "Depends on dependency graph + index pipeline",
      "Re-index required after large refactors",
      "Weak on dynamic metaclass-only symbols",
    ],
    recommendation: "Keep enabled with EOP; re-index so .contextmint/registries/symbol_registry.json exists.",
  },
  "chat.obligation_entity_min_length": {
    whenEnable: "N/A — minimum token length for PascalCase entity terms in obligation grep split.",
    whenDisable: "N/A",
    pros: ["Filters short noise tokens from entity-driven grep"],
    cons: ["Too high may drop valid two-letter symbols"],
    recommendation: "Default 3 is fine; change only if grep misses short symbol names.",
  },
  "chat.obligation_language_stopwords": {
    whenEnable:
      "When definition queries grep false positives on words like where, defined, main.",
    whenDisable: "N/A — list setting; empty list disables language-term filtering.",
    pros: [
      "Stops language tokens from driving workspace grep on DEFINITION questions",
      "Reduces main.py false positives on symbol queries",
    ],
    cons: ["Over-aggressive list may remove useful grep terms on rare prompts"],
    recommendation: "Keep shipped defaults unless you see systematic false-positive paths.",
  },
  "chat.obligation_slot_ratios": {
    whenEnable:
      "When EOP is on — reserves token budget slices inside effective RAG cap per obligation type.",
    whenDisable: "When EOP off — ratios are ignored.",
    pros: [
      "Overview and definition excerpts less likely starved at ship time",
      "Integrates with unified RAG budget (max_context_tokens authority)",
    ],
    cons: [
      "Aggressive ratios shrink remainder for semantic search excerpts",
      "Tuning requires receipt review — no desktop UI yet",
    ],
    recommendation:
      "Keep defaults (overview 0.35, definition 0.25, registration 0.20) until RXI-074 budget dashboard ships.",
  },
  "retrieval.discovery_policy": {
    whenEnable:
      "When EOP is on — per-obligation suppress flags for grep, search, and pack hydration.",
    whenDisable: "Legacy path uses hardcoded stage behaviour.",
    pros: [
      "Overview can suppress redundant vector search while keeping pack-seed",
      "Definition keeps grep + search for catalog miss fallback",
    ],
    cons: [
      "Misconfigured YAML can over-suppress discovery on catalog miss",
      "Edited only in server YAML — not in VS Code or Engine UI",
    ],
    recommendation:
      "Leave shipped defaults; customize only when receipts show wrong discovery mix for an obligation type.",
  },
};

/** @type {Record<string, SettingUsage>} */
export const EXTENSION_SETTING_USAGE = {
  "contextmint.chat.clientGrepEnabled": {
    whenEnable:
      "Demo visibility, indexing handoff, or symbol-heavy prompts where local workspace search helps before server retrieval.",
    whenDisable:
      "Noisy local paths polluting architecture or overview answers; reduce client-side work on large monorepos.",
    pros: [
      "Surfaces open-file and keyword hits before the stream starts",
      "Useful while the index is still building (with indexingOnly)",
    ],
    cons: [
      "Can pull in docs, session packs, or non-code files into context",
      "Server still budgets and may down-rank meta paths on overview questions",
    ],
    recommendation: "Keep enabled for development; tighten grep limits if overview answers feel noisy.",
  },
  "contextmint.chat.clientGrepIndexingOnly": {
    whenEnable:
      "Limit grep noise after the index is ready — search locally only while indexing is in progress.",
    whenDisable:
      "You rely on client grep for every chat turn (demos, offline symbol lookup).",
    pros: ["Cuts post-index grep pollution", "Faster sends when the index is ready"],
    cons: ["No client-side path hints after indexing completes"],
    recommendation: "Consider enabling on laptops with limited RAM after the index is ready.",
  },
  "contextmint.chat.clientGrepMaxSnippets": {
    whenEnable: "Raise briefly for dense symbol-navigation demos.",
    whenDisable: "Lower (e.g. 4–6) when sources feel noisy or the token budget is tight.",
    pros: ["More local evidence for symbol questions"],
    cons: ["More tokens competing with packs and server retrieval on overview prompts"],
    recommendation: "Default 8 is balanced; lower if sources look cluttered.",
  },
  "contextmint.chat.clientGrepMaxFiles": {
    whenEnable: "Large workspaces where keyword search needs a wider scan (slower).",
    whenDisable: "Performance issues or excessive grep time before send.",
    pros: ["Broader local coverage"],
    cons: ["Slower pre-stream; more noise risk"],
    recommendation: "Lower on laptops if compose feels sluggish.",
  },
  "contextmint.chat.canonicalOverviewGrepMaxSnippets": {
    whenEnable:
      "Architecture or “how does this repo work?” prompts need more entry-point file snippets from client grep.",
    whenDisable:
      "Overview answers already cite the right entry files — reduce client grep competition with server expand.",
    pros: ["More local snippets for high-level architecture questions"],
    cons: ["More grep slots on a query type sensitive to noise"],
    recommendation: "Leave default unless entry files are missing from overview answers.",
  },
  "contextmint.chat.canonicalOverviewGrepHeadLines": {
    whenEnable:
      "Entry files lack keyword overlap — need more head lines from application entry or bootstrap files.",
    whenDisable: "Grep snippets are too large for tight token budgets.",
    pros: ["Helps overview when keywords miss file headers"],
    cons: ["Larger snippets per grep hit"],
    recommendation: "Tune together with canonicalOverviewGrepMaxSnippets.",
  },
  "contextmint.chat.trivialQueryFastPathEnabled": {
    whenEnable: "Recommended — skips full retrieval for short greetings like hi or hello.",
    whenDisable: "Testing that even trivial prompts route through the full pipeline.",
    pros: ["Instant greeting; no false retrieval UI", "Saves tokens and latency"],
    cons: ["Mis-tuned patterns could classify a real question as trivial (rare)"],
    recommendation: "Keep enabled.",
  },
  "contextmint.chat.trivialQueryMaxWords": {
    whenEnable: "N/A — max word count for the greeting shortcut.",
    whenDisable: "N/A",
    pros: ["Prevents long prompts from using the greeting shortcut"],
    cons: ["Too low may not match natural short greetings"],
    recommendation: "Default 3 works for most teams; change only with pattern review.",
  },
  "contextmint.trustGateEnabled": {
    whenEnable:
      "Operators who want to exclude specific chunks in Context Lens before every send.",
    whenDisable:
      "Default faster send flow; use lens preview for occasional checks instead.",
    pros: ["Manual chunk exclusion before dispatch", "Catches bad retrieval before the LLM runs"],
    cons: ["Extra click every message when enabled", "Can slow demo flows"],
    recommendation: "Off for demos; on for cautious pilot testers.",
  },
  "contextmint.lensPreviewEnabled": {
    whenEnable: "First few sends per workspace — good for new users learning Context Lens.",
    whenDisable: "Experienced users who already validated retrieval quality.",
    pros: ["Preview matches sources before the LLM runs", "Teaches the Context Lens workflow"],
    cons: ["Extra step before send"],
    recommendation: "Keep enabled for new workspaces; lower firstNSends after sign-off.",
  },
};

export const SERVER_ROLLOUT_SCENARIOS = [
  {
    name: "Production (recommended default)",
    flags: {
      api_surface: false,
      route_registry: true,
      symbol_registry: true,
      plan_selector: true,
      knowledge_lookup: true,
      plan_executor: false,
      intent_classifier: false,
      eop: true,
      eop_receipt: true,
    },
  },
  {
    name: "Staging — graph reconstruct",
    flags: {
      api_surface: false,
      route_registry: true,
      symbol_registry: true,
      plan_selector: true,
      knowledge_lookup: true,
      plan_executor: true,
      intent_classifier: false,
      eop: true,
      eop_receipt: true,
    },
  },
  {
    name: "Staging — paraphrase polish",
    flags: {
      api_surface: false,
      route_registry: true,
      symbol_registry: true,
      plan_selector: true,
      knowledge_lookup: true,
      plan_executor: false,
      intent_classifier: "optional",
      eop: true,
      eop_receipt: true,
    },
  },
  {
    name: "Rollback — EOP off (legacy assembly)",
    flags: {
      api_surface: false,
      route_registry: true,
      symbol_registry: true,
      plan_selector: true,
      knowledge_lookup: true,
      plan_executor: false,
      intent_classifier: false,
      eop: false,
      eop_receipt: false,
    },
  },
  {
    name: "Emergency rollback — search only",
    flags: {
      api_surface: false,
      route_registry: true,
      symbol_registry: false,
      plan_selector: false,
      knowledge_lookup: false,
      plan_executor: false,
      intent_classifier: false,
      eop: false,
      eop_receipt: false,
    },
  },
  {
    name: "Legacy bridge (debug only)",
    flags: {
      api_surface: true,
      route_registry: true,
      symbol_registry: false,
      plan_selector: false,
      knowledge_lookup: false,
      plan_executor: false,
      intent_classifier: false,
      eop: false,
      eop_receipt: false,
    },
  },
];

export const SERVER_DEPENDENCY_NOTES = [
  "Structural questions use index-time knowledge objects first (route registry), then search + expand (windows, grep, graph neighbours) — not repo-specific path injection.",
  "plan_selector_enabled is the query router master switch; keep route_registry_enabled on for RouteObject lookup.",
  "knowledge_object_lookup_enabled requires plan_selector_enabled and registry hits.",
  "evidence_obligation_platform_enabled requires symbol_registry_enabled for DEFINITION cold answers; re-index after enabling.",
  "evidence_receipt_eop_fields_enabled is useful only when EOP is on — exports obligation audit fields on Context Receipt.",
  "obligation_slot_ratios apply inside resolve_rag_budget when EOP is enabled — tune together with max_context_tokens.",
  "retrieval.discovery_policy is read per primary obligation type (overview, definition, registration, semantic).",
  "plan_executor_enabled is for optional graph reconstruct when lookup misses — off by default in production.",
  "retrieval.inference_enabled (server defaults) gates LLM evidence selection — last resort only, off by default.",
  "api_surface_enabled is a legacy rollback bridge — not the primary production path.",
  "runtime.ollama_ensure_model_loaded preloads cold models before chat; runtime.ollama_keep_model_loaded prevents eviction on sovereign servers.",
  "server.ollama_warmup_read_timeout_sec caps preload wait — separate from server.ollama_chat_read_timeout_sec stream read.",
  "Server-only keys are not in VS Code Settings — use Engine Ollama panel, Server config tab, YAML overlay, or env vars, then restart the API.",
];

export const EXTENSION_RETRIEVAL_GUIDE = {
  id: "extension-retrieval",
  title: "Retrieval & context assembly (extension)",
  summary:
    "These VS Code settings control what the extension adds before the API assembles evidence. They complement — but do not replace — server-side evidence assembly below. The server routes structural questions to index-time knowledge when available, then hybrid search, window expansion, workspace grep, and dependency-graph neighbours. Local client grep can add noise if left wide open after indexing finishes.",
  serverLinkAnchor: "#settings-server-evidence-assembly",
  tips: [
    "For “how does this repo work?” questions, keep client grep reasonable and let indexing finish first.",
    "For “how is this route registered?” questions, server knowledge lookup matters more than extension grep.",
    "If answers cite the wrong files, lower clientGrepMaxSnippets or enable clientGrepIndexingOnly.",
    "Context Lens shows shipped provenance — what you preview is what the model receives.",
  ],
};

export const SERVER_VERIFY_TIPS = [
  "Ask how an API route is wired — the answer should trace handler → router → application entry from registry facts or expanded excerpts.",
  "B2 cold: ask where a PascalCase symbol is defined with no file open — answer should cite the definition site; receipt should show selection_path R1 and source=registry.",
  "B1 overview: receipt should show pack_seed coverage and obligations_requested including overview when EOP is on.",
  "Retry the same question after re-indexing if route or symbol facts look stale.",
  "If quality drops, disable the newest flag you turned on (or roll back to EOP off / search-only) and re-index the workspace.",
  "Confirm effective flags after restart — a stale ~/.contextmint/server.defaults.yaml overlay can override repo defaults.",
  "Use Engine → observability or your metrics endpoint to watch structural query volume after changes.",
];
