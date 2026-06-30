/**
 * Generate documentation/SITE-GUIDE-SETTINGS-QUESTIONS.md from the question catalog.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SETTINGS_QUESTION_CATALOG } from "./site-guide-settings-questions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(
  __dirname,
  "../documentation/SITE-GUIDE-SETTINGS-QUESTIONS.md"
);

export function writeSettingsQuestionsDoc() {
  let md = `# Site guide — settings & configuration questions

**Generated from** \`scripts/site-guide-settings-questions.mjs\` — do not edit by hand.  
**Purpose:** Complete catalog of questions the site guide can answer about settings (matcher keywords + doc links).  
**Not** a raw settings key list in the widget — each question maps to a narrative answer + links.

Run \`npm run gen:site-guide\` after editing the catalog.

---

`;

  let total = 0;
  for (const cat of SETTINGS_QUESTION_CATALOG) {
    md += `## ${cat.category}\n\n`;
    for (const q of cat.questions) {
      total += 1;
      md += `### ${q.title}\n\n`;
      md += `**Question:** ${q.question}\n\n`;
      md += `**Matcher id:** \`${q.id}\`\n\n`;
      md += `**Primary link:** [${q.primary_label}](${q.primary_url})\n\n`;
      if (q.related_links?.length) {
        md += `**Also see:** ${q.related_links.map((l) => `[${l.label}](${l.url})`).join(" · ")}\n\n`;
      }
      md += "---\n\n";
    }
  }

  md += `\n**Total questions:** ${total}\n`;

  fs.writeFileSync(OUT, md);
  console.log("Wrote", total, "settings questions to", OUT);
  return total;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  writeSettingsQuestionsDoc();
}
