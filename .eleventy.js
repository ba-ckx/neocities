// .eleventy.js (CommonJS)
const { DateTime } = require("luxon");

// helper: parse a valid Date or return null
function asDate(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

module.exports = function (eleventyConfig) {
  //
  // COLLECTIONS (defensive re: dates)
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

    const groups = new Map(); // "YYYY-MM" -> [items]
    for (const p of posts) {
      const d = p.__safeDate;
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    }

    return [...groups.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1)) // newest month first
      .map(([month, items]) => ({ month, posts: items }));
  });

  //
  // FILTERS (pt-BR, minúsculas)
  //
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

  //
  // CORE SETTINGS (Option 2: layouts at _includes)
  //
  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",      // partials live here
      layouts: "_includes/layouts"        // <-- layouts root is _includes
    },
    pathPrefix: "/",
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
