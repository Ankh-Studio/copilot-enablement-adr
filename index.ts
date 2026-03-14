/**
 * Copilot Enablement Assessment Plugin
 *
 * Minimal entry point that orchestrates deterministic business logic
 * with AI-powered analysis through the Copilot SDK
 */

import { AssessmentEngine, AssessmentOptions } from './src/assessment-core';

// Re-export for backward compatibility
export type { AssessmentOptions } from './src/assessment-core';

/**
 * Main plugin interface - thin orchestration layer
 *
 * This class serves as the clean entry point that:
 * 1. Provides a simple interface for consumers
 * 2. Delegates business logic to the AssessmentEngine
 * 3. Maintains backward compatibility
 * 4. Keeps the main index file minimal and focused
 */
export default class CopilotPoweredAssessment {
  private repoPath: string;
  private githubUrl?: string;
  private githubToken?: string;

  constructor(options: AssessmentOptions = {}) {
    this.repoPath = options.repoPath || process.cwd();
    this.githubUrl = options.githubUrl;
    this.githubToken = options.githubToken;
  }

  /**
   * Analyze repository for AI enablement readiness
   *
   * This method orchestrates the assessment by:
   * 1. Using deterministic business logic from src/
   * 2. Leveraging Copilot SDK for AI-driven analysis
   * 3. Providing structured, evidence-based results
   */
  async analyze(): Promise<string> {
    const engine = new AssessmentEngine();
    const result = await engine.runAssessment(
      this.repoPath,
      this.githubUrl,
      this.githubToken
    );

    return result.analysis;
  }

  /**
   * Generate Architecture Decision Record from analysis
   *
   * Uses the Copilot SDK to create consultant-quality documentation
   * based on the deterministic analysis results
   */
  async generateADR(analysis: string): Promise<string> {
    const engine = new AssessmentEngine();
    return engine.generateADR(analysis);
  }

  /**
   * Get detailed assessment results with metadata
   *
   * Provides access to the underlying data for advanced use cases
   */
  async getDetailedResults(): Promise<{
    analysis: string;
    errors: any[];
    dataQuality: any;
    errorReport: any;
  }> {
    const engine = new AssessmentEngine();
    return engine.runAssessment(
      this.repoPath,
      this.githubUrl,
      this.githubToken
    );
  }
}

// Export the AssessmentEngine for advanced use cases
export { AssessmentEngine } from './src/assessment-core';
