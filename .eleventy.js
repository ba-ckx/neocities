// .eleventy.js (CommonJS)
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // ---- Collections (keep yours here) ----
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((item) => item.data.publish)
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("postsByMonth", (collectionApi) => {
    const posts = collectionApi
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((item) => item.data.publish)
      .sort((a, b) => b.date - a.date);

    const groups = {};
    for (const p of posts) {
      const y = p.date.getUTCFullYear();
      const m = String(p.ndate.getUTCMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      (groups[key] ||= []).push(p);
    }
    return Object.entries(groups)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([month, posts]) => ({ month, posts }));
  });

  // ---- Filters (PT-BR, lowercase) ----
  eleventyConfig.addFilter("datePt", (dateInput, comHora = false) => {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const base = { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric" };
    const opts = comHora ? { ...base, hour: "2-digit", minute: "2-digit", hour12: false } : base;
    const s = new Intl.DateTimeFormat("pt-BR", opts).format(d);
    return s.toLocaleLowerCase("pt-BR");
  });

  eleventyConfig.addFilter("monthYearPt", (yyyyMm) => {
    const [y, m] = String(yyyyMm).split("-");
    const d = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, 1));
    const s = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      month: "long",
      year: "numeric",
    }).format(d);
    return s.toLocaleLowerCase("pt-BR");
  });

  // ---- Return (keep as you had) ----
  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      layouts: "_includes/layouts",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    pathPrefix: "/",
  };
};
