import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(__dirname, "..", "src");
const outRoot = path.join(srcRoot, "_i18n", "en");

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") || entry.name === "assets") continue;
      walk(full, acc);
    } else if (entry.name.endsWith(".html")) {
      acc.push(full);
    }
  }
  return acc;
}

function pageIdFromRel(rel) {
  let stem = rel.replace(/\.html$/, "").replace(/\\/g, "/");
  if (stem === "index") return "home";
  if (stem.endsWith("/index")) {
    stem = `${stem.slice(0, -"/index".length)}-index`;
  }
  return stem.replace(/\//g, "-");
}

fs.mkdirSync(outRoot, { recursive: true });

for (const filePath of walk(srcRoot)) {
  const rel = path.relative(srcRoot, filePath).replace(/\\/g, "/");
  const text = fs.readFileSync(filePath, "utf8");
  const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = fmMatch ? fmMatch[1] : "";
  const title = (fm.match(/^title:\s*(.+)$/m) || [])[1] || "";
  const description = (fm.match(/^description:\s*(.+)$/m) || [])[1] || "";
  const id = pageIdFromRel(rel);
  const pack = {
    title,
    description,
  };
  const outPath = path.join(outRoot, `${id}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  console.log("wrote", path.relative(path.join(__dirname, ".."), outPath));
}
