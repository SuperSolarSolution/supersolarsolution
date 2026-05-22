import { describe, it, expect } from 'vitest';
import { getAllTags, blogPosts } from './blogPosts';

describe('getAllTags', () => {
  it('should return an array of strings', () => {
    const tags = getAllTags();
    expect(Array.isArray(tags)).toBe(true);
    tags.forEach(tag => {
      expect(typeof tag).toBe('string');
    });
  });

  it('should return unique tags', () => {
    const tags = getAllTags();
    const uniqueTags = new Set(tags);
    expect(tags.length).toBe(uniqueTags.size);
  });

  it('should contain all tags present in blogPosts', () => {
    const tags = getAllTags();
    const allExpectedTags = new Set(blogPosts.flatMap((post) => post.tags));

    expect(tags.length).toBe(allExpectedTags.size);
    allExpectedTags.forEach(expectedTag => {
      expect(tags).toContain(expectedTag);
    });
  });

  it('should not contain undefined or null values', () => {
    const tags = getAllTags();
    tags.forEach(tag => {
      expect(tag).not.toBeUndefined();
      expect(tag).not.toBeNull();
    });
  });
});
