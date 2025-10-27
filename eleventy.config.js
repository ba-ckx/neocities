export default function(eleventyConfig) {
  // Copy static assets unchanged
  eleventyConfig.addPassthroughCopy("public/assets");

  // Posts collection
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("public/posts/**/*.md").sort((a, b) => b.date - a.date)
  );

  // Date filter
  eleventyConfig.addFilter("readableDate", (dateObj) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    }).format(dateObj)
  );

  return {
    dir: { input: "public", output: "public/_site" }
  };
}
