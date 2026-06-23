/**
 * Operator usage copy for contextmint-ai settings docs (server + extension).
 * User-facing language only — no internal ticket IDs, plan codes, or CI script names.
 */

/** @typedef {{ whenEnable: string, whenDisable: string, pros: string[], cons: string[], recommendation: string }} SettingUsage */

/** @type {Record<string, SettingUsage>} */
export const SERVER_SETTING_USAGE = {
  "chat.api_surface_enabled": {
    whenEnable:
      "Production installs where users ask how API routes are wired (handler → router → app entry). Keep on unless you are isolating a retrieval bug.",
    whenDisable:
      "Emergency rollback, comparing plain search-only answers, or debugging whether route-chain context is causing bad sources.",
    pros: [
      "Proven path for route-wiring questions — traces handler → registration hub → mount chain",
      "Works without the advanced plan selector or executor (simpler stack)",
      "On by default — no operator action required",
    ],
    cons: [
      "Uses pattern detection, not the full evidence-based plan selector",
      "Best tuned for FastAPI-style layouts; other frameworks rely more on the route registry long-term",
      "Rare misclassification could over-boost API-related files",
    ],
    recommendation: "Keep enabled unless you have a documented regression.",
  },
  "chat.route_registry_enabled": {
    whenEnable:
      "Normal operation after indexing completes. Required for fast registry lookups when the plan selector is on.",
    whenDisable:
      "Suspected stale route registry, extractor debugging, or forcing graph-reconstruct only.",
    pros: [
      "Fast, deterministic route lookup at query time",
      "Foundation for structured route answers",
      "Can be turned off without disabling all structural retrieval",
    ],
    cons: [
      "Quality depends on index-time route extraction (coverage and drift)",
      "Stale until you re-index after route changes",
      "Limited benefit while the plan selector stays off",
    ],
    recommendation: "Keep enabled; re-index if lookup quality is poor.",
  },
  "chat.plan_selector_enabled": {
    whenEnable:
      "Staging or pilot when you want evidence-based routing instead of pattern detection alone — after you have verified behavior on your hardware.",
    whenDisable:
      "Selector regression, before hardware verification, or rollback to the simpler api_surface path only.",
    pros: [
      "Repository signals drive routing — not regex alone",
      "New structural plans via YAML instead of new server code",
      "Enables registry lookup when paired with knowledge_object_lookup",
    ],
    cons: [
      "More moving parts; weak signals fall back to generic search",
      "Chat may still use the simpler api_surface path until fully migrated",
      "Works best with a healthy route registry and code graph",
    ],
    recommendation: "Pilot on staging first; confirm route-wiring answers before production.",
  },
  "chat.knowledge_object_lookup_enabled": {
    whenEnable:
      "Together with plan_selector_enabled when registry lookup quality is good on your workspace.",
    whenDisable:
      "Renderer issues, wrong agreement banners, or preferring narration from search chunks only.",
    pros: [
      "Deterministic route facts — fewer invented handler names",
      "Faster and cheaper than full graph reconstruct plus LLM",
      "Answers cite registry facts instead of guessing structure",
    ],
    cons: [
      "Only helps when the registry has a hit for the question",
      "Little benefit if registry quality is weak",
      "Renderer must stay aligned with Context Lens in the extension",
    ],
    recommendation: "Enable with plan_selector after registry quality looks solid.",
  },
  "chat.plan_executor_enabled": {
    whenEnable:
      "After plan selector and route registry prove value — when you need declarative graph walks for reconstruct answers.",
    whenDisable:
      "Reconstruct is unstable, registry hit rate is low, or you are not ready for the advanced stack.",
    pros: [
      "Declarative api_registration_chain plan in YAML",
      "Replaces legacy registration-chain logic over time",
      "Complexity capped (operations, depth, time)",
    ],
    cons: [
      "Graph reconstruct at query time — slower than registry lookup",
      "Heavy reconstruct use may signal registry gaps",
      "Enable only after selector and registry prove value",
    ],
    recommendation: "Enable last among structural flags, one layer at a time.",
  },
  "chat.intent_classifier_enabled": {
    whenEnable:
      "With plan_selector on, when paraphrased questions miss routing (e.g. “how do I enter the system?”) and fall back to generic search.",
    whenDisable:
      "Debugging the selector, before the selector is on, or too many false structural hints.",
    pros: [
      "Catches paraphrases when keyword probes miss",
      "Adds candidates only — never removes existing probe hits",
      "Regex fast path in v1 — no ML model required",
    ],
    cons: [
      "Small gain when registry and probes already work",
      "Bad rules could weakly boost reconstruct paths",
      "ML model path reserved for a future release",
    ],
    recommendation: "Optional polish after plan_selector; not required for basic route-wiring answers.",
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
      "Architecture or “how does this repo work?” prompts need more entry-point file snippets.",
    whenDisable:
      "Overview answers already cite main.py, api.py, and the extension — reduce grep competition.",
    pros: ["Boosts entry-point anchors for high-level architecture questions"],
    cons: ["More grep slots on a query type sensitive to noise"],
    recommendation: "Leave default unless entry paths are missing from overview answers.",
  },
  "contextmint.chat.canonicalOverviewGrepHeadLines": {
    whenEnable: "Entry files lack keyword overlap — need more head lines from main.py, api.py, etc.",
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
      api_surface: true,
      route_registry: true,
      plan_selector: false,
      knowledge_lookup: false,
      plan_executor: false,
      intent_classifier: false,
    },
  },
  {
    name: "Staging — try plan selector",
    flags: {
      api_surface: true,
      route_registry: true,
      plan_selector: true,
      knowledge_lookup: true,
      plan_executor: false,
      intent_classifier: false,
    },
  },
  {
    name: "Staging — full advanced stack",
    flags: {
      api_surface: true,
      route_registry: true,
      plan_selector: true,
      knowledge_lookup: true,
      plan_executor: true,
      intent_classifier: "optional",
    },
  },
  {
    name: "Emergency rollback",
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
  "api_surface_enabled works on its own — this is the default production path for route-wiring questions.",
  "plan_selector_enabled expects a healthy route registry; keep route_registry_enabled on.",
  "knowledge_object_lookup_enabled requires plan_selector_enabled and registry hits.",
  "plan_executor_enabled is for graph reconstruct answers; enable after selector and registry prove value.",
  "intent_classifier_enabled only expands plan selector candidates; enable after plan_selector.",
];

export const EXTENSION_RETRIEVAL_GUIDE = {
  id: "extension-retrieval",
  title: "Retrieval & context assembly (extension)",
  summary:
    "These VS Code settings control what the extension adds before the API assembles context. They complement — but do not replace — server-side structural flags below. High-level architecture answers are mostly shaped on the server; local grep can still add noise if left wide open after indexing finishes.",
  serverLinkAnchor: "#settings-server-structural-query-planning",
  tips: [
    "For “how does this repo work?” questions, keep client grep reasonable and let indexing finish first.",
    "For “how is this route registered?” questions, server structural flags matter more than extension grep.",
    "If answers cite the wrong files, lower clientGrepMaxSnippets or enable clientGrepIndexingOnly.",
  ],
};

export const SERVER_VERIFY_TIPS = [
  "Ask how an API route is wired — the answer should trace handler → router file → application entry.",
  "After enabling plan selector, retry the same question and confirm sources match your codebase.",
  "If quality drops, disable the newest flag you turned on and re-index the workspace.",
  "Use Engine → observability or your metrics endpoint to watch structural query volume after changes.",
];
