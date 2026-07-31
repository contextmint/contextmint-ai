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
    match: (id) =>
      id.startsWith("server.") && id !== "server.ollama_narration_model",
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
      /^chat\.(max_history|max_msg_chars|max_turns|token_chars|prompt_store|tier_complexity|context_lanes|work_lane|lane_suggest|image_|trivial_query|pack_skip|pack_trust|history_policy|default_local_vision|mechanism_|pack_meta_|pack_name_|prefix_layout_|sse_keepalive|state_trace_|structural_plan_|uat_regression|vision_admission)/.test(
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
    id: "evidence-narration",
    title: "Evidence narration & clarification",
    description:
      "Citation-bound LLM narration on sanitized excerpts, clarification recovery when evidence is insufficient, and final insufficient-evidence stop after max turns. Server restart required.",
    match: (id) =>
      /^chat\.(narration_|clarification_|insufficient_evidence_|fact_template_only|meaning_pack|inference_requires_llm|structural_template_primary_)/.test(
        id,
      ) || id === "server.ollama_narration_model",
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
      /^chat\.(route_registry|service_registry|section_registry|document_registry|module_consumer_registry|plan_selector|plan_executor|knowledge_object|structural_probe|intent_classifier|structured_answer|ko_max)/.test(
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
      "Hybrid search top-k, window expansion, parallel grep, graph fetch, ShipLaw expand ladder, R6 escalation gates, optional LLM inference (last resort, off by default), retrieval decision tracing for manual UAT, and optional live pipeline_progress SSE (off by default until RT-VIEW dogfood).",
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
    description:
      "Ghost-text completion endpoint — off by default. Pause policy (pause_mode) controls whether completions yield while embed/reindex is busy.",
    match: (id) => id.startsWith("inline."),
  },
  {
    id: "agent-core",
    title: "Agent loop & Apply Gate (server)",
    description:
      "Governed agent runtime — tool rounds, Apply Gate, ChangeSet, investigation depth, terminal allowlist. Off by default until operator enables agent.enabled after dogfood.",
    match: (id) =>
      id.startsWith("agent.") &&
      !id.startsWith("agent.intel.") &&
      !id.startsWith("agent.moat.") &&
      !id.startsWith("agent.network.") &&
      !id.startsWith("agent.spec_tools."),
  },
  {
    id: "agent-intel",
    title: "Agent intel (LSP · packs · git · tree)",
    description:
      "GATE-AG-INTEL navigation tools — extension LSP proxy, pack query, git porcelain, tree_view. Nested under agent.intel.*; defaults off.",
    match: (id) => id.startsWith("agent.intel."),
  },
  {
    id: "agent-moat-network",
    title: "Agent moat · network · Spec tools",
    description:
      "Deep blast / ADR context / MCP export (agent.moat.*), policy-gated fetch_url/search_web (agent.network.*), and Spec tools (read_image / insert_text). Defaults off; Sovereign blocks network by policy.",
    match: (id) =>
      id.startsWith("agent.moat.") ||
      id.startsWith("agent.network.") ||
      id.startsWith("agent.spec_tools."),
  },
  {
    id: "review",
    title: "Code review (server)",
    description:
      "CR-1…CR-4 review programme — file/branch/feature/flow. All review.* switches shipped off until explicit default-on after GATE-R-FINAL dogfood.",
    match: (id) => id.startsWith("review."),
  },
  {
    id: "governance-control-plane",
    title: "Governance control plane",
    description:
      "GATE-GOV-POLICY — PolicyDecision, admit plugins, audit sinks, policy push. Shipped switches default off; dogfood via overlay.",
    match: (id) => id.startsWith("governance."),
  },
  {
    id: "oir-reconciliation",
    title: "OIR & knowledge reconciliation (Block RO)",
    description:
      "Operational intelligence / reconciliation tunables (oir.* · reconciliation.*). FOI product claims stay gated; defaults off.",
    match: (id) => id.startsWith("oir.") || id.startsWith("reconciliation."),
  },
  {
    id: "ss-mu",
    title: "Sovereign multi-user (SS-MU)",
    description:
      "Dual-plane local WIP + sovereign main — post mid-Sept demo programme. ss_mu.enabled false until PO dogfood PASS.",
    match: (id) => id.startsWith("ss_mu."),
  },
  {
    id: "fabric",
    title: "Knowledge Fabric (Block U thin)",
    description:
      "Institutional memory graph spine — defaults off. List/get, shadow dual-write, Memory Tab, learner/decay, thin audit/RBAC, Memory Tab UX, domain filter, and graph neighborhood thin behind fabric.* flags. Not GATE-W1 / FOI; read_cutover stays false.",
    match: (id) => id.startsWith("fabric."),
  },
  {
    id: "inference-vector",
    title: "Inference profile & vector store",
    description:
      "Sovereign openai_compat / vLLM profile (inference.*) and optional Qdrant path (vector_store.*). Default remain local Ollama + Chroma unless operator changes profile.",
    match: (id) => id.startsWith("inference.") || id.startsWith("vector_store."),
  },
  {
    id: "airgap-cors",
    title: "Air-gap & CORS",
    description:
      "N+ air-gap kill switches (telemetry/update/cloud) and CORS allowlists for remote extension→server.",
    match: (id) => id.startsWith("airgap.") || id.startsWith("cors."),
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
  {
    id: "resource-scheduler",
    title: "Resource scheduler",
    description: "Embed/chat slot scheduling on shared hosts.",
    match: (id) => id.startsWith("resource_scheduler."),
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
  "retrieval.trace_enabled":
    "Collect an in-memory retrieval decision trace on each repo-lane structural turn — plan selection, anchor verify, ShipLaw, expand ladder, and response gates. Used for manual UAT debugging; minimal overhead when export is off.",
  "retrieval.trace_export_enabled":
    "Write retrieval-trace-*.json to the operator-configured export folder at end of turn. Enable during manual UAT or receipt postmortems — off by default in production.",
  "retrieval.trace_export_dir":
    "Folder for retrieval-trace-*.json during manual UAT (default documentation/evidence). Relative to server cwd or absolute. Not hardcoded in product code — always read from this setting.",
  "retrieval.trace_include_query":
    "Include full query text in exported trace JSON. Keep true for local manual tests; set false before sharing logs externally.",
  "retrieval.trace_max_field_chars":
    "Cap string fields in trace inputs/outputs (100–8000). Prevents large excerpt dumps or secrets from bloating trace files.",
  "retrieval.trace_include_pipeline_inputs":
    "Record stage parameters in pipeline trace rows when trace collection is enabled.",
  "retrieval.trace_include_evidence_detail":
    "Record shipped and collected evidence excerpts in trace export — disable to shrink trace JSON size.",
  "retrieval.trace_include_llm_io":
    "Record raw LLM prompt messages and response text in trace export — disable before sharing logs externally.",
  "retrieval.trace_llm_io_max_chars":
    "Max chars per raw LLM prompt/response field in trace export (500–64000).",
  "retrieval.trace_evidence_preview_chars":
    "Max chars per excerpt preview in collected-evidence trace rows (80–4000).",
  "retrieval.expand_ladder_enabled":
    "ShipLaw-gated expand ladder L1–L5 — escalates grep, search, windows, graph, and optional infer until sufficient or exhausted.",
  "retrieval.excerpt_select_infer_enabled":
    "Enable L5 excerpt-select infer stage in expand ladder — last resort only; off by default until certified.",
  "retrieval.live_progress_enabled":
    "Emit pipeline_progress SSE events during chat retrieval so the VS Code extension live timeline can show retrieval phases. Off by default until RT-VIEW dogfood; extension renders events when the server emits them.",
  "retrieval.live_progress_granularity":
    "Live progress detail level: summary (user-meaningful phases only), stage (each pipeline stage), or verbose (includes meta).",
  "retrieval.live_progress_max_events_per_turn":
    "Cap pipeline_progress SSE events per chat turn (5–200) to prevent flood on verbose mode.",
  "retrieval.live_progress_include_paths":
    "Include repo-relative file paths in live progress detail lines when server emits pipeline_progress.",
  "retrieval.live_progress_min_interval_ms":
    "Minimum milliseconds between duplicate live progress phase updates (0–5000). Throttles noisy step_id repeats.",
  "inline.pause_mode":
    "Pause Mode for inline completion while embed/reindex is busy: off (never), shared_runtime (pause only when chat and embed share one Ollama host), on_embed_busy (always pause when busy). Default off.",
  "inline.pause_while_indexing":
    "DEPRECATED mirror of pause_mode — prefer inline.pause_mode. True alone maps to on_embed_busy; pause_mode wins when both are set. Default false.",
  "inline.enabled":
    "Enable the ghost-text /api/v1/complete endpoint — off by default until product default-on.",
  "server.ollama_url":
    "Chat Ollama base URL (Mode A shared host, or Mode B chat host). Example: http://192.168.1.248:11434.",
  "server.ollama_embed_url":
    "Optional distinct embed Ollama URL for Mode B. Empty or same host as ollama_url = Mode A (shared). Example: http://192.168.1.140:11435.",
  "engine.ollama_url":
    "Engine status/supervisor Ollama URL — keep aligned with server.ollama_url (chat host).",
  "resource_scheduler.embed_slots":
    "Concurrent embed slots. On Mode B (split hosts) prefer ≥2 so chat and embed can run in parallel.",
  "chat.narration_enabled":
    "Citation-bound LLM narration on sanitized shipped excerpts when meaning intent is detected and evidence is sufficient.",
  "chat.narration_max_excerpts":
    "Maximum numbered excerpts passed to the narration LLM call.",
  "chat.narration_max_tokens":
    "Max output tokens for citation-bound narration LLM call.",
  "chat.narration_timeout_ms":
    "Wall-clock timeout (ms) for narration LLM call.",
  "chat.narration_require_citations":
    "Reject narration results that omit valid citation ids from the excerpt pack.",
  "chat.inference_requires_llm":
    "When true, sufficient repo-lane turns must invoke an LLM for inference (citation narration or overview chat stream) — fact templates alone are not answers.",
  "chat.structured_answer_without_llm":
    "Legacy SKL-H-004 toggle. When inference_requires_llm is true (default), SUMMARY uses citation narration — this flag does not skip the answer LLM.",
  "chat.meaning_pack_expand_enabled":
    "When meaning intent is detected, require usage-context excerpts (grep/graph/search) beyond the definition anchor before narration.",
  "chat.meaning_pack_min_usage_excerpts":
    "Minimum non-anchor usage-tier excerpts required before meaning pack is sufficient.",
  "chat.meaning_pack_min_distinct_files":
    "Minimum distinct files with entity-bearing usage excerpts (when entity requirement enabled) for meaning pack sufficiency.",
  "chat.meaning_pack_require_entity_in_usage_excerpt":
    "Meaning-pack usage excerpts must mention the obligation entity in excerpt text.",
  "chat.meaning_pack_require_usage_call_pattern":
    "Meaning-pack usage excerpts must show call/import/instantiation of the entity (not type-hint-only mentions).",
  "chat.narration_insufficient_expand_max_passes":
    "After narration returns insufficient_evidence, run meaning expand ladder and re-narrate up to this many times.",
  "chat.module_consumer_registry_enabled":
    "Enable Module Consumer Registry lookup path (SKL-H-009 Type B reverse dependencies).",
  "retrieval.execution_plane_trace_enabled":
    "Write execution-trace-*.txt with per-step received/emitted/flags/branches for repo-lane UAT postmortems (off by default).",
  "retrieval.execution_plane_trace_max_field_chars":
    "Max characters per field in execution plane trace .txt export (200–16000).",
  "chat.clarification_prompt_templates.narration_llm_timeout":
    "User-facing message when verified excerpts were ready but the narration LLM timed out.",
  "chat.fact_template_only_when_no_meaning_intent":
    "When true, skip narration LLM and use fact templates only when the query has no meaning intent.",
  "chat.clarification_enabled":
    "Ask the user for symbol, route, or file hints when evidence is insufficient — before final insufficient stop.",
  "chat.clarification_max_turns":
    "Maximum clarification rounds before insufficient_evidence_final_message (default 2).",
  "chat.clarification_merge_entity_terms":
    "Merge entity tokens from clarification replies into session obligation hints for the next retrieval pass.",
  "chat.insufficient_evidence_enabled":
    "Emit honest insufficient-evidence response after clarification turns are exhausted.",
  "chat.insufficient_evidence_partial_facts_allowed":
    "Allow partial fact templates when meaning was requested — default false to avoid misleading role text.",
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
  "agent.enabled":
    "Master switch for the governed agent loop (tools + Apply Gate). Off by default until GATE-AG / TOOLING default-on.",
  "agent.apply_gate_required":
    "Require Apply Gate decision before governed writes. Keep true in production.",
  "agent.intel.enabled":
    "GATE-AG-INTEL umbrella — LSP / packs / git / tree agent tools. Off until dogfood overlay.",
  "agent.intel.lsp.enabled":
    "LSP proxy tools (go_to_definition, find_references, …). Needs extension loopback proxy header.",
  "agent.moat.enabled":
    "Moat tools umbrella — deepen blast, ADR context, MCP export. Off by default.",
  "agent.moat.mcp_export_enabled":
    "Expose list_mcp_export_tools + optional HTTP MCP export. Runtime stays MCP-optional.",
  "agent.moat.mcp_http_export_enabled":
    "GET /api/v1/mcp/export/tools when moat MCP export is on.",
  "agent.moat.mcp_http_call_enabled":
    "POST /api/v1/mcp/export/call — execute allowlisted export tools only.",
  "agent.network.enabled":
    "Allow registering fetch_url / search_web. Sovereign policy may still BLOCK.",
  "agent.terminal.enabled":
    "Allowlisted run_terminal tool. Off until enterprise tooling default-on.",
  "agent.spec_tools.enabled":
    "Spec tools (read_image / insert_text_at_cursor). Off by default.",
  "review.enabled":
    "Master review programme switch. Off until explicit default-on after GATE-R-FINAL.",
  "ss_mu.enabled":
    "Sovereign dual-plane multi-user. Off until GATE-SS-MU PO dogfood PASS.",
  "fabric.enabled":
    "Master switch for Fabric graph APIs (list/get) and delete cascade. Off by default — not GATE-W1.",
  "fabric.shadow_write_enabled":
    "When true with fabric.enabled, finalize dual-writes file nodes (and optional edges) into Fabric. Default off.",
  "fabric.shadow_write_conventions":
    "When true with shadow write, upsert convention candidate nodes (hubs + naming) for Memory Tab. Default off — not GATE-W1.",
  "fabric.memory_tab_enabled":
    "Admit Memory Tab convention list/approve/dismiss APIs (still requires fabric.enabled). Extension filter + audit trail when audit_events_enabled. Default off — not GATE-W1.",
  "fabric.learner_enabled":
    "Enrich convention payloads from Memory audit JSONL (hints only — never auto-approve). Default off — not GATE-W1.",
  "fabric.decay_enabled":
    "Decay/retract stale pending conventions; never deletes approved/dismissed. Default off — not GATE-W1.",
  "fabric.audit_events_enabled":
    "Dual-write immutable audit_events SQLite rows alongside Memory JSONL (Memory Tab audit trail reads this). Default off — not GATE-W1.",
  "fabric.audit_fail_closed":
    "When audit_events_enabled, raise on table insert failure (default soft log-and-continue).",
  "fabric.rbac_enabled":
    "Deny-by-default Fabric route ACL via workspace roles (still requires fabric.enabled). Default off — not GATE-W1.",
  "fabric.require_auth":
    "Require authenticated principal on Fabric list/mutate when auth is on. Default off — not GATE-W1.",
  "fabric.domain_tagging_enabled":
    "When true with shadow write, stamp payload.domain on file/convention nodes from fabric.domain_rules globs. Default off — not GATE-W1.",
  "fabric.domain_filter_enabled":
    "Admit GET /fabric/domains and conventions?domain= (still requires fabric.enabled + memory_tab_enabled for Memory Tab). Default off — not GATE-W1.",
  "fabric.domain_rules":
    "Ordered workspace-agnostic path glob rules; first match wins as primary domain id. Not golden/repo paths.",
  "fabric.neighborhood_enabled":
    "Admit GET /fabric/neighborhood over fabric_edges (still requires fabric.enabled). Default off — not GATE-W1.",
  "fabric.neighborhood_max_hops":
    "Max BFS hops from the seed node for neighborhood reads (0 = seed only).",
  "fabric.neighborhood_max_nodes":
    "Hard cap on nodes returned by /fabric/neighborhood (including seed).",
  "fabric.neighborhood_edge_types":
    "Edge types walked in both directions for neighborhood (empty falls back to depends_on).",
  "fabric.read_cutover_enabled":
    "Reserved read-path cutover from legacy stores. Must stay false until GATE-W1.",
  "airgap.mode":
    "When true, force off telemetry / update / cloud dispatch (N+ air-gap kill switches).",
  "governance.policy_push_enabled":
    "Allow central policy rule push to trays (N+ / GOV-POLICY). Off by default.",
  "inference.provider":
    "Inference provider profile — local Ollama vs openai_compat (sovereign vLLM).",
  "vector_store.backend":
    "Vector backend — chroma (default) or qdrant (GATE-SS-SCALE).",
  "retrieval.live_progress_enabled":
    "SSE pipeline_progress for RT-VIEW. Off until explicit default-on.",
  "oir.enabled":
    "Operational intelligence router / OIR surface. Keep aligned with Block RO dogfood; defaults off.",
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
  "retrieval.trace_enabled",
  "retrieval.trace_export_enabled",
  "retrieval.trace_export_dir",
  "retrieval.trace_include_query",
  "retrieval.trace_max_field_chars",
  "retrieval.trace_include_pipeline_inputs",
  "retrieval.trace_include_evidence_detail",
  "retrieval.trace_include_llm_io",
  "retrieval.trace_llm_io_max_chars",
  "retrieval.trace_evidence_preview_chars",
  "retrieval.execution_plane_trace_enabled",
  "retrieval.execution_plane_trace_max_field_chars",
  "retrieval.expand_ladder_enabled",
  "retrieval.excerpt_select_infer_enabled",
  "retrieval.live_progress_enabled",
  "retrieval.live_progress_granularity",
  "retrieval.live_progress_max_events_per_turn",
  "retrieval.live_progress_include_paths",
  "retrieval.live_progress_min_interval_ms",
  "chat.narration_enabled",
  "chat.narration_max_excerpts",
  "chat.narration_max_tokens",
  "chat.narration_timeout_ms",
  "chat.narration_require_citations",
  "chat.inference_requires_llm",
  "chat.structured_answer_without_llm",
  "chat.meaning_pack_expand_enabled",
  "chat.meaning_pack_min_usage_excerpts",
  "chat.meaning_pack_min_distinct_files",
  "chat.meaning_pack_require_entity_in_usage_excerpt",
  "chat.meaning_pack_require_usage_call_pattern",
  "chat.narration_insufficient_expand_max_passes",
  "chat.module_consumer_registry_enabled",
  "chat.fact_template_only_when_no_meaning_intent",
  "chat.structural_template_primary_enabled",
  "chat.structural_template_primary_min_obligations",
  "chat.narration_map_reduce_per_obligation",
  "chat.narration_json_schema_enabled",
  "server.ollama_narration_model",
  "chat.clarification_enabled",
  "chat.clarification_max_turns",
  "chat.clarification_merge_entity_terms",
  "chat.insufficient_evidence_enabled",
  "chat.insufficient_evidence_partial_facts_allowed",
  "evidence_planes.enabled",
  "sandbox.enabled",
  "quality.enabled",
  "quality.governed_chat_enabled",
  "argus.enabled",
  "auth.enabled",
  "server.debug_mode",
  "server.ollama_url",
  "server.ollama_embed_url",
  "server.ollama_warmup_read_timeout_sec",
  "runtime.ollama_ensure_model_loaded",
  "runtime.ollama_keep_model_loaded",
  "inline.enabled",
  "inline.pause_mode",
  "inline.pause_while_indexing",
  "resource_scheduler.embed_slots",
  "agent.enabled",
  "agent.apply_gate_required",
  "agent.intel.enabled",
  "agent.intel.lsp.enabled",
  "agent.moat.enabled",
  "agent.moat.mcp_export_enabled",
  "agent.moat.mcp_http_export_enabled",
  "agent.moat.mcp_http_call_enabled",
  "agent.network.enabled",
  "agent.terminal.enabled",
  "agent.spec_tools.enabled",
  "review.enabled",
  "ss_mu.enabled",
  "fabric.enabled",
  "airgap.mode",
  "governance.policy_push_enabled",
  "inference.provider",
  "vector_store.backend",
  "retrieval.live_progress_enabled",
  "oir.enabled",
]);

/**
 * Optional enum choices for Server Config dropdowns (desktop).
 * @type {Record<string, string[]>}
 */
export const SERVER_SETTING_CHOICES = {
  "inline.pause_mode": ["off", "shared_runtime", "on_embed_busy"],
  "retrieval.live_progress_granularity": ["summary", "stage", "verbose"],
  "inference.provider": ["ollama", "openai_compat"],
  "vector_store.backend": ["chroma", "qdrant"],
};

/**
 * @param {string} settingId
 * @returns {ServerSectionDef | undefined}
 */
export function assignServerSection(settingId) {
  return SERVER_SECTIONS.find((section) => section.match(settingId));
}
