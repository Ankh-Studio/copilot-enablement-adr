/**
 * Error Handling System for Assessment Pipeline
 *
 * Provides comprehensive error handling, reporting, and recovery strategies
 * for the AI enablement assessment process.
 */

export enum ErrorType {
  REPOSITORY_ACCESS = 'REPOSITORY_ACCESS',
  GITHUB_API = 'GITHUB_API',
  TECH_STACK_ANALYSIS = 'TECH_STACK_ANALYSIS',
  SECURITY_SCAN = 'SECURITY_SCAN',
  ARTIFACT_DETECTION = 'ARTIFACT_DETECTION',
  NETWORK_CONNECTIVITY = 'NETWORK_CONNECTIVITY',
  FILE_PERMISSIONS = 'FILE_PERMISSIONS',
  INVALID_INPUT = 'INVALID_INPUT',
  COPILLOT_SDK = 'COPILOT_SDK',
}

export interface AssessmentError {
  type: ErrorType;
  message: string;
  cause?: Error;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  fallback?: string;
}

export interface ErrorReport {
  errors: AssessmentError[];
  warnings: AssessmentError[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    recoverable: number;
  };
  impact: string;
  recommendations: string[];
}

export class AssessmentErrorHandler {
  /**
   * Create standardized error objects
   */
  static createError(
    type: ErrorType,
    message: string,
    cause?: Error,
    context?: Record<string, unknown>,
    severity: AssessmentError['severity'] = 'medium'
  ): AssessmentError {
    return {
      type,
      message,
      cause,
      context,
      severity,
      recoverable: this.isRecoverable(type, severity),
      fallback: this.getFallbackMessage(type),
    };
  }

  /**
   * Determine if error is recoverable
   */
  private static isRecoverable(
    type: ErrorType,
    severity: AssessmentError['severity']
  ): boolean {
    const recoverableTypes = [
      ErrorType.GITHUB_API,
      ErrorType.NETWORK_CONNECTIVITY,
      ErrorType.TECH_STACK_ANALYSIS,
      ErrorType.SECURITY_SCAN,
      ErrorType.ARTIFACT_DETECTION,
    ];

    const nonRecoverableSeverities = ['critical'];

    return (
      recoverableTypes.includes(type) &&
      !nonRecoverableSeverities.includes(severity)
    );
  }

  /**
   * Get fallback message for error type
   */
  private static getFallbackMessage(type: ErrorType): string {
    const fallbacks = {
      [ErrorType.REPOSITORY_ACCESS]: 'Using basic file system analysis only',
      [ErrorType.GITHUB_API]:
        'Security features not verified - manual review recommended',
      [ErrorType.TECH_STACK_ANALYSIS]: 'Using manual technology detection',
      [ErrorType.SECURITY_SCAN]:
        'Security assessment based on visible files only',
      [ErrorType.ARTIFACT_DETECTION]: 'Artifact detection may be incomplete',
      [ErrorType.NETWORK_CONNECTIVITY]: 'Working in offline mode',
      [ErrorType.FILE_PERMISSIONS]: 'Analysis limited to accessible files',
      [ErrorType.INVALID_INPUT]: 'Using default parameters',
      [ErrorType.COPILLOT_SDK]:
        'Using simplified analysis without AI assistance',
    };

    return fallbacks[type] || 'Continuing with limited functionality';
  }

  /**
   * Handle repository access errors
   */
  static handleRepositoryError(
    error: Error,
    repoPath: string
  ): AssessmentError {
    if (error.message.includes('ENOENT')) {
      return this.createError(
        ErrorType.REPOSITORY_ACCESS,
        `Repository not found at path: ${repoPath}`,
        error,
        { repoPath },
        'critical'
      );
    }

    if (error.message.includes('EACCES')) {
      return this.createError(
        ErrorType.FILE_PERMISSIONS,
        `Permission denied accessing repository: ${repoPath}`,
        error,
        { repoPath },
        'high'
      );
    }

    return this.createError(
      ErrorType.REPOSITORY_ACCESS,
      `Repository access error: ${error.message}`,
      error,
      { repoPath },
      'medium'
    );
  }

  /**
   * Handle GitHub API errors
   */
  static handleGitHubError(error: Error, githubUrl?: string): AssessmentError {
    if (error.message.includes('401') || error.message.includes('403')) {
      return this.createError(
        ErrorType.GITHUB_API,
        'GitHub authentication failed - invalid or missing token',
        error,
        { githubUrl },
        'medium'
      );
    }

    if (error.message.includes('404')) {
      return this.createError(
        ErrorType.GITHUB_API,
        'GitHub repository not found or not accessible',
        error,
        { githubUrl },
        'medium'
      );
    }

    if (error.message.includes('rate limit')) {
      return this.createError(
        ErrorType.GITHUB_API,
        'GitHub API rate limit exceeded - try again later',
        error,
        { githubUrl },
        'low'
      );
    }

    return this.createError(
      ErrorType.GITHUB_API,
      `GitHub API error: ${error.message}`,
      error,
      { githubUrl },
      'medium'
    );
  }

  /**
   * Handle tech stack analysis errors
   */
  static handleTechStackError(error: Error, repoPath: string): AssessmentError {
    return this.createError(
      ErrorType.TECH_STACK_ANALYSIS,
      `Tech stack analysis failed: ${error.message}`,
      error,
      { repoPath },
      'medium'
    );
  }

  /**
   * Handle security scanning errors
   */
  static handleSecurityError(
    error: Error,
    githubUrl?: string
  ): AssessmentError {
    return this.createError(
      ErrorType.SECURITY_SCAN,
      `Security scan failed: ${error.message}`,
      error,
      { githubUrl },
      'medium'
    );
  }

  /**
   * Handle artifact detection errors
   */
  static handleArtifactError(error: Error, repoPath: string): AssessmentError {
    return this.createError(
      ErrorType.ARTIFACT_DETECTION,
      `Artifact detection failed: ${error.message}`,
      error,
      { repoPath },
      'low'
    );
  }

  /**
   * Handle Copilot SDK errors
   */
  static handleCopilotError(error: Error): AssessmentError {
    return this.createError(
      ErrorType.COPILLOT_SDK,
      `Copilot SDK error: ${error.message}`,
      error,
      {},
      'high'
    );
  }

  /**
   * Generate comprehensive error report
   */
  static generateReport(errors: AssessmentError[]): ErrorReport {
    const critical = errors.filter(e => e.severity === 'critical');
    const high = errors.filter(e => e.severity === 'high');
    const medium = errors.filter(e => e.severity === 'medium');
    const low = errors.filter(e => e.severity === 'low');
    const recoverable = errors.filter(e => e.recoverable);

    const summary = {
      total: errors.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      recoverable: recoverable.length,
    };

    const impact = this.assessImpact(summary);
    const recommendations = this.generateRecommendations(errors);

    return {
      errors,
      warnings: errors.filter(e => e.severity === 'low'),
      summary,
      impact,
      recommendations,
    };
  }

  /**
   * Assess overall impact of errors
   */
  private static assessImpact(summary: ErrorReport['summary']): string {
    if (summary.critical > 0) {
      return 'Critical errors prevent complete assessment - manual intervention required';
    }

    if (summary.high > 2) {
      return 'Multiple high-impact errors significantly reduce assessment quality';
    }

    if (summary.high > 0 || summary.medium > 3) {
      return 'Assessment quality reduced but still usable with caution';
    }

    if (summary.medium > 0) {
      return 'Minor impact on assessment - some features may be limited';
    }

    if (summary.low > 0) {
      return 'Minimal impact - assessment proceeds with minor limitations';
    }

    return 'No significant errors detected';
  }

  /**
   * Generate error-specific recommendations
   */
  private static generateRecommendations(errors: AssessmentError[]): string[] {
    const recommendations = new Set<string>();

    errors.forEach(error => {
      switch (error.type) {
        case ErrorType.REPOSITORY_ACCESS:
          recommendations.add(
            '📁 Verify repository path exists and is accessible'
          );
          recommendations.add(
            '🔐 Check file permissions for the repository directory'
          );
          break;

        case ErrorType.GITHUB_API:
          recommendations.add('🔑 Provide valid GitHub personal access token');
          recommendations.add(
            '🌐 Verify GitHub repository URL is correct and accessible'
          );
          recommendations.add(
            '⏰ Wait for GitHub API rate limit to reset if exceeded'
          );
          break;

        case ErrorType.TECH_STACK_ANALYSIS:
          recommendations.add(
            '📦 Ensure package.json, requirements.txt, or similar files exist'
          );
          recommendations.add(
            '🔍 Check that repository contains recognizable technology files'
          );
          break;

        case ErrorType.SECURITY_SCAN:
          recommendations.add(
            '🔗 Provide GitHub repository URL for security analysis'
          );
          recommendations.add(
            '🛡️  Manually verify security features if automated scan fails'
          );
          break;

        case ErrorType.ARTIFACT_DETECTION:
          recommendations.add(
            '📂 Check file permissions for repository subdirectories'
          );
          recommendations.add(
            '🔍 Ensure repository contains standard project structure'
          );
          break;

        case ErrorType.COPILLOT_SDK:
          recommendations.add(
            '🤖 Verify Copilot CLI is installed and authenticated'
          );
          recommendations.add('🔄 Try restarting the assessment process');
          break;

        case ErrorType.NETWORK_CONNECTIVITY:
          recommendations.add('🌐 Check internet connection');
          recommendations.add('🔄 Retry assessment when connection is stable');
          break;

        case ErrorType.FILE_PERMISSIONS:
          recommendations.add('🔐 Check read permissions for repository files');
          recommendations.add(
            '👤 Run assessment with appropriate user privileges'
          );
          break;
      }
    });

    return Array.from(recommendations);
  }

  /**
   * Format error report for display in ADR
   */
  static formatForADR(report: ErrorReport): string {
    const sections = [
      '## Error Assessment',
      '',
      `### Overall Impact: ${report.impact}`,
      '',
      '### Error Summary',
      `- Total Errors: ${report.summary.total}`,
      `- Critical: ${report.summary.critical}`,
      `- High: ${report.summary.high}`,
      `- Medium: ${report.summary.medium}`,
      `- Low: ${report.summary.low}`,
      `- Recoverable: ${report.summary.recoverable}`,
      '',
    ];

    if (report.errors.length > 0) {
      sections.push('### Specific Errors');
      report.errors.forEach(error => {
        sections.push(
          `**${error.type}** (${error.severity}): ${error.message}`
        );
        if (error.fallback) {
          sections.push(`- Fallback: ${error.fallback}`);
        }
      });
      sections.push('');
    }

    if (report.recommendations.length > 0) {
      sections.push('### Error Resolution Recommendations');
      report.recommendations.forEach(rec => sections.push(`- ${rec}`));
      sections.push('');
    }

    return sections.join('\n');
  }
}
