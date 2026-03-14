/**
 * Summary Generator Unit Tests
 *
 * Comprehensive tests for summary generation logic
 */

import { describe, it, expect } from 'vitest';
import {
  generateSummary,
  generateDetailedSummary,
  generateConciseSummary,
  validateSummary,
} from '../summary-generator';
import { StackData } from '../types';

describe('generateSummary', () => {
  it('should generate summary for comprehensive stack', () => {
    const input: StackData = {
      techs: ['react', 'typescript', 'jest', 'webpack', 'eslint'],
      languages: { TypeScript: 10, JavaScript: 5, CSS: 3 },
    };

    const result = generateSummary(input);

    expect(result).toContain('Languages:');
    expect(result).toContain('Technologies:');
    expect(result).toContain('TypeScript (10)');
    expect(result).toContain('JavaScript (5)');
    expect(result).toContain('react');
  });

  it('should generate summary for minimal stack', () => {
    const input: StackData = {
      techs: ['react'],
      languages: { JavaScript: 2 },
    };

    const result = generateSummary(input);

    expect(result).toContain('Languages: JavaScript (2)');
    expect(result).toContain('Technologies: react');
  });

  it('should handle stack with languages but no techs', () => {
    const input: StackData = {
      techs: [],
      languages: { JavaScript: 5, TypeScript: 3 },
    };

    const result = generateSummary(input);

    expect(result).toContain('Languages: JavaScript (5), TypeScript (3)');
    expect(result).toContain('Technologies: minimal or none detected');
  });

  it('should handle empty stack', () => {
    const input: StackData = {
      techs: [],
      languages: {},
    };

    const result = generateSummary(input);

    expect(result).toBe('No significant tech stack detected');
  });

  it('should handle null input', () => {
    const result = generateSummary(null);

    expect(result).toBe('No significant tech stack detected');
  });

  it('should handle undefined input', () => {
    const result = generateSummary(undefined);

    expect(result).toBe('No significant tech stack detected');
  });

  it('should limit techs to 10 items', () => {
    const techs = Array.from({ length: 15 }, (_, i) => `tech-${i}`);
    const input: StackData = {
      techs,
      languages: { JavaScript: 5 },
    };

    const result = generateSummary(input);

    expect(result).toContain('tech-0'); // Should include first tech
    expect(result).toContain('tech-9'); // Should include 10th tech
    expect(result).not.toContain('tech-10'); // Should not include 11th tech
  });

  it('should remove duplicate techs', () => {
    const input: StackData = {
      techs: ['react', 'react', 'typescript', 'react'],
      languages: { TypeScript: 5 },
    };

    const result = generateSummary(input);

    // Should not contain duplicate techs
    const reactCount = (result.match(/react/g) || []).length;
    expect(reactCount).toBe(1);
  });

  it('should be deterministic', () => {
    const input: StackData = {
      techs: ['react', 'typescript'],
      languages: { TypeScript: 10, JavaScript: 5 },
    };

    const result1 = generateSummary(input);
    const result2 = generateSummary(input);

    expect(result1).toBe(result2);
  });
});

describe('generateDetailedSummary', () => {
  it('should generate detailed summary with counts', () => {
    const input: StackData = {
      techs: ['react', 'typescript', 'jest'],
      languages: { TypeScript: 10, JavaScript: 5, CSS: 3 },
    };

    const result = generateDetailedSummary(input);

    expect(result).toContain('3 technologies');
    expect(result).toContain('3 languages');
    expect(result).toContain('18 files');
  });

  it('should handle empty stack', () => {
    const input: StackData = {
      techs: [],
      languages: {},
    };

    const result = generateDetailedSummary(input);

    expect(result).toContain('0 technologies');
    expect(result).toContain('0 languages');
    expect(result).toContain('0 files');
  });

  it('should handle null input', () => {
    const result = generateDetailedSummary(null);

    expect(result).toBe('No tech stack data available');
  });
});

describe('generateConciseSummary', () => {
  it('should generate concise summary within limit', () => {
    const input: StackData = {
      techs: ['react', 'typescript', 'jest', 'webpack', 'eslint'],
      languages: { TypeScript: 10 },
    };

    const result = generateConciseSummary(input, 30);

    expect(result.length).toBeLessThanOrEqual(30);
    expect(result).toContain('5 techs');
    expect(result).toContain('react');
  });

  it('should truncate with ellipsis when needed', () => {
    const techs = [
      'very-long-technology-name-1',
      'very-long-technology-name-2',
    ];
    const input: StackData = {
      techs,
      languages: { TypeScript: 10 },
    };

    const result = generateConciseSummary(input, 20);

    expect(result).toContain('...');
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('should handle empty techs', () => {
    const input: StackData = {
      techs: [],
      languages: { JavaScript: 5 },
    };

    const result = generateConciseSummary(input);

    expect(result).toBe('Minimal tech stack');
  });

  it('should handle null input', () => {
    const result = generateConciseSummary(null);

    expect(result).toBe('Minimal tech stack');
  });
});

describe('validateSummary', () => {
  it('should validate correct summary', () => {
    const summary =
      'Languages: TypeScript (10), JavaScript (5). Technologies: react, typescript';

    expect(validateSummary(summary)).toBe(true);
  });

  it('should reject empty summary', () => {
    expect(validateSummary('')).toBe(false);
  });

  it('should reject too long summary', () => {
    const longSummary = 'a'.repeat(501);

    expect(validateSummary(longSummary)).toBe(false);
  });

  it('should reject summary with undefined', () => {
    expect(validateSummary('This contains undefined content')).toBe(false);
  });

  it('should reject summary with null', () => {
    expect(validateSummary('This contains null content')).toBe(false);
  });

  it('should reject non-string input', () => {
    expect(validateSummary(123 as any)).toBe(false);
    expect(validateSummary({} as any)).toBe(false);
    expect(validateSummary([] as any)).toBe(false);
  });

  it('should accept valid edge cases', () => {
    expect(validateSummary('A')).toBe(true); // Minimum valid length
    expect(validateSummary('a'.repeat(500))).toBe(true); // Maximum valid length
  });
});

describe('Edge Cases', () => {
  it('should handle zero language counts', () => {
    const input: StackData = {
      techs: ['react'],
      languages: { TypeScript: 0, JavaScript: 0 },
    };

    const result = generateSummary(input);

    expect(result).toContain('TypeScript (0)');
    expect(result).toContain('JavaScript (0)');
  });

  it('should handle negative language counts', () => {
    const input: StackData = {
      techs: ['react'],
      languages: { TypeScript: -5, JavaScript: 10 },
    };

    const result = generateSummary(input);

    expect(result).toContain('TypeScript (-5)');
    expect(result).toContain('JavaScript (10)');
  });

  it('should handle very large counts', () => {
    const input: StackData = {
      techs: ['react'],
      languages: { TypeScript: 999999 },
    };

    const result = generateSummary(input);

    expect(result).toContain('TypeScript (999999)');
  });

  it('should handle special characters in tech names', () => {
    const input: StackData = {
      techs: ['@tanstack/react-query', 'vue-router', 'express.js'],
      languages: { TypeScript: 10 },
    };

    const result = generateSummary(input);

    expect(result).toContain('@tanstack/react-query');
    expect(result).toContain('vue-router');
    expect(result).toContain('express.js');
  });
});
