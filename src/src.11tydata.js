/**
 * Paginate every page across active i18n locales.
 * Non-default locales appear only when src/_i18n/{code}/ exists.
 */
module.exports = {
  pagination: {
    data: "i18n.locales",
    size: 1,
    alias: "i18nLocale",
    addAllPagesToCollections: true,
  },
  eleventyComputed: {
    locale(data) {
      return (data.i18nLocale && data.i18nLocale.code) || data.i18n.default;
    },
    i18nPageId(data) {
      if (data.i18nPage) return data.i18nPage;
      return data.i18n.pageIdFromStem(data.page.filePathStem);
    },
    i18nBundle(data) {
      return data.i18n.resolve(data.locale, data.i18nPageId);
    },
    i18nCommon(data) {
      return data.i18nBundle.common;
    },
    i18nPageStrings(data) {
      return data.i18nBundle.page;
    },
    htmlLang(data) {
      return data.i18nBundle.effectiveLocale;
    },
    htmlDir(data) {
      return data.i18nBundle.dir;
    },
    localePrefix(data) {
      const requested = data.locale || data.i18n.default;
      if (requested === data.i18n.default) return "";
      return `/${requested}`;
    },
    title(data) {
      const fromPack = data.i18nPageStrings && data.i18nPageStrings.title;
      if (fromPack) return fromPack;
      return data.title;
    },
    description(data) {
      const fromPack = data.i18nPageStrings && data.i18nPageStrings.description;
      if (fromPack) return fromPack;
      return data.description;
    },
  },
};
