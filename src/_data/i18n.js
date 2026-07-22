/**
 * Global i18n catalog for Eleventy templates.
 * Active locales = default + any locale folder that exists under src/_i18n/.
 */
const { loadCatalog } = require("../../scripts/i18n-catalog.cjs");

module.exports = function () {
  return loadCatalog();
};
