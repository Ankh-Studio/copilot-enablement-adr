/**
 * Data Processor
 *
 * Pure function for processing raw analyzer results into structured data
 */

import { StackData } from './types';

/**
 * Extract tech stack data from raw analyzer result
 *
 * @param analyzerResult - Raw result from stack analyzer
 * @returns Structured stack data
 */
export function extractStackData(analyzerResult: any): StackData | null {
  if (!analyzerResult) return null;

  let extractedTechs: string[] = [];
  let extractedLanguages: Record<string, number> = {};

  // Look for techs and languages in child nodes
  const extractFromNode = (node: any) => {
    if (node.techs && Array.isArray(node.techs)) {
      extractedTechs = [...extractedTechs, ...node.techs];
    }
    if (node.languages && typeof node.languages === 'object') {
      extractedLanguages = { ...extractedLanguages, ...node.languages };
    }
    if (node.childs && Array.isArray(node.childs)) {
      node.childs.forEach(extractFromNode);
    }
  };

  extractFromNode(analyzerResult);

  // Create a flattened structure for our use
  const flattenedData: StackData = {
    techs: [...new Set(extractedTechs)], // Remove duplicates
    languages: extractedLanguages,
  };

  return flattenedData;
}

/**
 * Validate extracted stack data
 *
 * @param stackData - Extracted stack data
 * @returns Whether data is valid
 */
export function validateStackData(stackData: StackData | null): boolean {
  if (!stackData) return false;

  // Should have required structure
  if (!Array.isArray(stackData.techs)) return false;
  if (typeof stackData.languages !== 'object') return false;
  if (stackData.languages === null) return false;

  // Tech array should contain strings
  if (!stackData.techs.every(tech => typeof tech === 'string')) return false;

  // Languages should have string keys and number values
  for (const [lang, count] of Object.entries(stackData.languages)) {
    if (typeof lang !== 'string') return false;
    if (typeof count !== 'number') return false;
  }

  return true;
}

/**
 * Clean and normalize stack data
 *
 * @param stackData - Raw stack data
 * @returns Cleaned stack data
 */
export function cleanStackData(stackData: StackData): StackData {
  return {
    techs: stackData.techs
      .filter(tech => tech && typeof tech === 'string') // Remove invalid entries
      .map(tech => tech.trim()) // Clean whitespace
      .filter(tech => tech.length > 0) // Remove empty strings
      .sort(), // Sort for consistency
    languages: Object.fromEntries(
      Object.entries(stackData.languages)
        .filter(
          ([lang, count]) =>
            lang && typeof lang === 'string' && typeof count === 'number'
        )
        .map(([lang, count]) => [lang.trim(), count])
        .sort(([a], [b]) => String(a).localeCompare(String(b)))
    ),
  };
}

/**
 * Get statistics about stack data
 *
 * @param stackData - Stack data
 * @returns Statistics object
 */
export function getStackDataStats(stackData: StackData | null): {
  techCount: number;
  languageCount: number;
  totalFiles: number;
  hasData: boolean;
} {
  if (!stackData) {
    return {
      techCount: 0,
      languageCount: 0,
      totalFiles: 0,
      hasData: false,
    };
  }

  const techCount = stackData.techs?.length || 0;
  const languageCount = Object.keys(stackData.languages || {}).length;
  const totalFiles = Object.values(stackData.languages || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  return {
    techCount,
    languageCount,
    totalFiles,
    hasData: techCount > 0 || languageCount > 0,
  };
}
