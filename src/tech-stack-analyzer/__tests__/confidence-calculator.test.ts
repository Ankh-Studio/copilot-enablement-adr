/**
 * Confidence Calculator Unit Tests
 *
 * Comprehensive tests for confidence assessment logic
 */

import { describe, it, expect } from 'vitest';
import {
  calculateConfidence,
  getConfidenceScore,
  validateConfidence,
} from '../confidence-calculator';
import { StackData, ConfidenceLevel } from '../types';

describe('calculateConfidence', () => {
  it('should return high confidence for comprehensive stacks', () => {
    const input: StackData = {
      techs: ['react', 'typescript', 'jest', 'webpack', 'eslint'],
      languages: { TypeScript: 10, JavaScript: 5 },
    };

    expect(calculateConfidence(input)).toBe('high');
  });

  it('should return medium confidence for moderate stacks', () => {
    const input: StackData = {
      techs: ['react', 'typescript'],
      languages: { TypeScript: 8 },
    };

    expect(calculateConfidence(input)).toBe('medium');
  });

  it('should return low confidence for minimal stacks', () => {
    const input: StackData = {
      techs: ['react'],
      languages: { JavaScript: 2 },
    };

    expect(calculateConfidence(input)).toBe('low');
  });

  it('should return low confidence for empty techs with languages', () => {
    const input: StackData = {
      techs: [],
      languages: { JavaScript: 5 },
    };

    expect(calculateConfidence(input)).toBe('low');
  });

  it('should return low confidence for empty techs and languages', () => {
    const input: StackData = {
      techs: [],
      languages: {},
    };

    expect(calculateConfidence(input)).toBe('low');
  });

  it('should handle null input gracefully', () => {
    expect(calculateConfidence(null)).toBe('low');
  });

  it('should handle undefined input gracefully', () => {
    expect(calculateConfidence(undefined)).toBe('low');
  });

  it('should handle missing techs array', () => {
    const input = { languages: { JavaScript: 5 } } as any;
    expect(calculateConfidence(input)).toBe('low');
  });

  it('should handle missing languages object', () => {
    const input = { techs: ['react'] } as any;
    expect(calculateConfidence(input)).toBe('low');
  });

  it('should be deterministic - same input produces same output', () => {
    const input: StackData = {
      techs: ['react', 'typescript', 'jest'],
      languages: { TypeScript: 10 },
    };

    const result1 = calculateConfidence(input);
    const result2 = calculateConfidence(input);

    expect(result1).toBe(result2);
  });
});

describe('getConfidenceScore', () => {
  it('should return 0.9 for high confidence', () => {
    expect(getConfidenceScore('high')).toBe(0.9);
  });

  it('should return 0.7 for medium confidence', () => {
    expect(getConfidenceScore('medium')).toBe(0.7);
  });

  it('should return 0.5 for low confidence', () => {
    expect(getConfidenceScore('low')).toBe(0.5);
  });

  it('should return 0.3 for invalid confidence', () => {
    expect(getConfidenceScore('invalid' as ConfidenceLevel)).toBe(0.3);
  });
});

describe('validateConfidence', () => {
  it('should validate high confidence correctly', () => {
    const stackData: StackData = {
      techs: ['react', 'typescript', 'jest', 'webpack', 'eslint'],
      languages: { TypeScript: 10 },
    };

    expect(validateConfidence(stackData, 'high')).toBe(true);
  });

  it('should reject high confidence for insufficient data', () => {
    const stackData: StackData = {
      techs: ['react'],
      languages: { JavaScript: 2 },
    };

    expect(validateConfidence(stackData, 'high')).toBe(false);
  });

  it('should validate medium confidence correctly', () => {
    const stackData: StackData = {
      techs: ['react', 'typescript'],
      languages: { TypeScript: 8 },
    };

    expect(validateConfidence(stackData, 'medium')).toBe(true);
  });

  it('should reject medium confidence for insufficient data', () => {
    const stackData: StackData = {
      techs: ['react'],
      languages: {},
    };

    expect(validateConfidence(stackData, 'medium')).toBe(false);
  });

  it('should validate low confidence correctly', () => {
    const stackData: StackData = {
      techs: ['react'],
      languages: { JavaScript: 2 },
    };

    expect(validateConfidence(stackData, 'low')).toBe(true);
  });

  it('should validate low confidence for empty data', () => {
    const stackData: StackData = {
      techs: [],
      languages: {},
    };

    expect(validateConfidence(stackData, 'low')).toBe(true);
  });

  it('should handle null data correctly', () => {
    expect(validateConfidence(null, 'low')).toBe(true);
    expect(validateConfidence(null, 'medium')).toBe(false);
    expect(validateConfidence(null, 'high')).toBe(false);
  });

  it('should handle undefined data correctly', () => {
    expect(validateConfidence(undefined, 'low')).toBe(true);
    expect(validateConfidence(undefined, 'medium')).toBe(false);
    expect(validateConfidence(undefined, 'high')).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('should handle very large tech arrays', () => {
    const techs = Array.from({ length: 100 }, (_, i) => `tech-${i}`);
    const input: StackData = {
      techs,
      languages: { TypeScript: 100 },
    };

    expect(calculateConfidence(input)).toBe('high');
  });

  it('should handle very high language counts', () => {
    const languages: Record<string, number> = {};
    for (let i = 0; i < 50; i++) {
      languages[`lang-${i}`] = i + 1;
    }

    const input: StackData = {
      techs: ['react', 'typescript', 'jest', 'webpack', 'eslint'], // 5 techs for high confidence
      languages,
    };

    expect(calculateConfidence(input)).toBe('high');
  });

  it('should handle zero language counts', () => {
    const input: StackData = {
      techs: ['react', 'typescript'],
      languages: { TypeScript: 0, JavaScript: 0 },
    };

    expect(calculateConfidence(input)).toBe('medium');
  });

  it('should handle negative language counts', () => {
    const input: StackData = {
      techs: ['react', 'typescript'],
      languages: { TypeScript: -5, JavaScript: 10 },
    };

    expect(calculateConfidence(input)).toBe('medium');
  });
});
