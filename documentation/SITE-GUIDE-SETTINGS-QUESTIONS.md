# Site guide — settings & configuration questions

**Generated from** `scripts/site-guide-settings-questions.mjs` — do not edit by hand.  
**Purpose:** Complete catalog of questions the site guide can answer about settings (matcher keywords + doc links).  
**Not** a raw settings key list in the widget — each question maps to a narrative answer + links.

Run `npm run gen:site-guide` after editing the catalog.

---

## Enterprise & On-Prem (overview)

### On-prem extension + server setup

**Question:** How do I configure VS Code extension and server settings when the API is deployed on-prem?

**Matcher id:** `configure-on-prem-extension-server`

**Primary link:** [Enterprise on-prem setup](/docs/byok-enterprise.html#enterprise)

**Also see:** [Settings reference](/docs/settings.html) · [Engine operator guide](/docs/engine-operator.html) · [Trust & Security](/trust.html) · [FAQ — shared server on-prem](/faq.html#can-we-run-a-shared-contextmint-server-on-prem) · [Troubleshooting](/support/troubleshooting.html)

---

## Server & Backend Configuration

### Port settings

**Question:** How do I change the default port the ContextMint server listens on?

**Matcher id:** `settings-server-port`

**Primary link:** [Server settings — server.port](/docs/settings.html)

**Also see:** [Engine operator guide](/docs/engine-operator.html) · [Troubleshooting](/support/troubleshooting.html)

---

### Host address / bind

**Question:** How can I configure the server to bind to a specific IP address or localhost?

**Matcher id:** `settings-server-host-bind`

**Primary link:** [Server settings — server.host](/docs/settings.html)

**Also see:** [Engine operator guide](/docs/engine-operator.html) · [BYOK & enterprise deployment](/docs/byok-enterprise.html#enterprise)

---

### SSL / TLS setup

**Question:** What server settings are required to enable HTTPS or secure connections?

**Matcher id:** `settings-server-ssl-tls`

**Primary link:** [Enterprise deployment — HTTPS](/docs/byok-enterprise.html#enterprise)

**Also see:** [Trust & Security](/trust.html) · [Troubleshooting](/support/troubleshooting.html)

---

### Index storage (Chroma)

**Question:** How do I configure the backend storage or database connection for ContextMint?

**Matcher id:** `settings-server-storage-chroma`

**Primary link:** [Server settings — server.chroma_path](/docs/settings.html)

**Also see:** [Engine operator guide](/docs/engine-operator.html) · [Indexing & readiness](/docs/indexing-readiness.html)

---

### Server log level

**Question:** Where do I set the server log level to debug or error logging mode?

**Matcher id:** `settings-server-log-level`

**Primary link:** [Server settings — server.log_level](/docs/settings.html)

**Also see:** [Engine operator guide](/docs/engine-operator.html) · [Troubleshooting](/support/troubleshooting.html)

---

### Log rotation

**Question:** How do I configure the file path and max size for server logs?

**Matcher id:** `settings-server-log-rotation`

**Primary link:** [Server settings — engine.log_path](/docs/settings.html)

**Also see:** [Engine operator guide](/docs/engine-operator.html)

---

### CORS

**Question:** How can I update Cross-Origin Resource Sharing (CORS) rules for external API clients?

**Matcher id:** `settings-server-cors`

**Primary link:** [Trust — deployment models](/trust.html)

**Also see:** [BYOK & enterprise deployment](/docs/byok-enterprise.html#enterprise) · [Settings reference](/docs/settings.html)

---

### Server authentication (OIDC)

**Question:** How do I enable authentication on a shared team API server?

**Matcher id:** `settings-server-auth-oidc`

**Primary link:** [Enterprise server auth](/docs/byok-enterprise.html#enterprise)

**Also see:** [Settings reference](/docs/settings.html) · [Trust & Security](/trust.html)

---

## VS Code Extension Settings

### Extension setup

**Question:** How do I install and verify the ContextMint VS Code extension?

**Matcher id:** `settings-ext-install-verify`

**Primary link:** [Installation & setup](/docs/installation.html)

**Also see:** [Getting started](/getting-started.html) · [Troubleshooting](/support/troubleshooting.html)

---

### Server URL in VS Code

**Question:** Where do I input the server endpoint URL in the VS Code settings?

**Matcher id:** `settings-ext-server-url`

**Primary link:** [VS Code — contextmint.serverUrl](/docs/settings.html)

**Also see:** [BYOK & enterprise deployment](/docs/byok-enterprise.html#enterprise) · [Installation & setup](/docs/installation.html)

---

### Authentication in the editor

**Question:** How do I configure the authentication key or API token inside the editor?

**Matcher id:** `settings-ext-auth-token`

**Primary link:** [Enterprise auth & BYOK keys](/docs/byok-enterprise.html)

**Also see:** [Settings reference](/docs/settings.html) · [BYOK cloud routing](/docs/byok-enterprise.html#byok)

---

### Indexing when workspace opens

**Question:** Can I disable automatic background indexing when a new workspace opens?

**Matcher id:** `settings-ext-auto-index-workspace`

**Primary link:** [Indexing & readiness](/docs/indexing-readiness.html)

**Also see:** [Engine operator guide](/docs/engine-operator.html) · [Settings reference](/docs/settings.html)

---

### Excluded files & directories

**Question:** How do I exclude specific files or directories from being processed by the extension?

**Matcher id:** `settings-ext-excluded-patterns`

**Primary link:** [Server indexing settings](/docs/settings.html)

**Also see:** [Indexing & readiness](/docs/indexing-readiness.html) · [Troubleshooting](/support/troubleshooting.html)

---

### Chat pane placement

**Question:** Are there options to change the appearance or placement of the ContextMint chat pane in the IDE?

**Matcher id:** `settings-ext-chat-placement-ui`

**Primary link:** [VS Code — chat.placement](/docs/settings.html)

**Also see:** [Chat & lanes](/docs/chat-and-lanes.html)

---

### Telemetry sample rates

**Question:** How do I toggle usage data sharing and telemetry preferences inside VS Code?

**Matcher id:** `settings-ext-telemetry-sample-rates`

**Primary link:** [Server telemetry settings](/docs/settings.html)

**Also see:** [Trust & Security](/trust.html)

---

### BYOK cloud routing

**Question:** How do I enable or disable cloud LLM routing from the extension?

**Matcher id:** `settings-ext-cloud-byok`

**Primary link:** [BYOK configuration](/docs/byok-enterprise.html#byok)

**Also see:** [Settings reference](/docs/settings.html) · [Trust & Security](/trust.html)

---

## Project Indexing & Context Rules

### Max file size

**Question:** What setting controls the maximum file size that ContextMint is allowed to index?

**Matcher id:** `settings-index-max-file-size`

**Primary link:** [Server — indexing.max_file_size_mb](/docs/settings.html)

**Also see:** [Indexing & readiness](/docs/indexing-readiness.html) · [Engine operator guide](/docs/engine-operator.html)

---

### Token / context budget limits

**Question:** How do I adjust the maximum token limit allocations for local files?

**Matcher id:** `settings-index-token-limits`

**Primary link:** [Context budget calculator](/docs/context-budget-calculator.html)

**Also see:** [Settings reference](/docs/settings.html) · [Context budget calculator](/docs/context-budget-calculator.html)

---

### Ignored formats & extensions

**Question:** How do I configure the tool to ignore binary files, build artifacts, or image formats?

**Matcher id:** `settings-index-ignored-formats`

**Primary link:** [Server indexing settings](/docs/settings.html)

**Also see:** [Indexing & readiness](/docs/indexing-readiness.html)

---

### Configuration hierarchy

**Question:** Does a project-level configuration file override the global VS Code settings?

**Matcher id:** `settings-index-config-hierarchy`

**Primary link:** [Context Lens & packs](/docs/context-lens-packs.html)

**Also see:** [Settings reference](/docs/settings.html) · [Context Lens & packs](/docs/context-lens-packs.html)

---

### Project context packs

**Question:** Where do I configure project-level context instructions like custom system prompts?

**Matcher id:** `settings-index-context-packs-prompts`

**Primary link:** [Context Lens & packs](/docs/context-lens-packs.html)

**Also see:** [Chat & lanes](/docs/chat-and-lanes.html) · [Context Lens & packs](/docs/context-lens-packs.html)

---

### Indexed file extensions

**Question:** How do I control which file extensions are indexed?

**Matcher id:** `settings-index-code-extensions`

**Primary link:** [Server — indexing.code_extensions](/docs/settings.html)

**Also see:** [Indexing & readiness](/docs/indexing-readiness.html)

---

## Usage, Validation & Troubleshooting

### Verify setup

**Question:** Is there a command or test setting to validate the connection between VS Code and the server?

**Matcher id:** `settings-usage-verify-connection`

**Primary link:** [Troubleshooting — server offline](/support/troubleshooting.html)

**Also see:** [Engine operator guide](/docs/engine-operator.html) · [Installation & setup](/docs/installation.html)

---

### Reset configuration

**Question:** How do I restore both server and VS Code configurations back to factory defaults?

**Matcher id:** `settings-usage-reset-config`

**Primary link:** [Engine operator guide](/docs/engine-operator.html)

**Also see:** [Settings reference](/docs/settings.html) · [Troubleshooting](/support/troubleshooting.html)

---

### Connection errors

**Question:** What settings should I check if VS Code says the ContextMint server is unreachable?

**Matcher id:** `settings-usage-connection-errors`

**Primary link:** [Troubleshooting](/support/troubleshooting.html)

**Also see:** [FAQ — server offline](/faq.html#why-is-chat-blocked-or-showing-server-offline) · [BYOK & enterprise deployment](/docs/byok-enterprise.html#enterprise)

---

### Force re-index

**Question:** How do I force the extension to flush cached context and completely re-index a workspace?

**Matcher id:** `settings-usage-reindex`

**Primary link:** [Engine — Indexing tab](/docs/engine-operator.html)

**Also see:** [Troubleshooting](/support/troubleshooting.html) · [Indexing & readiness](/docs/indexing-readiness.html)

---

### Context Lens & gates

**Question:** Where do I configure human approval before the model runs?

**Matcher id:** `settings-usage-context-lens-gates`

**Primary link:** [Context Lens & packs](/docs/context-lens-packs.html)

**Also see:** [Patches & governance](/docs/patches-governance.html)

---

### Chat lanes & modes

**Question:** How do I configure Repo, Work, and Hybrid lanes or Ask/Plan/Agent modes?

**Matcher id:** `settings-usage-lanes-modes`

**Primary link:** [Chat & lanes](/docs/chat-and-lanes.html)

**Also see:** [Settings reference](/docs/settings.html) · [Chat & lanes](/docs/chat-and-lanes.html)

---


**Total questions:** 29
