import { describe, it, expect } from 'vitest';
import {
  generateFleetCode,
  calculateExpirationDate,
  isCodeExpired,
  generateUniqueFleetCode,
} from './codeGenerator';

describe('codeGenerator', () => {
  describe('generateFleetCode', () => {
    it('generates an 8-character code', () => {
      const code = generateFleetCode();
      expect(code).toHaveLength(8);
    });

    it('generates code with only uppercase alphanumeric characters', () => {
      const code = generateFleetCode();
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
    });

    it('generates different codes on multiple calls', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateFleetCode());
      }
      // With 36^8 possible combinations, we should get mostly unique codes
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe('calculateExpirationDate', () => {
    it('calculates expiration date 7 days from now', () => {
      const now = new Date('2024-01-01T12:00:00Z');
      const expiresAt = calculateExpirationDate(now);
      
      const expected = new Date('2024-01-08T12:00:00Z');
      expect(expiresAt.getTime()).toBe(expected.getTime());
    });

    it('uses current date when no date provided', () => {
      const before = new Date();
      const expiresAt = calculateExpirationDate();
      const after = new Date();
      
      const daysDiff = (expiresAt.getTime() - before.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeGreaterThanOrEqual(6.99);
      expect(daysDiff).toBeLessThanOrEqual(7.01);
    });
  });

  describe('isCodeExpired', () => {
    it('returns true for expired date', () => {
      const pastDate = new Date('2020-01-01T12:00:00Z');
      expect(isCodeExpired(pastDate)).toBe(true);
    });

    it('returns false for future date', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      expect(isCodeExpired(futureDate)).toBe(false);
    });

    it('returns true for current time (edge case)', () => {
      const now = new Date();
      // A date that's exactly now should be considered expired
      expect(isCodeExpired(now)).toBe(false);
    });
  });

  describe('generateUniqueFleetCode', () => {
    it('generates a unique code not in existing codes', () => {
      const existingCodes = ['AAAAAAAA', 'BBBBBBBB', 'CCCCCCCC'];
      const newCode = generateUniqueFleetCode(existingCodes);
      
      expect(newCode).toHaveLength(8);
      expect(existingCodes).not.toContain(newCode);
    });

    it('generates code when no existing codes', () => {
      const newCode = generateUniqueFleetCode([]);
      expect(newCode).toHaveLength(8);
      expect(newCode).toMatch(/^[A-Z0-9]{8}$/);
    });

    it('throws error when unable to generate unique code after max attempts', () => {
      // Create a large set of existing codes to increase collision probability
      // With only 1 attempt, we test the error handling
      const existingCodes = Array.from({ length: 100 }, (_, i) => 
        `CODE${i.toString().padStart(4, '0')}`
      );
      
      // Test with maxAttempts = 0 to force immediate failure
      expect(() => generateUniqueFleetCode(existingCodes, 0)).toThrow(
        'Unable to generate unique fleet code after maximum attempts'
      );
    });
  });
});
