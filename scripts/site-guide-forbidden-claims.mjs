/**
 * Forbidden marketing claims for site guide copy (§11).
 * Used by test-site-guide-copy.mjs (SGC-009).
 */
export const FORBIDDEN_CLAIM_PATTERNS = [
  {
    id: "npm-install-package",
    pattern: /npm\s+install\s+@contextmint/i,
    reason: "Product installs via Engine + VS Code extension, not npm",
  },
  {
    id: "free-for-n-projects",
    pattern: /free\s+for\s+\d+\s+project/i,
    reason: "No published free-tier project limits",
  },
  {
    id: "pro-seat-pricing-gbp",
    pattern: /£\s*15\s*\/?\s*mo/i,
    reason: "No published £/mo Pro pricing",
  },
  {
    id: "pro-seat-pricing-usd",
    pattern: /\$\s*15\s*\/?\s*mo/i,
    reason: "No published $/mo Pro pricing",
  },
  {
    id: "code-uploaded-cloud",
    pattern: /code\s+is\s+uploaded\s+to\s+our\s+cloud/i,
    reason: "Default is local-first on user machine",
  },
  {
    id: "autonomous-commits",
    pattern: /writes?\s+and\s+commits?\s+code\s+autonomously/i,
    reason: "Human gates before inference and apply",
  },
  {
    id: "soc2-certified-today",
    pattern: /soc\s*2\s+certified\s+today/i,
    reason: "SOC 2 is roadmap evidence packaging, not certified today",
  },
  {
    id: "unlimited-chatgpt",
    pattern: /unlimited\s+chatgpt/i,
    reason: "Repo / Work / Hybrid lanes — not generic chat",
  },
  {
    id: "one-seat-claim",
    pattern: /one[\s-]?seat|cancel\s+(copilot|cursor)|without\s+(reopening|another)\s+(ai|copilot|cursor)|full\s+parity\s+(claimed|ready|ships)|zero[\s-]?reopen\s+(day|engineering)/i,
    reason: "One-seat / Full Parity claim waits for GATE-FULL-PARITY continuous dogfood PASS",
  },
  {
    id: "replace-copilot-cursor",
    pattern: /replaces?\s+(github\s+)?copilot|replaces?\s+cursor|copilot[\s-]?killer|cursor[\s-]?killer/i,
    reason: "Do not claim Copilot/Cursor replacement before GATE-FULL-PARITY",
  },
  {
    id: "agent-mode-complete",
    pattern: /agent\s+mode\s+(complete|done|ready|ships)|fully\s+autonomous\s+agent|autonomous\s+agent\s+mode/i,
    reason: "Agent Mode Experience eng ≠ Agent-complete claim; wait GATE-FULL-PARITY continuous PASS",
  },
];

/**
 * @param {string} text
 * @param {string} sourceLabel
 * @returns {Array<{ source: string, id: string, reason: string, match: string }>}
 */
export function findForbiddenClaims(text, sourceLabel) {
  const violations = [];
  if (!text) return violations;

  for (const rule of FORBIDDEN_CLAIM_PATTERNS) {
    const match = text.match(rule.pattern);
    if (match) {
      violations.push({
        source: sourceLabel,
        id: rule.id,
        reason: rule.reason,
        match: match[0],
      });
    }
  }
  return violations;
}
