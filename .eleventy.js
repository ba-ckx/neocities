// .eleventy.js
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  //
  // 1. COLLECTIONS
  //

  // All published posts (from src/posts/)
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((item) => item.data.publish) // only publish:true
      .sort((a, b) => b.date - a.date); // newest first
  });

  // Group posts by YYYY-MM (for sidebar archives)
  eleventyConfig.addCollection("postsByMonth", (collectionApi) => {
    const posts = collectionApi
      .getFilteredByGlob("src/posts/**/*.md")
      .filter((item) => item.data.publish)
      .sort((a, b) => b.date - a.date);

    const groups = {};
    for (const post of posts) {
      const year = post.date.getFullYear();
      const month = String(post.date.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(post);
    }

    return Object.entries(groups)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([month, posts]) => ({ month, posts }));
  });

  //
  // 2. FILTERS
  //

  // Format date as "October 27, 2025"
  eleventyConfig.addFilter("dateReadable", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLLL d, yyyy");
  });

  // Convert "2025-10" → "October 2025"
  eleventyConfig.addFilter("monthYear", (ym) => {
    const [year, month] = ym.split("-");
    const date = new Date(`${year}-${month}-01`);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  });

  //
  // 3. RETURN CONFIG
  //

  return {
    dir: {
      input: "src",
      output: "public", // everything builds into /public for Neocities
      includes: "_includes",
      layouts: "_includes/layouts"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
