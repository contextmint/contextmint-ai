/**
 * Complete settings & configuration question catalog for site guide.
 * Source of truth for SETTINGS_CONTEXT (matcher) and SITE-GUIDE-SETTINGS-QUESTIONS.md.
 * Answers are narrative + links — not a raw key dump in the widget.
 */

const SETTINGS_LINKS = {
  settings: { label: "Settings reference", url: "/docs/settings.html" },
  engine: { label: "Engine operator guide", url: "/docs/engine-operator.html" },
  enterprise: {
    label: "BYOK & enterprise deployment",
    url: "/docs/byok-enterprise.html#enterprise",
  },
  byok: { label: "BYOK cloud routing", url: "/docs/byok-enterprise.html#byok" },
  install: { label: "Installation & setup", url: "/docs/installation.html" },
  gettingStarted: { label: "Getting started", url: "/getting-started.html" },
  troubleshooting: {
    label: "Troubleshooting",
    url: "/support/troubleshooting.html",
  },
  trust: { label: "Trust & Security", url: "/trust.html" },
  contextBudget: {
    label: "Context budget calculator",
    url: "/docs/context-budget-calculator.html",
  },
  packs: {
    label: "Context Lens & packs",
    url: "/docs/context-lens-packs.html",
  },
  indexing: {
    label: "Indexing & readiness",
    url: "/docs/indexing-readiness.html",
  },
  lanes: { label: "Chat & lanes", url: "/docs/chat-and-lanes.html" },
};

/** Distinctive phrases only — avoids bare "server" / "settings" false positives. */
function kw(question, extra = []) {
  const phrase = question
    .toLowerCase()
    .replace(/[?.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return [...new Set([phrase, ...extra])];
}

/**
 * @typedef {{ id: string, title: string, question: string, keywords: string[], direct_answer: string, primary_label: string, primary_url: string, related_links?: Array<{label:string,url:string}> }} SettingsQuestion
 * @typedef {{ category: string, questions: SettingsQuestion[] }} SettingsCategory
 */

/** @type {SettingsCategory[]} */
export const SETTINGS_QUESTION_CATALOG = [
  {
    category: "Server & Backend Configuration",
    questions: [
      {
        id: "settings-server-port",
        title: "Port settings",
        question:
          "How do I change the default port the ContextMint server listens on?",
        keywords: kw(
          "How do I change the default port the ContextMint server listens on?",
          ["server port", "port 8000", "change port", "listen on port", "server.port"]
        ),
        direct_answer:
          "The API HTTP port is the server.port key in contextmint.defaults.yaml (default 8000), overridden in ~/.contextmint/server.defaults.yaml or via environment. Edit in Engine → Server config on desktop installs, or your container/Helm values for team servers, then restart the API.\n\n" +
          "After changing the port, point contextmint.serverUrl in VS Code at the new base URL (e.g. http://127.0.0.1:9000). Verify with GET /api/health on the new port.",
        primary_label: "Server settings — server.port",
        primary_url: "/docs/settings.html",
        related_links: [
          SETTINGS_LINKS.engine,
          SETTINGS_LINKS.troubleshooting,
        ],
      },
      {
        id: "settings-server-host-bind",
        title: "Host address / bind",
        question:
          "How can I configure the server to bind to a specific IP address or localhost?",
        keywords: kw(
          "How can I configure the server to bind to a specific IP address or localhost?",
          [
            "bind address",
            "server.host",
            "localhost only",
            "0.0.0.0",
            "loopback",
            "bind to ip",
          ]
        ),
        direct_answer:
          "Use server.host in the API server YAML overlay (default 0.0.0.0). For local-first Engine installs, loopback-only binding is typical; enterprise Docker/Kubernetes charts set bind address in the deployment manifest.\n\n" +
          "Developers still connect via contextmint.serverUrl — use http://127.0.0.1:8000 for local Engine or your team HTTPS URL for shared servers. Restart the API after changing server.host.",
        primary_label: "Server settings — server.host",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.engine, SETTINGS_LINKS.enterprise],
      },
      {
        id: "settings-server-ssl-tls",
        title: "SSL / TLS setup",
        question:
          "What server settings are required to enable HTTPS or secure connections?",
        keywords: kw(
          "What server settings are required to enable HTTPS or secure connections?",
          ["ssl", "tls", "https", "secure connection", "certificate"]
        ),
        direct_answer:
          "ContextMint does not expose a single “enable SSL” toggle in the Python YAML catalog. Local-first Engine uses HTTP on loopback (127.0.0.1). For team deployments, terminate TLS at your reverse proxy, ingress controller, or load balancer in front of the API — then set contextmint.serverUrl to the https:// team base URL and ensure enterpriseMode + OIDC if auth is enabled.\n\n" +
          "Validate certificates and trust store on each developer machine; see Trust → Deployment models and the enterprise rollout checklist.",
        primary_label: "Enterprise deployment — HTTPS",
        primary_url: "/docs/byok-enterprise.html#enterprise",
        related_links: [SETTINGS_LINKS.trust, SETTINGS_LINKS.troubleshooting],
      },
      {
        id: "settings-server-storage-chroma",
        title: "Index storage (Chroma)",
        question:
          "How do I configure the backend storage or database connection for ContextMint?",
        keywords: kw(
          "How do I configure the backend storage or database connection for ContextMint?",
          [
            "database connection",
            "storage path",
            "chroma",
            "index database",
            "chroma_path",
            "backend storage",
          ]
        ),
        direct_answer:
          "ContextMint stores embeddings and index metadata in ChromaDB — not a generic SQL connection string. Set server.chroma_path in server YAML (default under ~/.contextmint/index_db) to the absolute path on the API host. Keep index data outside customer repos.\n\n" +
          "For shared servers, mount persistent volume at that path in Docker/Helm. Changing chroma_path or embed models may require a full reindex — back up first.",
        primary_label: "Server settings — server.chroma_path",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.engine, SETTINGS_LINKS.indexing],
      },
      {
        id: "settings-server-log-level",
        title: "Server log level",
        question:
          "Where do I set the server log level to debug or error logging mode?",
        keywords: kw(
          "Where do I set the server log level to debug or error logging mode?",
          ["server log level", "debug logging", "error logging", "server.log_level"]
        ),
        direct_answer:
          "Set server.log_level in contextmint.defaults.yaml or ~/.contextmint/server.defaults.yaml (e.g. DEBUG, INFO, WARNING). Restart the API after changes. Tail live output in Engine → Logs on desktop installs.\n\n" +
          "Extension-side verbosity uses contextmint.logLevel in VS Code — it controls extension diagnostics, not Python server logs.",
        primary_label: "Server settings — server.log_level",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.engine, SETTINGS_LINKS.troubleshooting],
      },
      {
        id: "settings-server-log-rotation",
        title: "Log rotation",
        question:
          "How do I configure the file path and max size for server logs?",
        keywords: kw(
          "How do I configure the file path and max size for server logs?",
          [
            "log rotation",
            "log path",
            "log file",
            "engine.log_path",
            "log_rotate",
          ]
        ),
        direct_answer:
          "Engine operator keys include engine.log_path, engine.log_rotate_interval_hours, and engine.log_rotate_suffix_format in the server settings catalog. Set them in the server YAML overlay or Engine-managed server config on the API host.\n\n" +
          "Use Engine → Logs for interactive tailing; file rotation settings apply to persisted operator logs on disk.",
        primary_label: "Server settings — engine.log_path",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.engine],
      },
      {
        id: "settings-server-cors",
        title: "CORS",
        question:
          "How can I update Cross-Origin Resource Sharing (CORS) rules for external API clients?",
        keywords: kw(
          "How can I update Cross-Origin Resource Sharing (CORS) rules for external API clients?",
          ["cors", "cross-origin", "external api client", "browser client"]
        ),
        direct_answer:
          "ContextMint’s supported clients are the VS Code extension and Engine — not arbitrary browser apps. CORS is not an operator-tunable field in the published settings catalog.\n\n" +
          "If you must expose the API beyond VS Code, put an API gateway or reverse proxy in front of the team server and configure CORS there, following your security review. Default architecture keeps the API on private infrastructure with OIDC for enterprise mode.",
        primary_label: "Trust — deployment models",
        primary_url: "/trust.html",
        related_links: [SETTINGS_LINKS.enterprise, SETTINGS_LINKS.settings],
      },
      {
        id: "settings-server-auth-oidc",
        title: "Server authentication (OIDC)",
        question:
          "How do I enable authentication on a shared team API server?",
        keywords: kw(
          "How do I enable authentication on a shared team API server?",
          [
            "auth.enabled",
            "oidc",
            "jwt",
            "bearer auth",
            "team server auth",
          ]
        ),
        direct_answer:
          "On the API host set auth.enabled: true, auth.mode: oidc, and configure issuer/audience in server YAML. Store JWT secrets in host .env only (AUTH__JWT_SECRET) — never commit secrets to git. Restart the API.\n\n" +
          "Each developer enables contextmint.enterpriseMode, sets contextmint.serverUrl to the team HTTPS URL, and signs in via VS Code authentication. See the enterprise deployment guide for the full checklist.",
        primary_label: "Enterprise server auth",
        primary_url: "/docs/byok-enterprise.html#enterprise",
        related_links: [SETTINGS_LINKS.settings, SETTINGS_LINKS.trust],
      },
    ],
  },
  {
    category: "VS Code Extension Settings",
    questions: [
      {
        id: "settings-ext-install-verify",
        title: "Extension setup",
        question:
          "How do I install and verify the ContextMint VS Code extension?",
        keywords: kw(
          "How do I install and verify the ContextMint VS Code extension?",
          [
            "install extension",
            "verify extension",
            "vscode extension install",
            "vs code extension",
          ]
        ),
        direct_answer:
          "Install ContextMint Engine (desktop) and the ContextMint VS Code extension from your release channel. Run Engine → Start all, confirm http://localhost:8000/api/health returns OK, then open the ContextMint chat view in VS Code.\n\n" +
          "The readiness card should show server connected and indexing progress. If not, see Installation & setup and Troubleshooting → Server offline.",
        primary_label: "Installation & setup",
        primary_url: "/docs/installation.html",
        related_links: [
          SETTINGS_LINKS.gettingStarted,
          SETTINGS_LINKS.troubleshooting,
        ],
      },
      {
        id: "settings-ext-server-url",
        title: "Server URL in VS Code",
        question:
          "Where do I input the server endpoint URL in the VS Code settings?",
        keywords: kw(
          "Where do I input the server endpoint URL in the VS Code settings?",
          [
            "server endpoint",
            "server url",
            "contextmint.serverurl",
            "input server url",
            "api url vscode",
          ]
        ),
        direct_answer:
          "Set contextmint.serverUrl in VS Code Settings (search “contextmint”) or in settings.json. Local-first default is http://127.0.0.1:8000. Enterprise/shared servers use your team https:// base URL.\n\n" +
          "Optional contextmint.engine.dashboardUrl points at the Engine operator console (default http://localhost:8765). Changes apply on the next health probe / chat send.",
        primary_label: "VS Code — contextmint.serverUrl",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.enterprise, SETTINGS_LINKS.install],
      },
      {
        id: "settings-ext-auth-token",
        title: "Authentication in the editor",
        question:
          "How do I configure the authentication key or API token inside the editor?",
        keywords: kw(
          "How do I configure the authentication key or API token inside the editor?",
          [
            "auth token",
            "api token",
            "authentication key",
            "configureauthtoken",
            "bearer token",
            "oidc sign in",
          ]
        ),
        direct_answer:
          "Two paths: (1) Enterprise team server — set contextmint.enterpriseMode true, contextmint.oidcProviderId for your IdP, and sign in via VS Code authentication (OIDC JWT sent as Bearer). (2) BYOK cloud — run command ContextMint: Configure Cloud API Key; keys live in OS keychain, never on the server.\n\n" +
          "There is no shared static API token for local loopback installs. Command palette also lists contextmint.configureAuthToken for legacy/token flows documented in settings reference.",
        primary_label: "Enterprise auth & BYOK keys",
        primary_url: "/docs/byok-enterprise.html",
        related_links: [SETTINGS_LINKS.settings, SETTINGS_LINKS.byok],
      },
      {
        id: "settings-ext-auto-index-workspace",
        title: "Indexing when workspace opens",
        question:
          "Can I disable automatic background indexing when a new workspace opens?",
        keywords: kw(
          "Can I disable automatic background indexing when a new workspace opens?",
          [
            "automatic indexing",
            "auto index",
            "background indexing",
            "workspace opens",
            "disable indexing",
          ]
        ),
        direct_answer:
          "Indexing starts when a workspace is registered with Engine — there is no single “auto-index off” extension toggle. Chat remains usable while indexing progresses; answers improve as files finish.\n\n" +
          "You can reduce background load: pause inline completion during indexing (contextmint.inline.pauseWhileIndexing), exclude heavy paths via server indexing settings, and avoid full reindex triggers during bulk file operations. See Indexing & readiness.",
        primary_label: "Indexing & readiness",
        primary_url: "/docs/indexing-readiness.html",
        related_links: [SETTINGS_LINKS.engine, SETTINGS_LINKS.settings],
      },
      {
        id: "settings-ext-excluded-patterns",
        title: "Excluded files & directories",
        question:
          "How do I exclude specific files or directories from being processed by the extension?",
        keywords: kw(
          "How do I exclude specific files or directories from being processed by the extension?",
          [
            "exclude files",
            "exclude directories",
            "ignore patterns",
            "node_modules",
            "excluded patterns",
            "skip indexing",
          ]
        ),
        direct_answer:
          "Indexing honors server-side indexing.code_extensions and file-size limits (indexing.max_file_size_mb). Exclude build artifacts and dependencies using standard repo ignore conventions and operator tuning in server YAML.\n\n" +
          "Client-side workspace grep (contextmint.chat.clientGrep*) can be limited or set to indexing-only so post-index sends do not grep node_modules. Canonical overview grep exclude patterns are server tunables. See Troubleshooting → Indexing errors.",
        primary_label: "Server indexing settings",
        primary_url: "/docs/settings.html",
        related_links: [
          SETTINGS_LINKS.indexing,
          SETTINGS_LINKS.troubleshooting,
        ],
      },
      {
        id: "settings-ext-chat-placement-ui",
        title: "Chat pane placement",
        question:
          "Are there options to change the appearance or placement of the ContextMint chat pane in the IDE?",
        keywords: kw(
          "Are there options to change the appearance or placement of the ContextMint chat pane in the IDE?",
          [
            "chat pane",
            "chat placement",
            "appearance",
            "sidebar",
            "contextmint.chat.placement",
            "ui placement",
          ]
        ),
        direct_answer:
          "Set contextmint.chat.placement in VS Code Settings to choose where the ContextMint chat view opens (sidebar vs panel options per extension schema). Related keys control reasoning trace height, dual-layer answers, and governance trust chips under the Chat section of the settings reference.\n\n" +
          "ContextMint does not ship a full IDE theme skin — it follows your VS Code theme.",
        primary_label: "VS Code — chat.placement",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.lanes],
      },
      {
        id: "settings-ext-telemetry-sample-rates",
        title: "Telemetry sample rates",
        question:
          "How do I toggle usage data sharing and telemetry preferences inside VS Code?",
        keywords: kw(
          "How do I toggle usage data sharing and telemetry preferences inside VS Code?",
          [
            "telemetry",
            "usage data",
            "sample rate",
            "analytics",
            "tracking",
          ]
        ),
        direct_answer:
          "ContextMint does not upload your codebase to a vendor analytics cloud. Server-side telemetry.* keys in YAML control sampling rates for operator diagnostics (retrieval latency, structural queries, etc.) on the API host — adjust in server overlay for pilots.\n\n" +
          "VS Code’s own telemetry settings are separate from ContextMint. Audit-friendly routing badges and Context Receipts are local/operator-controlled exports, not third-party product analytics.",
        primary_label: "Server telemetry settings",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.trust],
      },
      {
        id: "settings-ext-cloud-byok",
        title: "BYOK cloud routing",
        question:
          "How do I enable or disable cloud LLM routing from the extension?",
        keywords: kw(
          "How do I enable or disable cloud LLM routing from the extension?",
          [
            "cloudenabled",
            "byok",
            "cloud routing",
            "openai key",
            "configure cloud",
          ]
        ),
        direct_answer:
          "Off by default. Each developer sets contextmint.cloudEnabled true, runs ContextMint: Configure Cloud API Key, and selects Cloud or Auto in the compose model picker. Platform operators can block cloud at the server with allow_cloud_dispatch false.\n\n" +
          "Assembled context is redacted before any provider call; keys stay in VS Code secrets.",
        primary_label: "BYOK configuration",
        primary_url: "/docs/byok-enterprise.html#byok",
        related_links: [SETTINGS_LINKS.settings, SETTINGS_LINKS.trust],
      },
    ],
  },
  {
    category: "Project Indexing & Context Rules",
    questions: [
      {
        id: "settings-index-max-file-size",
        title: "Max file size",
        question:
          "What setting controls the maximum file size that ContextMint is allowed to index?",
        keywords: kw(
          "What setting controls the maximum file size that ContextMint is allowed to index?",
          [
            "max file size",
            "maximum file size",
            "indexing.max_file_size",
            "file too large",
          ]
        ),
        direct_answer:
          "Set indexing.max_file_size_mb in server YAML (contextmint.defaults.yaml or ~/.contextmint/server.defaults.yaml). Files above the limit are skipped during indexing. Restart the API after changes.\n\n" +
          "If large files are excluded unexpectedly, raise the limit cautiously and monitor disk use under server.chroma_path.",
        primary_label: "Server — indexing.max_file_size_mb",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.indexing, SETTINGS_LINKS.engine],
      },
      {
        id: "settings-index-token-limits",
        title: "Token / context budget limits",
        question:
          "How do I adjust the maximum token limit allocations for local files?",
        keywords: kw(
          "How do I adjust the maximum token limit allocations for local files?",
          [
            "token limit",
            "max tokens",
            "context budget",
            "max_context_tokens",
            "generation budget",
          ]
        ),
        direct_answer:
          "Server chat.context_budget.* keys cap evidence shipped to the model (max_context_tokens, tier caps, intent ratios). Tune via Engine Context budget UI or server YAML overlay; use the Context budget calculator doc to preview slot sizes.\n\n" +
          "Extension keys (history send limits, etc.) are under contextmint.chat.* in VS Code — they complement but do not replace server assembly ceilings.",
        primary_label: "Context budget calculator",
        primary_url: "/docs/context-budget-calculator.html",
        related_links: [SETTINGS_LINKS.settings, SETTINGS_LINKS.contextBudget],
      },
      {
        id: "settings-index-ignored-formats",
        title: "Ignored formats & extensions",
        question:
          "How do I configure the tool to ignore binary files, build artifacts, or image formats?",
        keywords: kw(
          "How do I configure the tool to ignore binary files, build artifacts, or image formats?",
          [
            "ignore binary",
            "build artifacts",
            "ignored formats",
            "code_extensions",
            "image formats index",
          ]
        ),
        direct_answer:
          "Indexing uses indexing.code_extensions and size limits to decide what to chunk. Binary assets and build outputs should stay out of the repo or in standard ignore paths; operators can tighten extension lists in server YAML.\n\n" +
          "Images are not indexed as repo chunks — they are attached at chat time (image evidence lane) with separate size/count limits under contextmint.chat.image* extension settings.",
        primary_label: "Server indexing settings",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.indexing],
      },
      {
        id: "settings-index-config-hierarchy",
        title: "Configuration hierarchy",
        question:
          "Does a project-level configuration file override the global VS Code settings?",
        keywords: kw(
          "Does a project-level configuration file override the global VS Code settings?",
          [
            "project level",
            "override global",
            "workspace settings",
            "hierarchy",
            "manifest.yaml",
            "contextmint folder",
          ]
        ),
        direct_answer:
          "VS Code workspace settings.json overrides user settings for contextmint.* keys in that repo. Server behavior is governed by API host YAML (~/.contextmint/server.defaults.yaml) — shared across workspaces on that server.\n\n" +
          "Per-repo context packs (.contextmint/manifest.yaml and markdown) add knowledge for Work/Hybrid lanes but do not replace server indexing. Enterprise serverUrl points all workspaces at the same team API unless overridden per workspace.",
        primary_label: "Context Lens & packs",
        primary_url: "/docs/context-lens-packs.html",
        related_links: [SETTINGS_LINKS.settings, SETTINGS_LINKS.packs],
      },
      {
        id: "settings-index-context-packs-prompts",
        title: "Project context packs",
        question:
          "Where do I configure project-level context instructions like custom system prompts?",
        keywords: kw(
          "Where do I configure project-level context instructions like custom system prompts?",
          [
            "custom prompts",
            "system prompt",
            "context instructions",
            "context pack",
            "@pack",
            "manifest.yaml",
          ]
        ),
        direct_answer:
          "Use context packs: manifest.yaml plus markdown under .contextmint/packs/ in the repo. Activate with @pack:name in chat compose; packs appear in Context Lens before send.\n\n" +
          "ContextMint is evidence-first — packs add curated repo knowledge, not unconstrained hidden system prompts. Conventions and pack panel sync are extension features documented under Context Lens & packs.",
        primary_label: "Context Lens & packs",
        primary_url: "/docs/context-lens-packs.html",
        related_links: [SETTINGS_LINKS.lanes, SETTINGS_LINKS.packs],
      },
      {
        id: "settings-index-code-extensions",
        title: "Indexed file extensions",
        question: "How do I control which file extensions are indexed?",
        keywords: kw("How do I control which file extensions are indexed?", [
          "file extensions indexed",
          "indexing.code_extensions",
          "code extensions",
          "which files indexed",
        ]),
        direct_answer:
          "Set indexing.code_extensions in server YAML to the allow-list of extensions the indexer processes. Restart the API and plan for reindex if you narrow the list.\n\n" +
          "Pair with max_file_size_mb and repo ignore hygiene so node_modules and build output are not scanned.",
        primary_label: "Server — indexing.code_extensions",
        primary_url: "/docs/settings.html",
        related_links: [SETTINGS_LINKS.indexing],
      },
    ],
  },
  {
    category: "Usage, Validation & Troubleshooting",
    questions: [
      {
        id: "settings-usage-verify-connection",
        title: "Verify setup",
        question:
          "Is there a command or test setting to validate the connection between VS Code and the server?",
        keywords: kw(
          "Is there a command or test setting to validate the connection between VS Code and the server?",
          [
            "validate connection",
            "verify setup",
            "test connection",
            "health check",
            "api/health",
          ]
        ),
        direct_answer:
          "Open the ContextMint readiness card in VS Code — it probes /api/health and index status on contextmint.serverUrl. Manually visit http://localhost:8000/api/health (or your team URL) in a browser or curl.\n\n" +
          "Engine → Overview and Server tabs show the same health from the operator side. If health fails, see Troubleshooting → Server offline.",
        primary_label: "Troubleshooting — server offline",
        primary_url: "/support/troubleshooting.html",
        related_links: [SETTINGS_LINKS.engine, SETTINGS_LINKS.install],
      },
      {
        id: "settings-usage-reset-config",
        title: "Reset configuration",
        question:
          "How do I restore both server and VS Code configurations back to factory defaults?",
        keywords: kw(
          "How do I restore both server and VS Code configurations back to factory defaults?",
          [
            "factory defaults",
            "reset config",
            "restore defaults",
            "clear overlay",
          ]
        ),
        direct_answer:
          "Server: remove or rename ~/.contextmint/server.defaults.yaml (and host .env overrides) so only shipped contextmint.defaults.yaml applies — restart the API. Engine desktop prefs reset via Engine → Settings.\n\n" +
          "VS Code: remove contextmint.* entries from user/workspace settings.json or use Settings UI to reset per key. Cloud keys clear via OS keychain / Configure Cloud API Key. Index data under server.chroma_path is separate — delete only if you intend to full reindex.",
        primary_label: "Engine operator guide",
        primary_url: "/docs/engine-operator.html",
        related_links: [SETTINGS_LINKS.settings, SETTINGS_LINKS.troubleshooting],
      },
      {
        id: "settings-usage-connection-errors",
        title: "Connection errors",
        question:
          "What settings should I check if VS Code says the ContextMint server is unreachable?",
        keywords: kw(
          "What settings should I check if VS Code says the ContextMint server is unreachable?",
          [
            "server unreachable",
            "server offline",
            "cannot connect",
            "connection error",
            "unreachable",
          ]
        ),
        direct_answer:
          "Check contextmint.serverUrl matches a running API (Engine → Start all for local, or team HTTPS URL for enterprise). Increase contextmint.serverTimeoutMs on slow networks. Enterprise: verify contextmint.enterpriseMode, OIDC sign-in, and TLS.\n\n" +
          "Confirm firewall allows loopback or corporate HTTPS to the team host. FAQ covers server offline vs indexing banners.",
        primary_label: "Troubleshooting",
        primary_url: "/support/troubleshooting.html",
        related_links: [
          {
            label: "FAQ — server offline",
            url: "/faq.html#why-is-chat-blocked-or-showing-server-offline",
          },
          SETTINGS_LINKS.enterprise,
        ],
      },
      {
        id: "settings-usage-reindex",
        title: "Force re-index",
        question:
          "How do I force the extension to flush cached context and completely re-index a workspace?",
        keywords: kw(
          "How do I force the extension to flush cached context and completely re-index a workspace?",
          [
            "re-index",
            "reindex",
            "flush cache",
            "full reindex",
            "clear index",
          ]
        ),
        direct_answer:
          "Use Engine → Indexing: manual reindex / activate workspace for the repo. Changing embed models or chroma_path may require a full reindex — back up index data first.\n\n" +
          "Last resort: clear workspace index data under server.chroma_path (operator action) then reindex from Engine. Chat session history clears via New Chat in the extension; server evidence caches refresh on the next send.",
        primary_label: "Engine — Indexing tab",
        primary_url: "/docs/engine-operator.html",
        related_links: [
          SETTINGS_LINKS.troubleshooting,
          SETTINGS_LINKS.indexing,
        ],
      },
      {
        id: "settings-usage-context-lens-gates",
        title: "Context Lens & gates",
        question:
          "Where do I configure human approval before the model runs?",
        keywords: kw(
          "Where do I configure human approval before the model runs?",
          ["context lens", "human approval", "gate", "preview before send"]
        ),
        direct_answer:
          "Context Lens is gate 1 — preview evidence before inference. Patch preview is gate 2 before repo writes. Extension keys under Context Lens and governance sections control preview behavior; server keys govern retrieval assembly.\n\n" +
          "See Context Lens & packs and Patches & governance docs.",
        primary_label: "Context Lens & packs",
        primary_url: "/docs/context-lens-packs.html",
        related_links: [
          {
            label: "Patches & governance",
            url: "/docs/patches-governance.html",
          },
        ],
      },
      {
        id: "settings-usage-lanes-modes",
        title: "Chat lanes & modes",
        question:
          "How do I configure Repo, Work, and Hybrid lanes or Ask/Plan/Agent modes?",
        keywords: kw(
          "How do I configure Repo, Work, and Hybrid lanes or Ask/Plan/Agent modes?",
          [
            "repo lane",
            "work lane",
            "hybrid lane",
            "ask plan agent",
            "default context lane",
          ]
        ),
        direct_answer:
          "Lanes (Repo / Work / Hybrid) scope evidence sources; modes (Ask / Plan / Agent) scope autonomy. Defaults: contextmint.chat.defaultContextLane and compose UI selectors. Related keys include lane placeholders and lane suggest prompts in the settings reference Chat section.\n\n" +
          "Modes still require Context Lens and patch preview gates before inference and apply.",
        primary_label: "Chat & lanes",
        primary_url: "/docs/chat-and-lanes.html",
        related_links: [SETTINGS_LINKS.settings, SETTINGS_LINKS.lanes],
      },
    ],
  },
  {
    category: "Enterprise & On-Prem (overview)",
    questions: [
      {
        id: "configure-on-prem-extension-server",
        title: "On-prem extension + server setup",
        question:
          "How do I configure VS Code extension and server settings when the API is deployed on-prem?",
        keywords: [
          "extension & server settings",
          "extension and server settings",
          "configure extension",
          "configure vscode",
          "configure vs code",
          "vscode extension settings",
          "vs code extension settings",
          "api deployed on-prem",
          "deployed on-prem",
          "on-prem settings",
          "on prem settings",
          "enterprise server settings",
          "settings when api",
          "configure settings when",
          "remote server settings",
          "team server settings",
          "contextmint.serverurl",
          "contextmint.enterprisemode",
          "enterprise mode settings",
          "oidc settings",
        ],
        direct_answer:
          "For a shared on-prem API server, configuration is split between the platform team and each developer.\n\n" +
          "Platform team (API host): Deploy the API stack (Docker Compose or Helm). On the server, edit Engine → Server config, ~/.contextmint/server.defaults.yaml, or host .env — enable auth (auth.enabled, auth.mode oidc), configure OIDC issuer/audience, and keep JWT secrets in .env only. Set allow_cloud_dispatch only if policy allows BYOK cloud. Restart the API after server-side changes.\n\n" +
          "Each developer (VS Code): Set contextmint.serverUrl to your team HTTPS base URL. Set contextmint.enterpriseMode to true and contextmint.oidcProviderId for your IdP, then sign in when prompted. In enterprise mode the extension is a thin client — operator keys (serverUrl, enterpriseMode, oidcProviderId) live in VS Code Settings or settings.json; server tunables stay on the API host.\n\n" +
          "Path alignment is required: the server must read the same workspace paths being indexed (VS Code Remote SSH, a mounted monorepo, or a clone on the API host). A laptop-only clone cannot index through a remote serverUrl unless paths match.\n\n" +
          "Use the enterprise deployment guide for rollout checklists and key-by-key steps. The settings reference catalogs all extension (contextmint.*) and server (YAML) keys.",
        primary_label: "Enterprise on-prem setup",
        primary_url: "/docs/byok-enterprise.html#enterprise",
        related_links: [
          SETTINGS_LINKS.settings,
          SETTINGS_LINKS.engine,
          SETTINGS_LINKS.trust,
          {
            label: "FAQ — shared server on-prem",
            url: "/faq.html#can-we-run-a-shared-contextmint-server-on-prem",
          },
          SETTINGS_LINKS.troubleshooting,
        ],
      },
    ],
  },
];

/** Flat matcher entries — specific questions before overview blocks. */
export function flattenSettingsContext() {
  /** @type {SettingsQuestion[]} */
  const flat = [];
  for (const cat of SETTINGS_QUESTION_CATALOG) {
    for (const q of cat.questions) {
      flat.push(q);
    }
  }
  return flat;
}
