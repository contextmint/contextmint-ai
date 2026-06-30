/** Hand-curated page keywords for Tier 2 site guide matching */
export const PAGE_KEYWORDS = [
  {
    page_url: "/getting-started.html",
    page_title: "Getting started",
    keywords: ["getting started", "first steps", "deploy"],
    page_summary:
      "ContextMint runs local-first: download ContextMint Engine (desktop), install the VS Code extension, and set up Ollama for on-machine inference. This page walks through prerequisites and first-run setup.",
  },
  {
    page_url: "/docs/installation.html",
    page_title: "Installation & setup",
    keywords: [
      "installation",
      "install engine",
      "install extension",
      "ollama",
      "wizard",
      "prerequisites",
      "vs code",
    ],
    page_summary:
      "Install ContextMint Engine, verify Ollama, add the VS Code extension, and confirm the API is healthy on localhost:8000. Covers the first-run wizard and common prerequisite checks.",
  },
  {
    page_url: "/docs/context-lens-packs.html",
    page_title: "Context Lens & packs",
    keywords: ["context lens", "packs", "preview", "gate", "@pack"],
    page_summary:
      "Context Lens is the pre-send evidence preview — retrieved chunks, routing, and governance notes before the model runs. Context packs (@pack) bundle per-repo knowledge for Work and Hybrid lanes.",
  },
  {
    page_url: "/docs/chat-and-lanes.html",
    page_title: "Chat & lanes",
    keywords: ["repo lane", "work lane", "hybrid", "chat lanes"],
    page_summary:
      "Three chat lanes scope where evidence comes from: Repo (indexed codebase), Work (planning and attachments without repo search), and Hybrid (repo evidence plus reasoned recommendations).",
  },
  {
    page_url: "/docs/byok-enterprise.html",
    page_title: "BYOK & enterprise deployment",
    keywords: [
      "byok",
      "enterprise deployment",
      "oidc",
      "shared enterprise",
      "helm deploy",
      "docker compose contextmint",
      "cloud dispatch",
    ],
    page_summary:
      "Step-by-step BYOK cloud routing (extension cloudEnabled, provider keys, server allow_cloud_dispatch) and shared enterprise API server deployment (auth.enabled, OIDC, per-developer serverUrl and enterpriseMode). Includes rollout checklists — not a raw key list.",
  },
  {
    page_url: "/docs/knowledge-and-governance.html",
    page_title: "Knowledge & governance",
    keywords: ["governance", "quality map", "findings", "findings store"],
    page_summary:
      "Index-time governance findings power the quality map and Findings Store. Chat can answer from stored signals (clones, near-duplicates, structure) instead of rediscovering issues at question time.",
  },
  {
    page_url: "/docs/image-evidence-argus.html",
    page_title: "Image evidence & ARGUS",
    keywords: ["image", "screenshot", "argus", "vision"],
    page_summary:
      "Paste PNG, JPEG, or WebP images in chat for local vision inference. ARGUS runs structured visual audits on UI screenshots with severity-tagged findings — report only, never auto-fixes.",
  },
  {
    page_url: "/docs/indexing-readiness.html",
    page_title: "Indexing & readiness",
    keywords: ["indexing", "readiness", "offline"],
    page_summary:
      "Readiness phases show indexing progress and server health. Chat is not blocked during background indexing — answers improve as more files finish indexing.",
  },
  {
    page_url: "/docs/settings.html",
    page_title: "Settings reference",
    keywords: [
      "settings reference",
      "settings catalog",
      "configuration reference",
      "all contextmint keys",
    ],
    page_summary:
      "Searchable catalogs for VS Code extension keys (contextmint.*) and API server keys (contextmint.defaults.yaml / ~/.contextmint/server.defaults.yaml). Two tabs: Server settings (EOP, retrieval, indexing, ARGUS, auth) and VS Code settings (chat, lanes, Context Lens, packs). For how-to and rollout, pair with BYOK & enterprise or Engine operator guides.",
  },
  {
    page_url: "/docs/engine-operator.html",
    page_title: "Engine operator guide",
    keywords: [
      "engine operator",
      "server tab engine",
      "engine server config",
      "operator guide",
    ],
    page_summary:
      "Operate ContextMint Engine: Start all, Server tab (port, restart, server config link), Ollama/Models, Indexing, Quality, Logs, and desktop Settings. Use this when changing server lifecycle or diagnostics on the machine running the API.",
  },
  {
    page_url: "/trust.html",
    page_title: "Trust & Security",
    keywords: ["trust", "security", "privacy", "deployment"],
    page_summary:
      "Default deployment is local-first: indexing, retrieval, and inference stay on your infrastructure. Optional BYOK cloud routing sends redacted context only to providers you choose; API keys stay in VS Code secrets.",
  },
  {
    page_url: "/pricing.html",
    page_title: "Early access",
    keywords: ["pricing", "waitlist", "design partner", "early access"],
    page_summary:
      "ContextMint is not publishing seat pricing until packaging is finalized. Join the early access waitlist or apply for a 30-day design partner pilot — intake may be paused during v1.0 readiness.",
  },
  {
    page_url: "/design-partners.html",
    page_title: "Design partners",
    keywords: ["design partner", "pilot", "30 day", "30-day"],
    page_summary:
      "The design partner program is a 30-day evaluation pilot for 10–30 developers on one repo, with weekly check-ins and a written summary for security stakeholders. Successful pilots can extend to 90 days.",
  },
  {
    page_url: "/features.html",
    page_title: "Features v1.0",
    keywords: ["features", "v1", "what ships", "v1.0"],
    page_summary:
      "Shipped v1.0 capabilities: Context Lens, Ask/Plan/Agent modes, Repo/Work/Hybrid lanes, quality map, image evidence, ARGUS, context packs, patch preview, and symbol-aware citations.",
  },
  {
    page_url: "/roadmap.html",
    page_title: "Roadmap",
    keywords: ["roadmap", "v2", "track b"],
    page_summary:
      "Planned capabilities beyond v1.0: v2.0 Engineering Intelligence Platform, Track B enterprise knowledge and compliance, and the long-term Verification Engine direction.",
  },
  {
    page_url: "/support/troubleshooting.html",
    page_title: "Troubleshooting",
    keywords: ["troubleshoot", "error", "fix", "offline", "troubleshooting"],
    page_summary:
      "Common install and runtime fixes: Engine not running, Ollama offline, indexing errors, extension connection to localhost:8000, and enterprise server URL configuration.",
  },
];
