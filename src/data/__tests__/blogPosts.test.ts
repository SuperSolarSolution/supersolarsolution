import { describe, it, expect } from 'vitest';
import { getAllCategories, blogPosts } from '../blogPosts';

describe('getAllCategories', () => {
  it('returns an array of strings', () => {
    const categories = getAllCategories();
    expect(Array.isArray(categories)).toBe(true);
    categories.forEach((category) => {
      expect(typeof category).toBe('string');
    });
  });

  it('contains no duplicates', () => {
    const categories = getAllCategories();
    const uniqueCategories = new Set(categories);
    expect(categories.length).toBe(uniqueCategories.size);
  });

  it('length matches the number of unique categories in blogPosts', () => {
    const categories = getAllCategories();
    const expectedUniqueCategories = new Set(blogPosts.map((post) => post.category));
    expect(categories.length).toBe(expectedUniqueCategories.size);

    // Also verify all categories are expected
    categories.forEach(category => {
      expect(expectedUniqueCategories.has(category)).toBe(true);
    });
  });
});
