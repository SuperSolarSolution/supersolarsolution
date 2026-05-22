import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('should merge basic class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle tailwind class conflicts correctly', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('mt-2 mb-4', 'my-8')).toBe('my-8');
  });

  it('should support conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });

  it('should support complex inputs like arrays', () => {
    expect(cn(['class1', 'class2'], ['class3', 'class4'])).toBe('class1 class2 class3 class4');
    expect(cn(['p-4', 'text-red-500'], 'p-8')).toBe('text-red-500 p-8');
  });

  it('should ignore undefined, null, and other falsy values', () => {
    expect(cn('class1', undefined, null, false, 0, '', 'class2')).toBe('class1 class2');
  });

  it('should combine multiple complex behaviors', () => {
    expect(cn(
      'base-class',
      { 'conditional-class': true },
      ['array-class1', 'array-class2'],
      'p-4',
      false && 'ignored-class',
      'p-8'
    )).toBe('base-class conditional-class array-class1 array-class2 p-8');
  });
});
