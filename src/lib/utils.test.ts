// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, getOrdinalSuffix } from './utils';

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

describe('formatCurrency utility', () => {
  it('formats amounts less than 1 Lakh with standard Indian locale string', () => {
    expect(formatCurrency(0)).toBe('₹0');
    expect(formatCurrency(500)).toBe('₹500');
    expect(formatCurrency(50000)).toBe('₹50,000');
    expect(formatCurrency(99999)).toBe('₹99,999');
  });

  it('formats amounts between 1 Lakh and 1 Crore with L suffix', () => {
    expect(formatCurrency(100000)).toBe('₹1.00 L');
    expect(formatCurrency(150000)).toBe('₹1.50 L');
    expect(formatCurrency(9900000)).toBe('₹99.00 L');
  });

  it('formats amounts greater than or equal to 1 Crore with Cr suffix', () => {
    expect(formatCurrency(10000000)).toBe('₹1.00 Cr');
    expect(formatCurrency(15000000)).toBe('₹1.50 Cr');
    expect(formatCurrency(100000000)).toBe('₹10.00 Cr');
  });

  it('handles custom decimal precision via options', () => {
    expect(formatCurrency(150000, { decimals: 0 })).toBe('₹2 L'); // rounds up
    expect(formatCurrency(150000, { decimals: 1 })).toBe('₹1.5 L');
    expect(formatCurrency(155000, { decimals: 1 })).toBe('₹1.6 L');
    expect(formatCurrency(15000000, { decimals: 0 })).toBe('₹2 Cr');
    expect(formatCurrency(15000000, { decimals: 3 })).toBe('₹1.500 Cr');
  });

  it('handles negative amounts correctly', () => {
    // Note: The current implementation handles negative numbers simply by falling through to the localeString
    // Let's verify its current behavior
    expect(formatCurrency(-50000)).toBe('₹-50,000');
    expect(formatCurrency(-150000)).toBe('₹-1,50,000'); // Falls through since -150000 is not >= 100000
  });
});

describe('getOrdinalSuffix utility', () => {
  it('returns "st" for numbers ending in 1 (except 11)', () => {
    expect(getOrdinalSuffix(1)).toBe('st');
    expect(getOrdinalSuffix(21)).toBe('st');
    expect(getOrdinalSuffix(31)).toBe('st');
    expect(getOrdinalSuffix(101)).toBe('st');
  });

  it('returns "nd" for numbers ending in 2 (except 12)', () => {
    expect(getOrdinalSuffix(2)).toBe('nd');
    expect(getOrdinalSuffix(22)).toBe('nd');
    expect(getOrdinalSuffix(32)).toBe('nd');
    expect(getOrdinalSuffix(102)).toBe('nd');
  });

  it('returns "rd" for numbers ending in 3 (except 13)', () => {
    expect(getOrdinalSuffix(3)).toBe('rd');
    expect(getOrdinalSuffix(23)).toBe('rd');
    expect(getOrdinalSuffix(33)).toBe('rd');
    expect(getOrdinalSuffix(103)).toBe('rd');
  });

  it('returns "th" for numbers ending in 11, 12, 13', () => {
    expect(getOrdinalSuffix(11)).toBe('th');
    expect(getOrdinalSuffix(12)).toBe('th');
    expect(getOrdinalSuffix(13)).toBe('th');
    expect(getOrdinalSuffix(111)).toBe('th');
    expect(getOrdinalSuffix(112)).toBe('th');
    expect(getOrdinalSuffix(113)).toBe('th');
  });

  it('returns "th" for numbers ending in 0 or 4-9', () => {
    expect(getOrdinalSuffix(0)).toBe('th');
    expect(getOrdinalSuffix(4)).toBe('th');
    expect(getOrdinalSuffix(9)).toBe('th');
    expect(getOrdinalSuffix(10)).toBe('th');
    expect(getOrdinalSuffix(20)).toBe('th');
    expect(getOrdinalSuffix(100)).toBe('th');
    expect(getOrdinalSuffix(104)).toBe('th');
  });

  it('handles negative numbers correctly', () => {
    expect(getOrdinalSuffix(-1)).toBe('st');
    expect(getOrdinalSuffix(-2)).toBe('nd');
    expect(getOrdinalSuffix(-3)).toBe('rd');
    expect(getOrdinalSuffix(-11)).toBe('th');
    expect(getOrdinalSuffix(-21)).toBe('st');
  });
});