/**
 * Optional monorepo sync for config/server_settings_catalog.json + Engine desktop.
 * Standalone contextmint-ai site repos skip — the marketing site does not consume that file.
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = path.resolve(__dirname, "../..");
const ROOT_SCRIPT = path.join(MONOREPO_ROOT, "scripts/gen_server_settings_catalog.mjs");
const DEFAULTS_PATH = path.join(MONOREPO_ROOT, "config/contextmint.defaults.yaml");

function main() {
  if (!fs.existsSync(ROOT_SCRIPT) || !fs.existsSync(DEFAULTS_PATH)) {
    console.warn(
      `Skip: monorepo catalog generator not found (standalone site repo). ` +
        `Engine/API catalog is not required for Eleventy build.`,
    );
    return;
  }

  const result = spawnSync(process.execPath, [ROOT_SCRIPT], {
    cwd: MONOREPO_ROOT,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

main();
