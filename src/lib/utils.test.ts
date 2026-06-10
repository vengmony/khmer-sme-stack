import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, generateNumber, titleCase, round2 } from './utils';

describe('utils', () => {
  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('handles zero', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    it('handles negative numbers', () => {
      expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with default decimals', () => {
      expect(formatNumber(1234.56)).toBe('1,235');
    });

    it('formats numbers with specified decimals', () => {
      expect(formatNumber(1234.56, 2)).toBe('1,234.56');
    });
  });

  describe('generateNumber', () => {
    it('generates the first number when last is undefined', () => {
      expect(generateNumber('SO', undefined)).toBe('SO-0001');
    });

    it('increments the last number', () => {
      expect(generateNumber('INV', 9)).toBe('INV-0010');
    });

    it('respects the padding argument', () => {
      expect(generateNumber('PO', 5, 2)).toBe('PO-06');
    });
  });

  describe('titleCase', () => {
    it('converts snake_case to Title Case', () => {
      expect(titleCase('partially_paid')).toBe('Partially Paid');
    });

    it('converts lowercase to Title Case', () => {
      expect(titleCase('shipped')).toBe('Shipped');
    });

    it('handles empty string', () => {
      expect(titleCase('')).toBe('');
    });
  });

  describe('round2', () => {
    it('rounds to two decimal places', () => {
      expect(round2(10.12345)).toBe(10.12);
      expect(round2(10.126)).toBe(10.13);
    });

    it('handles zero', () => {
      expect(round2(0)).toBe(0);
    });

    it('handles null/undefined like 0', () => {
      expect(round2(null as any)).toBe(0);
      expect(round2(undefined as any)).toBe(0);
    });
  });
});
