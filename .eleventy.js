// helper: parse a valid Date or return null
function asDate(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

module.exports = function (eleventyConfig) {
  // POSTS: only publish:true and with a valid date
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((item) => {
        const published = !!item.data.publish;
        // prefer frontmatter date, then Eleventy’s computed item.date
        const d = asDate(item.data.date) || asDate(item.date);
        item.__safeDate = d; // stash for reuse
        return published && !!d;
      })
      .sort((a, b) => b.__safeDate - a.__safeDate);
  });

  // POSTS BY MONTH: group using the safe date
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

  // … keep your datePt / monthYearPt filters and the return { dir, … } as-is
};
