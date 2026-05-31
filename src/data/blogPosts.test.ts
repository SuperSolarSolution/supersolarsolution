// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { getFeaturedPosts, blogPosts } from './blogPosts';

describe('getFeaturedPosts', () => {
  it('should return only featured posts', () => {
    const featuredPosts = getFeaturedPosts();
    expect(featuredPosts.length).toBeGreaterThan(0);
    featuredPosts.forEach(post => {
      expect(post.featured).toBe(true);
    });
  });

  it('should return correct number of featured posts', () => {
    const expectedCount = blogPosts.filter(post => post.featured).length;
    const featuredPosts = getFeaturedPosts();
    expect(featuredPosts.length).toBe(expectedCount);
  });
});