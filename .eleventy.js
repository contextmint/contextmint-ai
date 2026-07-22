const { execSync } = require("child_process");
const { lookup } = require("./scripts/i18n-catalog.cjs");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  eleventyConfig.addWatchTarget("src/assets/");
  eleventyConfig.addWatchTarget("src/_i18n/");

  eleventyConfig.addFilter("t", function (key, domain) {
    const ctx = this.ctx || {};
    const source =
      domain === "page" ? ctx.i18nPageStrings || {} : ctx.i18nCommon || {};
    const value = lookup(source, key);
    return value === undefined || value === null ? key : value;
  });

  eleventyConfig.addFilter("locale_path", function (targetPath, prefix) {
    const ctx = this.ctx || {};
    const resolvedPrefix =
      typeof prefix === "string" ? prefix : ctx.localePrefix || "";
    if (!targetPath || typeof targetPath !== "string") return targetPath;
    if (/^(https?:|mailto:|tel:|#)/i.test(targetPath)) return targetPath;
    if (!targetPath.startsWith("/")) return targetPath;
    if (!resolvedPrefix) return targetPath;
    if (
      targetPath === resolvedPrefix ||
      targetPath.startsWith(`${resolvedPrefix}/`)
    ) {
      return targetPath;
    }
    return `${resolvedPrefix}${targetPath}`;
  });

  eleventyConfig.addFilter("i18n_token", function (template, token, value) {
    if (template == null) return "";
    return String(template).split(token).join(value == null ? "" : String(value));
  });

  // SGC-010 — index built HTML for site guide Pagefind fallback search
  eleventyConfig.on("eleventy.after", () => {
    try {
      console.log("[pagefind] indexing _site …");
      execSync("npx pagefind --site _site", {
        encoding: "utf-8",
        stdio: "inherit",
      });
    } catch (err) {
      console.warn("[pagefind] index skipped:", err.message);
    }
  });

  // Match nav/footer links: /about.html, /product/repository-dna.html, /product/index.html
  // Locale prefix: /ar/... when rendering a non-default locale URL.
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink(data) {
      if (data.permalink) return data.permalink;

      const defaultLocale = (data.i18n && data.i18n.default) || "en";
      const locale = data.locale || defaultLocale;
      const prefix = locale === defaultLocale ? "" : `/${locale}`;

      let stem = data.page.filePathStem.replace(/^\/src/, "") || "/index";
      if (stem === "/index") {
        return prefix ? `${prefix}/index.html` : "/index.html";
      }
      if (stem.endsWith("/index")) {
        return `${prefix}${stem}.html`;
      }
      return `${prefix}${stem}.html`;
    },
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
    templateFormats: ["html", "md", "liquid"],
    pathPrefix: "/",
  };
};
