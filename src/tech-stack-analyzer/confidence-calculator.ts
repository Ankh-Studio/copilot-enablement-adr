/**
 * Confidence Calculator
 *
 * Pure function for assessing confidence levels in tech stack analysis
 */

import { StackData, ConfidenceLevel } from './types';

/**
 * Calculate confidence level based on tech stack completeness
 *
 * @param stackData - The detected tech stack data
 * @returns Confidence level (high/medium/low)
 */
export function calculateConfidence(
  stackData: StackData | null | undefined
): ConfidenceLevel {
  if (!stackData || !stackData.techs) return 'low';

  const techCount = stackData.techs?.length || 0;
  const langCount = Object.keys(stackData.languages || {}).length;

  // More realistic confidence thresholds
  if (techCount >= 5 && langCount >= 1) return 'high';
  if (techCount >= 2 && langCount >= 1) return 'medium';
  if (techCount >= 1 || langCount >= 1) return 'low';
  return 'low';
}

/**
 * Get confidence score as numeric value (0-1)
 *
 * @param confidence - Confidence level
 * @returns Numeric confidence score
 */
export function getConfidenceScore(confidence: ConfidenceLevel): number {
  switch (confidence) {
    case 'high':
      return 0.9;
    case 'medium':
      return 0.7;
    case 'low':
      return 0.5;
    default:
      return 0.3;
  }
}

/**
 * Validate confidence assessment
 *
 * @param stackData - Input data
 * @param confidence - Calculated confidence
 * @returns Whether confidence seems appropriate
 */
export function validateConfidence(
  stackData: StackData | null | undefined,
  confidence: ConfidenceLevel
): boolean {
  if (!stackData || !stackData.techs) {
    return confidence === 'low';
  }

  const techCount = stackData.techs.length;
  const langCount = Object.keys(stackData.languages || {}).length;

  switch (confidence) {
    case 'high':
      return techCount >= 5 && langCount >= 1;
    case 'medium':
      return techCount >= 2 && langCount >= 1;
    case 'low':
      return true; // Any valid data can have low confidence
    default:
      return false;
  }
}
