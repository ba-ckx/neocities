// .eleventy.js (CommonJS)
const { DateTime } = require("luxon");

// helpers
function asDate(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
function monthKeyParts(ym) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(ym || ""));
  return m ? { y: Number(m[1]), m: Number(m[2]) } : null;
}

module.exports = function (eleventyConfig) {
  //
  // Collections
  //
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((item) => {
        const published = !!item.data.publish;
        const d = asDate(item.data.date) || asDate(item.date);
        item.__safeDate = d;
        return published && !!d;
      })
      .sort((a, b) => b.__safeDate - a.__safeDate);
  });

  eleventyConfig.addCollection("postsByMonth", (collectionApi) => {
    const posts = collectionApi
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((item) => {
        const published = !!item.data.publish;
        const d = asDate(item.data.date) || asDate(item.date);
        item.__safeDate = d;
        return published && !!d;
      })
      .sort((a, b) => b.__safeDate - a.__safeDate);

    const groups = new Map();
    for (const p of posts) {
      const d = p.__safeDate;
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    }

    return [...groups.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([month, items]) => ({ month, posts: items }));
  });

  //
  // Filters
  //
  eleventyConfig.addFilter("datePt", (dateInput, comHora = false) => {
    const d = asDate(dateInput);
    if (!d) return "";
    const base = { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric" };
    const opts = comHora ? { ...base, hour: "2-digit", minute: "2-digit", hour12: false } : base;
    const s = new Intl.DateTimeFormat("pt-BR", opts).format(d);
    return s.toLocaleLowerCase("pt-BR");
  });

  eleventyConfig.addFilter("monthYearPt", (yyyyMm) => {
    const parts = monthKeyParts(yyyyMm);
    if (!parts) return String(yyyyMm || "");
    const d = new Date(Date.UTC(parts.y, parts.m - 1, 1));
    if (isNaN(d)) return String(yyyyMm || "");
    const s = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      month: "long",
      year: "numeric",
    }).format(d);
    return s.toLocaleLowerCase("pt-BR");
  });

  //
  // Core settings (Option 2: layouts at _includes)
  //
  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      layouts: "_includes/layouts", // allows layout: layouts/post.njk
    },
    pathPrefix: "/",
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
