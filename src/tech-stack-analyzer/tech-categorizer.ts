/**
 * Technology Categorizer
 *
 * Pure function for categorizing technologies into logical groups
 */

import { TechnologyCategories } from './types';

/**
 * Categorize technologies based on common patterns
 *
 * @param techs - Array of technology names
 * @returns Categorized technologies
 */
export function categorizeTechnologies(techs: string[]): TechnologyCategories {
  const categories: TechnologyCategories = {
    languages: [],
    frameworks: [],
    databases: [],
    infrastructure: [],
    buildTools: [],
    testing: [],
  };

  // Categorize technologies based on common patterns
  techs.forEach((tech: string) => {
    const lower = tech.toLowerCase();

    // Framework patterns
    if (
      lower.includes('react') ||
      lower.includes('vue') ||
      lower.includes('angular') ||
      lower.includes('svelte') ||
      lower.includes('next') ||
      lower.includes('nuxt') ||
      lower.includes('express') ||
      lower.includes('koa') ||
      lower.includes('fastify')
    ) {
      categories.frameworks.push(tech);
    }
    // Database patterns
    else if (
      lower.includes('postgres') ||
      lower.includes('mongo') ||
      lower.includes('mysql') ||
      lower.includes('sqlite') ||
      lower.includes('redis') ||
      lower.includes('cassandra') ||
      lower.includes('mongoose') ||
      lower.includes('pg') ||
      lower.includes('prisma')
    ) {
      categories.databases.push(tech);
    }
    // Infrastructure patterns
    else if (
      lower.includes('docker') ||
      lower.includes('k8s') ||
      lower.includes('kubernetes') ||
      lower.includes('terraform') ||
      lower.includes('helm') ||
      lower.includes('aws') ||
      lower.includes('azure') ||
      lower.includes('gcp')
    ) {
      categories.infrastructure.push(tech);
    }
    // Build tools patterns
    else if (
      lower.includes('webpack') ||
      lower.includes('vite') ||
      lower.includes('babel') ||
      lower.includes('rollup') ||
      lower.includes('parcel') ||
      lower.includes('esbuild') ||
      lower.includes('turbopack') ||
      lower.includes('swc')
    ) {
      categories.buildTools.push(tech);
    }
    // Testing patterns
    else if (
      lower.includes('jest') ||
      lower.includes('mocha') ||
      lower.includes('cypress') ||
      lower.includes('vitest') ||
      lower.includes('playwright') ||
      lower.includes('testing-library') ||
      lower.includes('jasmine') ||
      lower.includes('karma') ||
      lower.includes('supertest')
    ) {
      categories.testing.push(tech);
    }
    // Consider npm/nodejs as build tools in this context
    else if (lower.includes('npm') || lower.includes('nodejs')) {
      categories.buildTools.push(tech);
    }
    // Consider eslint/prettier as build tools (dev tools)
    else if (lower.includes('eslint') || lower.includes('prettier')) {
      categories.buildTools.push(tech);
    }
    // Languages (catch-all for programming languages)
    else if (
      lower.includes('javascript') ||
      lower.includes('typescript') ||
      lower.includes('python') ||
      lower.includes('java') ||
      lower.includes('c++') ||
      lower.includes('c#') ||
      lower.includes('go') ||
      lower.includes('rust') ||
      lower.includes('php') ||
      lower.includes('ruby')
    ) {
      categories.languages.push(tech);
    }
  });

  return categories;
}

/**
 * Get primary category for a technology
 *
 * @param tech - Technology name
 * @returns Primary category name
 */
export function getPrimaryCategory(
  tech: string
): keyof TechnologyCategories | 'other' {
  const categories = categorizeTechnologies([tech]);

  for (const [category, items] of Object.entries(categories)) {
    if (items.includes(tech)) {
      return category as keyof TechnologyCategories;
    }
  }

  return 'other';
}

/**
 * Get technology count by category
 *
 * @param categories - Categorized technologies
 * @returns Count of technologies per category
 */
export function getCategoryCounts(
  categories: TechnologyCategories
): Record<keyof TechnologyCategories, number> {
  return {
    languages: categories.languages.length,
    frameworks: categories.frameworks.length,
    databases: categories.databases.length,
    infrastructure: categories.infrastructure.length,
    buildTools: categories.buildTools.length,
    testing: categories.testing.length,
  };
}

/**
 * Validate categorization
 *
 * @param techs - Input technologies
 * @param categories - Output categories
 * @returns Whether categorization is valid
 */
export function validateCategorization(
  techs: string[],
  categories: TechnologyCategories
): boolean {
  const totalCategorized = Object.values(categories).reduce(
    (sum, items) => sum + items.length,
    0
  );
  const duplicates = new Set();

  // Check for duplicates
  for (const items of Object.values(categories)) {
    for (const item of items) {
      if (duplicates.has(item)) return false;
      duplicates.add(item);
    }
  }

  // Check if all original techs are categorized (allowing for uncategorized)
  return totalCategorized <= techs.length;
}
