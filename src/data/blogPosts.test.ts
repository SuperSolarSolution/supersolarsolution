import { describe, it, expect } from 'vitest';
import { getFeaturedPosts, blogPosts } from './blogPosts';

describe('getFeaturedPosts', () => {
  it('should return an array', () => {
    const featuredPosts = getFeaturedPosts();
    expect(Array.isArray(featuredPosts)).toBe(true);
  });

  it('should return only featured posts', () => {
    const featuredPosts = getFeaturedPosts();

    // Verify every post in the result has featured set to true
    featuredPosts.forEach(post => {
      expect(post.featured).toBe(true);
    });
  });

  it('should return the correct number of featured posts', () => {
    const featuredPosts = getFeaturedPosts();
    const expectedFeaturedPosts = blogPosts.filter(post => post.featured);

    expect(featuredPosts.length).toBe(expectedFeaturedPosts.length);
  });
});
