import { describe, it, expect } from 'vitest';
import { getBlogPost, blogPosts } from './blogPosts';

describe('getBlogPost', () => {
  it('should return a blog post when a valid slug is provided', () => {
    const validSlug = blogPosts[0].slug;
    const post = getBlogPost(validSlug);
    expect(post).toBeDefined();
    expect(post?.slug).toBe(validSlug);
    expect(post?.title).toBe(blogPosts[0].title);
  });

  it('should return undefined when an invalid slug is provided', () => {
    const post = getBlogPost('invalid-slug-that-does-not-exist');
    expect(post).toBeUndefined();
  });

  it('should return undefined when an empty slug is provided', () => {
    const post = getBlogPost('');
    expect(post).toBeUndefined();
  });
});
