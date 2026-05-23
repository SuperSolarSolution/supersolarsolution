import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges standard string classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  it('handles arrays and objects', () => {
    expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe('class1 class2 class3');
  });

  it('merges and resolves tailwind class conflicts', () => {
    // Tailwind merge should resolve conflicting padding classes
    expect(cn('p-4', 'p-8')).toBe('p-8');
    // More specific padding vs general padding
    expect(cn('px-2 py-4', 'p-6')).toBe('p-6');
    expect(cn('p-6', 'px-2')).toBe('p-6 px-2');
  });

  it('handles undefined, null, and empty inputs gracefully', () => {
    expect(cn('class1', undefined, null, '', 'class2')).toBe('class1 class2');
  });

  it('handles a mix of complex inputs and tailwind conflicts', () => {
    expect(
      cn(
        'bg-red-500',
        ['text-white', 'text-black'], // 'text-black' should win text color
        { 'bg-blue-500': true }, // 'bg-blue-500' should win over 'bg-red-500'
        undefined,
        false && 'hidden'
      )
    ).toBe('text-black bg-blue-500');
  });
});
