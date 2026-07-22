/**
 * WCAG-oriented axe gate for the built marketing site.
 * Fails on axe impact: critical or serious.
 *
 * Usage (after npm run build):
 *   npm run test:a11y
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..", "_site");

const PAGES = [
  "/",
  "/request-demo.html",
  "/design-partners.html",
  "/faq.html",
  "/docs/",
  "/trust.html",
  "/accessibility.html",
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function resolveUrlPath(urlPath) {
  let clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (clean.endsWith("/")) {
    clean += "index.html";
  }
  if (clean === "/") {
    clean = "/index.html";
  }
  const resolved = path.normalize(path.join(siteRoot, clean));
  if (!resolved.startsWith(siteRoot)) {
    return null;
  }
  return resolved;
}

async function startStaticServer() {
  const server = createServer(async (req, res) => {
    try {
      const filePath = resolveUrlPath(req.url || "/");
      if (!filePath) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { "Content-Type": contentType(filePath) });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

function summarizeViolations(violations) {
  return violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map((v) => {
      const nodes = (v.nodes || [])
        .slice(0, 5)
        .map((n) => `    - ${n.target && n.target.join(" ")}`)
        .join("\n");
      return `[${v.impact}] ${v.id}: ${v.help}\n${nodes}`;
    });
}

async function main() {
  const { server, baseUrl } = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const failures = [];

  try {
    for (const pagePath of PAGES) {
      const page = await context.newPage();
      const url = baseUrl + pagePath;
      await page.goto(url, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const blocking = summarizeViolations(results.violations);
      if (blocking.length) {
        failures.push(`\n${pagePath}\n${blocking.join("\n")}`);
      } else {
        console.log(`PASS ${pagePath}`);
      }
      await page.close();
    }
  } finally {
    await context.close();
    await browser.close();
    server.close();
  }

  if (failures.length) {
    console.error("\nAxe serious/critical failures:");
    console.error(failures.join("\n"));
    process.exit(1);
  }

  console.log("\nAll a11y pages passed (serious/critical = 0).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
