import fs from 'fs';

const originalFile = fs.readFileSync('src/data/blogPosts.ts', 'utf8');

// Find where blogPosts array ends: `];` followed by helper functions
const endIndex = originalFile.indexOf('];\n\nexport function getBlogPost');

if (endIndex === -1) {
    console.error("Could not find the end of the blogPosts array");
    process.exit(1);
}

const beforePosts = originalFile.slice(0, endIndex);
const afterPosts = originalFile.slice(endIndex);

const newBlogs = JSON.parse(fs.readFileSync('real_blogs.json', 'utf8'));

// Format new blogs as a string to inject
let newBlogsString = "";

for (const blog of newBlogs) {
    newBlogsString += `,\n  {
    slug: ${JSON.stringify(blog.slug)},
    title: ${JSON.stringify(blog.title)},
    metaTitle: ${JSON.stringify(blog.metaTitle)},
    metaDescription: ${JSON.stringify(blog.metaDescription)},
    excerpt: ${JSON.stringify(blog.excerpt)},
    content: \`${blog.content.replace(/`/g, '\\`')}\`,
    coverImage: ${JSON.stringify(blog.coverImage)},
    category: ${JSON.stringify(blog.category)},
    tags: ${JSON.stringify(blog.tags)},
    author: ${JSON.stringify(blog.author)},
    publishedAt: ${JSON.stringify(blog.publishedAt)},
    readingTime: ${JSON.stringify(blog.readingTime)},
    featured: ${JSON.stringify(blog.featured)}
  }`;
}

const finalFile = beforePosts + newBlogsString + '\n' + afterPosts;

fs.writeFileSync('src/data/blogPosts.ts', finalFile);

console.log("Successfully appended 100 REALISTIC blogs to src/data/blogPosts.ts");
