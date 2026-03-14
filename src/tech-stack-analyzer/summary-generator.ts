/**
 * Summary Generator
 *
 * Pure function for generating human-readable tech stack summaries
 */

import { StackData } from './types';

/**
 * Generate a human-readable summary of the tech stack
 *
 * @param stackData - The detected tech stack data
 * @returns Formatted summary string
 */
export function generateSummary(
  stackData: StackData | null | undefined
): string {
  if (!stackData) {
    return 'No significant tech stack detected';
  }

  const hasLanguages =
    stackData.languages && Object.keys(stackData.languages).length > 0;
  const hasTechs = stackData.techs && stackData.techs.length > 0;

  if (!hasLanguages && !hasTechs) {
    return 'No significant tech stack detected';
  }

  const languages = hasLanguages
    ? Object.entries(stackData.languages)
        .map(([lang, count]) => `${lang} (${count})`)
        .join(', ')
    : '';

  const techs = hasTechs
    ? [...new Set(stackData.techs)].slice(0, 10).join(', ')
    : 'minimal or none detected';

  if (hasLanguages && !hasTechs) {
    return `Languages: ${languages}. Technologies: ${techs}`;
  }

  return `Languages: ${languages}. Technologies: ${techs}`;
}

/**
 * Generate a detailed summary with counts
 *
 * @param stackData - The detected tech stack data
 * @returns Detailed summary with statistics
 */
export function generateDetailedSummary(
  stackData: StackData | null | undefined
): string {
  if (!stackData) {
    return 'No tech stack data available';
  }

  const techCount = stackData.techs?.length || 0;
  const langCount = Object.keys(stackData.languages || {}).length;
  const totalFiles = Object.values(stackData.languages || {}).reduce(
    (sum, count) => sum + count,
    0
  );

  return `Detected ${techCount} technologies across ${langCount} languages (${totalFiles} files total)`;
}

/**
 * Generate a concise summary for UI display
 *
 * @param stackData - The detected tech stack data
 * @param maxLength - Maximum length of summary
 * @returns Concise summary string
 */
export function generateConciseSummary(
  stackData: StackData | null | undefined,
  maxLength: number = 50
): string {
  if (!stackData || !stackData.techs || stackData.techs.length === 0) {
    return 'Minimal tech stack';
  }

  const topTechs = stackData.techs.slice(0, 3).join(', ');
  const summary = `${stackData.techs.length} techs: ${topTechs}`;

  return summary.length > maxLength
    ? `${summary.substring(0, maxLength - 3)}...`
    : summary;
}

/**
 * Validate summary format
 *
 * @param summary - Generated summary
 * @returns Whether summary format is valid
 */
export function validateSummary(summary: string): boolean {
  if (typeof summary !== 'string') return false;
  if (summary.length === 0) return false;
  if (summary.length > 500) return false; // Reasonable max length

  // Should contain meaningful content
  return !summary.includes('undefined') && !summary.includes('null');
}
