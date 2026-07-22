/**
 * ContextMint marketing-site i18n catalog.
 * Packs live under src/_i18n/{locale}/ — default English; other locales activate when their folder exists.
 */
const fs = require("fs");
const path = require("path");

const I18N_ROOT = path.join(__dirname, "..", "src", "_i18n");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function deepMerge(base, overlay) {
  if (!overlay || typeof overlay !== "object" || Array.isArray(overlay)) {
    return overlay === undefined ? base : overlay;
  }
  if (!base || typeof base !== "object" || Array.isArray(base)) {
    return { ...overlay };
  }
  const out = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function lookup(obj, dottedKey) {
  if (!dottedKey) return undefined;
  const parts = String(dottedKey).split(".");
  let cur = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

function pageIdFromStem(stem) {
  let s = String(stem || "").replace(/^\/src/, "").replace(/^\//, "");
  if (!s || s === "index") return "home";
  if (s.endsWith("/index")) {
    s = `${s.slice(0, -"/index".length)}-index`;
  }
  return s.replace(/\//g, "-");
}

function loadLocalePacks(localeCode) {
  const dir = path.join(I18N_ROOT, localeCode);
  if (!fs.existsSync(dir)) return null;
  const packs = {};
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".json")) continue;
    const id = name.slice(0, -".json".length);
    packs[id] = readJson(path.join(dir, name));
  }
  return packs;
}

function loadCatalog() {
  const meta = readJson(path.join(I18N_ROOT, "locales.json"));
  const defaultLocale = meta.default || "en";
  const packs = {};
  const active = [];

  for (const loc of meta.locales || []) {
    const loaded = loadLocalePacks(loc.code);
    if (loc.code === defaultLocale) {
      if (!loaded || !loaded.common) {
        throw new Error(`i18n: default locale "${defaultLocale}" requires common.json`);
      }
      packs[loc.code] = loaded;
      active.push(loc);
      continue;
    }
    if (loaded) {
      packs[loc.code] = loaded;
      active.push(loc);
    }
  }

  function resolve(localeCode, pageId) {
    const requested = localeCode || defaultLocale;
    const enCommon = packs[defaultLocale].common;
    const enPage = packs[defaultLocale][pageId] || {};
    const localeMeta =
      (meta.locales || []).find((l) => l.code === requested) ||
      active.find((l) => l.code === defaultLocale);

    if (requested === defaultLocale) {
      return {
        requestedLocale: requested,
        effectiveLocale: defaultLocale,
        dir: localeMeta.dir || "ltr",
        label: localeMeta.label || "English",
        nativeLabel: localeMeta.nativeLabel || localeMeta.label || "English",
        common: enCommon,
        page: enPage,
        fallback: false,
      };
    }

    const locPacks = packs[requested];
    // All-or-nothing: both common.json and page pack required for non-default locale.
    if (locPacks && locPacks.common && locPacks[pageId]) {
      return {
        requestedLocale: requested,
        effectiveLocale: requested,
        dir: localeMeta.dir || "rtl",
        label: localeMeta.label || requested,
        nativeLabel: localeMeta.nativeLabel || localeMeta.label || requested,
        common: deepMerge(enCommon, locPacks.common),
        page: deepMerge(enPage, locPacks[pageId]),
        fallback: false,
      };
    }

    const enMeta = active.find((l) => l.code === defaultLocale) || {
      dir: "ltr",
      label: "English",
      nativeLabel: "English",
    };
    return {
      requestedLocale: requested,
      effectiveLocale: defaultLocale,
      dir: enMeta.dir || "ltr",
      label: enMeta.label || "English",
      nativeLabel: enMeta.nativeLabel || "English",
      common: enCommon,
      page: enPage,
      fallback: true,
    };
  }

  const defaultLocales = active.filter((loc) => loc.code === defaultLocale);

  return {
    root: I18N_ROOT,
    default: defaultLocale,
    locales: active,
    defaultLocales,
    allLocales: meta.locales || [],
    packs,
    resolve,
    pageIdFromStem,
    lookup,
    deepMerge,
  };
}

module.exports = {
  I18N_ROOT,
  loadCatalog,
  pageIdFromStem,
  lookup,
  deepMerge,
};
