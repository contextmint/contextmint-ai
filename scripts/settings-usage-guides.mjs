/**
 * Operator usage copy for contextmint-ai settings docs (server + extension).
 * User-facing language only — no internal ticket IDs, plan codes, or CI script names.
 * Aligned with workspace-agnostic Retrieve → Expand → Infer (ADR-015).
 */

/** @typedef {{ whenEnable: string, whenDisable: string, pros: string[], cons: string[], recommendation: string }} SettingUsage */

/** @type {Record<string, SettingUsage>} */
export const SERVER_SETTING_USAGE = {
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
      plan_selector: true,
      knowledge_lookup: true,
      plan_executor: false,
      intent_classifier: false,
    },
  },
  {
    name: "Staging — graph reconstruct",
    flags: {
      api_surface: false,
      route_registry: true,
      plan_selector: true,
      knowledge_lookup: true,
      plan_executor: true,
      intent_classifier: false,
    },
  },
  {
    name: "Staging — paraphrase polish",
    flags: {
      api_surface: false,
      route_registry: true,
      plan_selector: true,
      knowledge_lookup: true,
      plan_executor: false,
      intent_classifier: "optional",
    },
  },
  {
    name: "Emergency rollback — search only",
    flags: {
      api_surface: false,
      route_registry: true,
      plan_selector: false,
      knowledge_lookup: false,
      plan_executor: false,
      intent_classifier: false,
    },
  },
  {
    name: "Legacy bridge (debug only)",
    flags: {
      api_surface: true,
      route_registry: true,
      plan_selector: false,
      knowledge_lookup: false,
      plan_executor: false,
      intent_classifier: false,
    },
  },
];

export const SERVER_DEPENDENCY_NOTES = [
  "Structural questions use index-time knowledge objects first (route registry), then search + expand (windows, grep, graph neighbours) — not repo-specific path injection.",
  "plan_selector_enabled is the query router master switch; keep route_registry_enabled on for RouteObject lookup.",
  "knowledge_object_lookup_enabled requires plan_selector_enabled and registry hits.",
  "plan_executor_enabled is for optional graph reconstruct when lookup misses — off by default in production.",
  "retrieval.inference_enabled (server defaults) gates LLM evidence selection — last resort only, off by default.",
  "api_surface_enabled is a legacy rollback bridge — not the primary production path.",
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
  "Retry the same question after re-indexing if route facts look stale.",
  "If quality drops, disable the newest flag you turned on (or roll back to search-only) and re-index the workspace.",
  "Use Engine → observability or your metrics endpoint to watch structural query volume after changes.",
];
