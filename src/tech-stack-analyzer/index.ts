/**
 * Tech Stack Analyzer Module
 *
 * Centralized exports for all tech stack analyzer functions
 */

// Types
export type {
  ConfidenceLevel,
  StackData,
  TechnologyCategories,
  TechStackAnalysis,
  AnalyzerResult,
} from './types';

// Core functions
export {
  calculateConfidence,
  getConfidenceScore,
  validateConfidence,
} from './confidence-calculator';
export {
  generateSummary,
  generateDetailedSummary,
  generateConciseSummary,
  validateSummary,
} from './summary-generator';
export {
  categorizeTechnologies,
  getPrimaryCategory,
  getCategoryCounts,
  validateCategorization,
} from './tech-categorizer';
export {
  extractStackData,
  validateStackData,
  cleanStackData,
  getStackDataStats,
} from './data-processor';
