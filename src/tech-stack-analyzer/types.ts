/**
 * Tech Stack Analyzer Types
 *
 * Shared interfaces for tech stack analysis components
 */

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface StackData {
  techs: string[];
  languages: Record<string, number>;
}

export interface TechnologyCategories {
  languages: string[];
  frameworks: string[];
  databases: string[];
  infrastructure: string[];
  buildTools: string[];
  testing: string[];
}

export interface TechStackAnalysis {
  detected: StackData | null;
  flat: any;
  summary: string;
  confidence: ConfidenceLevel;
}

export interface AnalyzerResult {
  detected: StackData | null;
  flat: any;
  summary: string;
  confidence: ConfidenceLevel;
  categories?: TechnologyCategories;
}
