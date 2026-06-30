module.exports = function (eleventyConfig) {
  const { execSync } = require("child_process");

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  eleventyConfig.addWatchTarget("src/assets/");

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
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink(data) {
      let stem = data.page.filePathStem.replace(/^\/src/, "") || "/index";
      if (stem === "/index") {
        return "/index.html";
      }
      if (stem.endsWith("/index")) {
        return `${stem}.html`;
      }
      return `${stem}.html`;
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
  };
};
