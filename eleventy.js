// .eleventy.js
module.exports = function(eleventyConfig) {
  // 1. Set input and output directories
  return {
    dir: {
      input: "src",    // source files location
      output: "public" // output directory for the compiled site
    }
  };
};

module.exports = function(eleventyConfig) {
  // Passthrough copy example (if needed for any static assets in src):
  // eleventyConfig.addPassthroughCopy("src/assets"); 

  // Create a collection of blog posts (filtering only published posts)
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md")
      .filter(item => item.data.publish !== false)  // only include if publish is not false
      .sort((a, b) => b.date - a.date);             // sort by date descending (newest first)
  });

  // Create a collection grouped by Year-Month for archives
  eleventyConfig.addCollection("postsByMonth", function(collectionApi) {
    const posts = collectionApi.getFilteredByGlob("src/posts/*.md")
                  .filter(item => item.data.publish !== false);
    // Group posts by YYYY-MM (year-month)
    const groups = {};
    for (let post of posts) {
      let date = post.date;
      let yyyy = date.getFullYear();
      let mm = String(date.getMonth() + 1).padStart(2, "0");  // zero-padded month
      let yearMonth = `${yyyy}-${mm}`;
      if (!groups[yearMonth]) groups[yearMonth] = [];
      groups[yearMonth].push(post);
    }
    // Convert to an array of { month: "YYYY-MM", posts: [...] }, sorted by month (desc)
    return Object.keys(groups).sort().reverse().map(month => {
      // sort posts in each group by date (desc)
      groups[month].sort((a, b) => b.date - a.date);
      return { month: month, posts: groups[month] };
    });
  });

  // Date formatting filter (for nice display of dates)
  eleventyConfig.addFilter("dateReadable", function(dateObj) {
    return dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  });
  // Month name filter (for archive labels like "October 2025")
  eleventyConfig.addFilter("monthYear", function(yyyyMm) {
    const [year, month] = yyyyMm.split("-");
    const date = new Date(+year, +month - 1, 1);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'long' }); // e.g. "October 2025"
  });

  return {
    dir: { input: "src", output: "public", includes: "_includes" }
  };
};
