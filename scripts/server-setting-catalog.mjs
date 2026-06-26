/**
 * Server settings section layout, curated descriptions, and operator flags.
 */

/** @typedef {{ id: string, title: string, description: string, match: (settingId: string) => boolean }} ServerSectionDef */

/** @type {ServerSectionDef[]} */
export const SERVER_SECTIONS = [
  {
    id: "server-runtime",
    title: "Server runtime",
    description:
      "HTTP bind address, logging, debug mode, and Ollama timeouts (chat stream read + model preload). Configure in contextmint.defaults.yaml or ~/.contextmint/server.defaults.yaml — restart required.",
    match: (id) => id.startsWith("server."),
  },
  {
    id: "context-budget",
    title: "Context & generation budget (server)",
    description:
      "Operator ceilings for RAG shipped into chat (max_context_tokens) and local answer length (max_gen_tokens). Set via Engine Context budget or server overlay. Ratios under context_budget auto-scale slot sizes when auto_scale is true.",
    match: (id) =>
      /^chat\.(max_context_tokens|max_gen_tokens|conceptual_context_floor_tokens|context_budget\.)/.test(
        id,
      ),
  },
  {
    id: "chat-sessions",
    title: "Chat sessions, lanes & images",
    description:
      "Turn and history limits, Repo / Work / Hybrid lanes, trivial-query fast path, and image attachment caps. Server-side mirrors of several extension chat keys.",
    match: (id) =>
      /^chat\.(max_history|max_msg_chars|max_turns|token_chars|prompt_store|tier_complexity|context_lanes|work_lane|lane_suggest|image_|trivial_query|pack_skip|pack_trust|history_policy|default_local_vision)/.test(
        id,
      ),
  },
  {
    id: "context-receipt",
    title: "Context receipt & export",
    description:
      "Retrieval postmortem instrumentation — top-k candidates, export path, and receipt fields on chat streams.",
    match: (id) => id.startsWith("chat.context_receipt_"),
  },
  {
    id: "canonical-overview",
    title: "Canonical overview & pack seed",
    description:
      "B1 overview ranking, pack-seed hydration, evidence fusion, and grep hygiene for architecture questions. Workspace-agnostic — no golden paths in runtime.",
    match: (id) =>
      /^chat\.(canonical_|evidence_fusion|evidence_shipped)/.test(id),
  },
  {
    id: "api-surface",
    title: "API surface (legacy bridge)",
    description:
      "Pattern-detection bridge for route-wiring questions. Superseded by query router + knowledge layer — disable in production unless debugging a regression.",
    match: (id) => id.startsWith("chat.api_surface"),
  },
  {
    id: "evidence-assembly",
    title: "Evidence assembly (server)",
    description:
      "Query router, index-time registries, knowledge object lookup, optional plan executor, and intent classifier. Production path before hybrid search + expand.",
    match: (id) =>
      /^chat\.(route_registry|service_registry|section_registry|document_registry|plan_selector|plan_executor|knowledge_object|structural_probe|intent_classifier|structured_answer|ko_max)/.test(
        id,
      ),
  },
  {
    id: "evidence-obligation-platform",
    title: "Evidence Obligation Platform (server)",
    description:
      "EOP v1 — unified orchestrator for EVIDENCE-mode chat: obligation planning, Symbol catalog lookup, ShipLaw sufficiency, discovery policy, and slot reserves. Requires server restart. Not in Engine desktop or VS Code UI.",
    match: (id) =>
      /^chat\.(evidence_obligation|evidence_receipt_eop|symbol_registry|obligation_)/.test(id) ||
      id === "retrieval.discovery_policy",
  },
  {
    id: "knowledge",
    title: "Knowledge layer & registries",
    description:
      "Index-time extractors, agreement scores, registry file paths, connector subdirs, and SQRR validation thresholds.",
    match: (id) => id.startsWith("knowledge."),
  },
  {
    id: "retrieval",
    title: "Retrieval, expand & infer",
    description:
      "Hybrid search top-k, window expansion, parallel grep, graph fetch, R6 escalation gates, and optional LLM inference (last resort, off by default).",
    match: (id) => id.startsWith("retrieval.") && id !== "retrieval.discovery_policy",
  },
  {
    id: "pipeline",
    title: "Retrieval pipeline budgets",
    description: "Per-tier stage budgets and degraded-mode caps for the evidence pipeline.",
    match: (id) => id.startsWith("pipeline."),
  },
  {
    id: "compression",
    title: "Context compression",
    description: "Regex and rank-gap compression before evidence ships to the LLM.",
    match: (id) => id.startsWith("compression."),
  },
  {
    id: "cache",
    title: "Query & LLM caches",
    description: "Semantic query cache, LLM response cache, and generation bump debounce.",
    match: (id) => id.startsWith("cache."),
  },
  {
    id: "embedding-indexing",
    title: "Embedding & indexing",
    description:
      "Embed batch sizes, indexing concurrency, warm restart, literal tokens, and bootstrap role metadata at index time.",
    match: (id) => id.startsWith("embedding.") || id.startsWith("indexing."),
  },
  {
    id: "evidence-planes",
    title: "Evidence planes",
    description:
      "Index stamping and query-time filtering by evidence plane (developer vs doc_meta vs harness).",
    match: (id) => id.startsWith("evidence_planes."),
  },
  {
    id: "packs",
    title: "Repo memory (packs)",
    description: "Pack sync limits, fingerprint paths, and trust anchor checks for session and core packs.",
    match: (id) => id.startsWith("packs."),
  },
  {
    id: "sandbox",
    title: "Sandbox (server)",
    description:
      "Git worktree sandbox for isolated apply — requires extension sandbox.enabled when used from VS Code.",
    match: (id) => id.startsWith("sandbox."),
  },
  {
    id: "runtime-resilience",
    title: "Runtime & circuit breaker",
    description:
      "RAM pause/resume during indexing, Ollama health probes, model preload before chat, and keep-alive (sovereign server). API circuit breaker thresholds.",
    match: (id) => id.startsWith("runtime.") || id.startsWith("circuit_breaker."),
  },
  {
    id: "session-summary",
    title: "Session summary",
    description: "Optional rolling session summaries after N turns.",
    match: (id) => id.startsWith("session_summary."),
  },
  {
    id: "semantic-enrichment",
    title: "Semantic enrichment (index)",
    description: "Optional chunk summaries at index time — off by default.",
    match: (id) => id.startsWith("semantic_enrichment."),
  },
  {
    id: "quality",
    title: "Quality & governed chat",
    description:
      "DRY/structure scan thresholds, governed chat implementation audit, and apply-gate settings.",
    match: (id) => id.startsWith("quality."),
  },
  {
    id: "argus",
    title: "ARGUS visual audit",
    description: "VLM-backed visual paste audit — model route, screenshot caps, and report TTL.",
    match: (id) => id.startsWith("argus."),
  },
  {
    id: "inline",
    title: "Inline completion (server)",
    description: "Ghost-text completion endpoint — off by default.",
    match: (id) => id.startsWith("inline."),
  },
  {
    id: "auth-audit",
    title: "Auth & audit",
    description: "JWT auth mode, workspace ACL, and audit JSONL flush batching.",
    match: (id) => id.startsWith("auth.") || id.startsWith("audit."),
  },
  {
    id: "telemetry",
    title: "Telemetry sample rates",
    description: "Operator-tunable sample rates for retrieval latency, cache hits, and graph events.",
    match: (id) => id.startsWith("telemetry."),
  },
  {
    id: "engine-supervisor",
    title: "Engine supervisor (server-side)",
    description:
      "Tunables read by ContextMint Engine desktop for lock file, log tail, knowledge tab limits, and model guidance tiers. Prefer Engine → Settings for routine changes.",
    match: (id) => id.startsWith("engine."),
  },
  {
    id: "ui-catalog",
    title: "UI catalog (visual regression)",
    description: "Viewport and diff thresholds for UI catalog visual regression — internal tooling.",
    match: (id) => id.startsWith("ui_catalog."),
  },
];

/** Curated operator-facing descriptions — override humanized key names. */
/** @type {Record<string, string>} */
export const SERVER_SETTING_DESCRIPTIONS = {
  "chat.max_context_tokens":
    "Operator ceiling for RAG chunk budget (ship + assemble). Saved in overlay ships unchanged; tier ratios are guidelines only until Apply.",
  "chat.max_gen_tokens":
    "Operator ceiling for Ollama num_predict on chat streams. Engine Apply co-writes tier default when saving max_context_tokens.",
  "chat.api_surface_enabled":
    "Legacy pattern-detection bridge for route-wiring questions. Superseded by the query router and knowledge layer — disable in production unless debugging a regression.",
  "chat.route_registry_enabled":
    "Index-time route registry (RouteObject knowledge). Powers O(1) structural lookup on any workspace the extractor supports.",
  "chat.plan_selector_enabled":
    "Query router — routes structural questions to knowledge lookup, graph expand, or full search + expand. Production default.",
  "chat.plan_executor_enabled":
    "Optional declarative YAML plans for graph reconstruct when registry lookup misses. Off by default.",
  "chat.knowledge_object_lookup_enabled":
    "Render structured facts from index-time knowledge objects when the query router selects a lookup path.",
  "chat.intent_classifier_enabled":
    "Optional paraphrase hints for the plan selector. Expands candidates only — never overrides routing alone.",
  "chat.intent_classifier_rules_path":
    "YAML file mapping paraphrase hints to structural plans (default: api_registration_chain).",
  "chat.intent_classifier_model_path":
    "Optional DistilBERT/ONNX model artifact path. Empty = regex fast path only.",
  "chat.plan_executor_max_ops":
    "Safety limit: maximum operations per structural plan execution.",
  "chat.plan_executor_max_traverse_depth":
    "Safety limit: maximum graph traversal depth per plan operation.",
  "chat.plan_executor_max_ms":
    "Safety limit: maximum wall time (ms) for a single plan execution.",
  "chat.evidence_obligation_platform_enabled":
    "Master switch for Evidence Obligation Platform — orchestrator plans obligations, catalog lookup, ShipLaw sufficiency, and discovery policy for EVIDENCE-mode chat. Server restart required. Not in Engine desktop UI.",
  "chat.evidence_receipt_eop_fields_enabled":
    "Dual-write obligations_requested, obligations_fulfilled, and execution_mode_eop on Context Receipt when enabled.",
  "chat.symbol_registry_enabled":
    "Index-time Symbol Registry (SymbolObject) for DEFINITION questions — powers B2 cold lookup via R1.",
  "chat.obligation_entity_min_length":
    "Minimum token length for PascalCase entity terms in the obligation entity vs language grep split (EOP-B3).",
  "chat.obligation_language_stopwords":
    "Language tokens excluded from entity-driven grep on DEFINITION questions (where, defined, main, …). YAML list under chat:.",
  "chat.obligation_slot_ratios":
    "Mandatory obligation token reserves inside effective RAG cap when EOP is on (overview, definition, registration ratios).",
  "retrieval.discovery_policy":
    "Per-obligation discovery suppress flags (grep, search, pack) when EOP selects a primary obligation type.",
  "retrieval.inference_enabled":
    "LLM evidence selection — last resort only. Off by default; enable only on T2+ after expand/grep exhaust.",
  "retrieval.window_expand_enabled":
    "Read file ± N lines around chunk or grep hits — workspace-agnostic expand (ADR-015).",
  "retrieval.parallel_grep_enabled":
    "Workspace grep from query terms — config-driven synonyms, not repo-specific paths.",
  "retrieval.graph_fetch_enabled":
    "Follow dependency graph edges and read neighbour files with windows.",
  "chat.service_registry_enabled":
    "Index-time service registry for Type B service questions.",
  "chat.section_registry_enabled":
    "Index-time section registry for wiki/connector sections — off until extractor validated on your workspace.",
  "chat.document_registry_enabled":
    "Index-time document registry for handbook and policy PDFs/markdown.",
  "chat.context_receipt_enabled":
    "Emit Context Receipt JSON on chat streams for retrieval postmortems.",
  "chat.canonical_overview_enabled":
    "Enable B1 canonical overview ranking profile for architecture questions.",
  "chat.evidence_fusion_enabled":
    "Pack-anchored RAG fusion — prefer pack seeds before redundant search on overview questions.",
  "evidence_planes.enabled":
    "Master switch for evidence plane stamping and query-time plane filters.",
  "sandbox.enabled":
    "Enable git worktree sandbox API — requires extension contextmint.sandbox.enabled.",
  "quality.enabled":
    "Master switch for quality scans (clones, structure, patterns).",
  "quality.governed_chat_enabled":
    "Pre-send governance notes and implementation audit on store-backed answers.",
  "argus.enabled":
    "Enable ARGUS visual paste audit (VLM + browser capture).",
  "auth.enabled":
    "Enable JWT auth on API endpoints — off for local-first single-user installs.",
  "server.debug_mode":
    "Enable verbose server logging and debug endpoints — off in production.",
  "server.host": "HTTP bind address for the API server (default 0.0.0.0).",
  "server.port": "HTTP port for the API server (default 8000).",
  "server.log_level": "Python log level (INFO, DEBUG, WARNING).",
  "server.context_assembly_timeout_sec":
    "Wall-clock timeout (seconds) for context assembly before chat stream fails.",
  "server.chroma_path":
    "Absolute path for ChromaDB and per-workspace BM25/graph/hash sidecars. Default ~/.contextmint/index_db — outside customer repos.",
  "server.ollama_chat_read_timeout_sec":
    "Ollama stream read timeout (seconds) — raise for large overview budgets on CPU tiers.",
  "server.ollama_warmup_read_timeout_sec":
    "Timeout (seconds) for explicit Ollama model preload (/api/generate) before chat when the model is cold — separate from the chat stream timeout.",
  "runtime.ollama_ensure_model_loaded":
    "When true, probe Ollama /api/ps before chat and preload the model when it is not in VRAM — reduces cold-start stream errors.",
  "runtime.ollama_keep_model_loaded":
    "When true, Ollama chat and embed models stay loaded (keep_alive=-1, no eviction). Recommended for sovereign server deployments with dedicated inference RAM.",
  "runtime.ollama_health_timeout_sec":
    "HTTP timeout (seconds) for Ollama /api/ps health probe.",
  "engine.server_port":
    "API port Engine expects when managing the Python server (default 8000).",
};

/** Keys surfaced as operator-priority in the settings table. */
export const SERVER_OPERATOR_KEYS = new Set([
  "chat.max_context_tokens",
  "chat.max_gen_tokens",
  "chat.api_surface_enabled",
  "chat.route_registry_enabled",
  "chat.service_registry_enabled",
  "chat.symbol_registry_enabled",
  "chat.document_registry_enabled",
  "chat.plan_selector_enabled",
  "chat.plan_executor_enabled",
  "chat.knowledge_object_lookup_enabled",
  "chat.intent_classifier_enabled",
  "chat.evidence_obligation_platform_enabled",
  "chat.evidence_receipt_eop_fields_enabled",
  "chat.context_receipt_enabled",
  "chat.canonical_overview_enabled",
  "chat.evidence_fusion_enabled",
  "retrieval.inference_enabled",
  "retrieval.window_expand_enabled",
  "retrieval.parallel_grep_enabled",
  "retrieval.graph_fetch_enabled",
  "evidence_planes.enabled",
  "sandbox.enabled",
  "quality.enabled",
  "quality.governed_chat_enabled",
  "argus.enabled",
  "auth.enabled",
  "server.debug_mode",
  "server.ollama_warmup_read_timeout_sec",
  "runtime.ollama_ensure_model_loaded",
  "runtime.ollama_keep_model_loaded",
]);

/**
 * @param {string} settingId
 * @returns {ServerSectionDef | undefined}
 */
export function assignServerSection(settingId) {
  return SERVER_SECTIONS.find((section) => section.match(settingId));
}
