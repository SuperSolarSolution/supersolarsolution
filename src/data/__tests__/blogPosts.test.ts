import { describe, expect, it } from "bun:test";
import { getPostsByCategory, blogPosts } from "../blogPosts";

describe("getPostsByCategory", () => {
  it("should return posts for a valid category", () => {
    // Dynamically pick a category that exists in the data
    const category = blogPosts.length > 0 ? blogPosts[0].category : "Investment Guide";

    const posts = getPostsByCategory(category);
    expect(posts).toBeArray();
    expect(posts.length).toBeGreaterThan(0);
    posts.forEach(post => {
      expect(post.category).toBe(category);
    });
  });

  it("should return an empty array for an invalid category", () => {
    const posts = getPostsByCategory("InvalidCategory" + Date.now());
    expect(posts).toBeArray();
    expect(posts.length).toBe(0);
  });
});
