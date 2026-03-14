/**
 * Data Quality Validator for Assessment Pipeline
 *
 * This module validates data completeness and provides transparency
 * about missing or incomplete data in the assessment process.
 */

export interface DataQualityReport {
  completeness: {
    techStack: 'complete' | 'partial' | 'missing';
    githubSecurity: 'complete' | 'partial' | 'missing';
    documentation: 'complete' | 'partial' | 'missing';
    testing: 'complete' | 'partial' | 'missing';
  };
  confidence: {
    overall: 'high' | 'medium' | 'low';
    techStack: 'high' | 'medium' | 'low';
    security: 'high' | 'medium' | 'low';
    artifacts: 'high' | 'medium' | 'low';
  };
  missingData: string[];
  limitations: string[];
  recommendations: string[];
}

export class DataQualityValidator {
  /**
   * Validate tech stack data completeness
   */
  static validateTechStack(
    analysis: any
  ): DataQualityReport['completeness']['techStack'] {
    if (!analysis || !analysis.detected) return 'missing';

    const techCount = analysis.detected.techs?.length || 0;
    const langCount = Object.keys(analysis.detected.languages || {}).length;

    if (techCount > 5 && langCount > 1) return 'complete';
    if (techCount > 2 && langCount > 0) return 'partial';
    return 'missing';
  }

  /**
   * Validate GitHub security data availability
   */
  static validateGitHubSecurity(
    securityAnalysis: any
  ): DataQualityReport['completeness']['githubSecurity'] {
    if (!securityAnalysis || !securityAnalysis.available) return 'missing';

    const features = securityAnalysis.features;
    const featureCount = Object.keys(features || {}).filter(
      key => features[key]
    ).length;

    if (featureCount >= 3) return 'complete';
    if (featureCount >= 1) return 'partial';
    return 'missing';
  }

  /**
   * Validate documentation completeness
   */
  static validateDocumentation(
    artifacts: any
  ): DataQualityReport['completeness']['documentation'] {
    if (!artifacts || artifacts.documentationFiles?.length === 0)
      return 'missing';

    const docCount = artifacts.documentationFiles?.length || 0;
    const hasReadme = artifacts.documentationFiles.some((file: string) =>
      file.toLowerCase().includes('readme')
    );

    if (docCount > 2 && hasReadme) return 'complete';
    if (docCount > 0) return 'partial';
    return 'missing';
  }

  /**
   * Validate testing setup completeness
   */
  static validateTesting(
    artifacts: any
  ): DataQualityReport['completeness']['testing'] {
    if (!artifacts || artifacts.testFiles?.length === 0) return 'missing';

    const testCount = artifacts.testFiles?.length || 0;
    const hasConfig = artifacts.configFiles?.some(
      (file: string) =>
        file.includes('jest') ||
        file.includes('vitest') ||
        file.includes('cypress')
    );

    if (testCount > 5 && hasConfig) return 'complete';
    if (testCount > 0) return 'partial';
    return 'missing';
  }

  /**
   * Calculate overall confidence based on data completeness
   */
  static calculateConfidence(
    completeness: DataQualityReport['completeness']
  ): DataQualityReport['confidence'] {
    const scores = {
      complete: 3,
      partial: 2,
      missing: 1,
    };

    const totalScore = Object.values(completeness).reduce(
      (sum, value) => sum + scores[value],
      0
    );
    const maxScore = Object.keys(completeness).length * 3;
    const confidenceRatio = totalScore / maxScore;

    if (confidenceRatio > 0.7)
      return {
        overall: 'high',
        techStack: 'high',
        security: 'high',
        artifacts: 'high',
      };
    if (confidenceRatio > 0.4)
      return {
        overall: 'medium',
        techStack: 'medium',
        security: 'medium',
        artifacts: 'medium',
      };
    return {
      overall: 'low',
      techStack: 'low',
      security: 'low',
      artifacts: 'low',
    };
  }

  /**
   * Generate missing data warnings
   */
  static generateMissingDataWarnings(
    completeness: DataQualityReport['completeness']
  ): string[] {
    const warnings: string[] = [];

    if (completeness.techStack === 'missing') {
      warnings.push(
        '⚠️  Tech stack analysis failed - limited technology detection'
      );
    }

    if (completeness.githubSecurity === 'missing') {
      warnings.push(
        '⚠️  GitHub security data unavailable - cannot verify CodeQL, Dependabot, or Secret Scanning'
      );
    }

    if (completeness.documentation === 'missing') {
      warnings.push(
        '⚠️  No documentation detected - cannot assess documentation quality'
      );
    }

    if (completeness.testing === 'missing') {
      warnings.push(
        '⚠️  No test files detected - cannot assess testing maturity'
      );
    }

    return warnings;
  }

  /**
   * Generate limitation statements
   */
  static generateLimitations(
    completeness: DataQualityReport['completeness']
  ): string[] {
    const limitations: string[] = [];

    if (completeness.githubSecurity !== 'complete') {
      limitations.push(
        'Security assessment limited by GitHub access availability'
      );
    }

    if (completeness.techStack !== 'complete') {
      limitations.push(
        'Technology assessment may be incomplete due to detection limitations'
      );
    }

    if (completeness.documentation !== 'complete') {
      limitations.push(
        'Documentation assessment based on available files only'
      );
    }

    if (completeness.testing !== 'complete') {
      limitations.push('Testing assessment based on visible test files only');
    }

    return limitations;
  }

  /**
   * Generate data quality recommendations
   */
  static generateRecommendations(
    completeness: DataQualityReport['completeness']
  ): string[] {
    const recommendations: string[] = [];

    if (completeness.githubSecurity === 'missing') {
      recommendations.push(
        '🔗 Provide GitHub repository URL and access token for security analysis'
      );
    }

    if (completeness.techStack === 'missing') {
      recommendations.push(
        '📁 Ensure repository contains package.json, requirements.txt, or similar dependency files'
      );
    }

    if (completeness.documentation === 'missing') {
      recommendations.push(
        '📚 Add README.md and documentation files for better assessment'
      );
    }

    if (completeness.testing === 'missing') {
      recommendations.push(
        '🧪 Add test files and testing configuration for complete assessment'
      );
    }

    return recommendations;
  }

  /**
   * Generate comprehensive data quality report
   */
  static generateReport(
    techStackAnalysis: any,
    securityAnalysis: any,
    artifactAnalysis: any
  ): DataQualityReport {
    const completeness = {
      techStack: this.validateTechStack(techStackAnalysis),
      githubSecurity: this.validateGitHubSecurity(securityAnalysis),
      documentation: this.validateDocumentation(artifactAnalysis),
      testing: this.validateTesting(artifactAnalysis),
    };

    const confidence = this.calculateConfidence(completeness);
    const missingData = this.generateMissingDataWarnings(completeness);
    const limitations = this.generateLimitations(completeness);
    const recommendations = this.generateRecommendations(completeness);

    return {
      completeness,
      confidence,
      missingData,
      limitations,
      recommendations,
    };
  }

  /**
   * Format data quality report for display in ADR
   */
  static formatForADR(report: DataQualityReport): string {
    const sections = [
      '## Data Quality Assessment',
      '',
      '### Data Completeness',
      `- **Tech Stack**: ${report.completeness.techStack}`,
      `- **GitHub Security**: ${report.completeness.githubSecurity}`,
      `- **Documentation**: ${report.completeness.documentation}`,
      `- **Testing**: ${report.completeness.testing}`,
      '',
      `### Overall Confidence: ${report.confidence.overall.toUpperCase()}`,
      '',
    ];

    if (report.missingData.length > 0) {
      sections.push('### Missing Data Warnings');
      report.missingData.forEach(warning => sections.push(`- ${warning}`));
      sections.push('');
    }

    if (report.limitations.length > 0) {
      sections.push('### Assessment Limitations');
      report.limitations.forEach(limitation =>
        sections.push(`- ${limitation}`)
      );
      sections.push('');
    }

    if (report.recommendations.length > 0) {
      sections.push('### Data Quality Recommendations');
      report.recommendations.forEach(rec => sections.push(`- ${rec}`));
      sections.push('');
    }

    return sections.join('\n');
  }
}
