/**
 * Skill Evaluation Reporter
 *
 * Generates comprehensive evaluation reports with visualizations,
 * trend analysis, and actionable recommendations for skill improvement
 */

import { promises as fs } from 'fs';
import path from 'path';
import { SkillEvalSummary, SkillEvalResult } from '../framework/eval-harness';

export interface EvalReportConfig {
  outputPath: string;
  includeVisualizations: boolean;
  includeTrendAnalysis: boolean;
  format: 'html' | 'json' | 'markdown';
}

export interface SkillEvaluationReport {
  metadata: {
    skillName: string;
    evaluationDate: string;
    frameworkVersion: string;
    totalTestCases: number;
    totalTrials: number;
  };
  summary: SkillEvalSummary;
  detailedResults: SkillEvalResult[];
  analysis: {
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
    riskFactors: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  visualizations?: {
    successRateChart: string;
    confidenceDistribution: string;
    performanceMetrics: string;
  };
}

export class EvalReporter {
  private config: EvalReportConfig;

  constructor(config: EvalReportConfig) {
    this.config = config;
  }

  /**
   * Generate comprehensive evaluation report
   */
  async generateReport(
    skillName: string,
    summary: SkillEvalSummary,
    results: SkillEvalResult[]
  ): Promise<string> {
    const report: SkillEvaluationReport = {
      metadata: {
        skillName,
        evaluationDate: new Date().toISOString(),
        frameworkVersion: '1.0.0',
        totalTestCases: summary.totalTests,
        totalTrials: results.length,
      },
      summary,
      detailedResults: results,
      analysis: this.analyzeResults(summary, results),
      recommendations: this.generateRecommendations(summary, results),
    };

    if (this.config.includeVisualizations) {
      report.visualizations = await this.generateVisualizations(results);
    }

    return this.formatReport(report);
  }

  /**
   * Analyze evaluation results to identify patterns
   */
  private analyzeResults(
    summary: SkillEvalSummary,
    results: SkillEvalResult[]
  ): SkillEvaluationReport['analysis'] {
    const analysis = {
      strengths: [] as string[],
      weaknesses: [] as string[],
      improvementAreas: [] as string[],
      riskFactors: [] as string[],
    };

    // Analyze success patterns
    if (summary.successRate > 0.9) {
      analysis.strengths.push('Excellent overall success rate');
    } else if (summary.successRate < 0.7) {
      analysis.weaknesses.push('Low success rate requires immediate attention');
    }

    // Analyze trigger accuracy
    if (summary.triggerAccuracy > 0.95) {
      analysis.strengths.push(
        'Precise trigger detection - minimal false positives/negatives'
      );
    } else if (summary.triggerAccuracy < 0.8) {
      analysis.weaknesses.push(
        'Poor trigger accuracy - skill may be over/under-triggering'
      );
    }

    // Analyze qualitative scores
    if (summary.avgQualitativeScore > 0.8) {
      analysis.strengths.push(
        'High-quality output consistently meets expectations'
      );
    } else if (summary.avgQualitativeScore < 0.6) {
      analysis.improvementAreas.push('Output quality needs improvement');
    }

    // Analyze deterministic compliance
    if (summary.deterministicCompliance > 0.9) {
      analysis.strengths.push(
        'Excellent adherence to deterministic requirements'
      );
    } else if (summary.deterministicCompliance < 0.7) {
      analysis.improvementAreas.push(
        'Deterministic requirements not consistently met'
      );
    }

    // Analyze performance patterns
    const slowResults = results.filter(r => r.duration > 5000);
    if (slowResults.length > results.length * 0.2) {
      analysis.weaknesses.push('Performance issues - many slow executions');
      analysis.riskFactors.push('Slow execution may impact user experience');
    }

    // Analyze error patterns
    const errorResults = results.filter(r => r.errors.length > 0);
    if (errorResults.length > results.length * 0.1) {
      analysis.riskFactors.push(
        'Frequent errors may indicate reliability issues'
      );
    }

    // Analyze trial consistency
    const trialConsistency = this.analyzeTrialConsistency(results);
    if (trialConsistency < 0.8) {
      analysis.weaknesses.push('Inconsistent behavior across trials');
      analysis.riskFactors.push(
        'Non-deterministic behavior affects reliability'
      );
    }

    return analysis;
  }

  /**
   * Analyze consistency across multiple trials
   */
  private analyzeTrialConsistency(results: SkillEvalResult[]): number {
    // Group results by test case
    const groupedResults = results.reduce(
      (groups, result) => {
        if (!groups[result.testCase]) {
          groups[result.testCase] = [];
        }
        groups[result.testCase].push(result);
        return groups;
      },
      {} as Record<string, SkillEvalResult[]>
    );

    let consistentCases = 0;
    const totalCases = Object.keys(groupedResults).length;

    for (const [_testCase, caseResults] of Object.entries(groupedResults)) {
      // Check if all trials have the same success status
      const successValues = caseResults.map(r => r.success);
      const allSame = successValues.every(v => v === successValues[0]);

      if (allSame) {
        consistentCases++;
      }
    }

    return totalCases > 0 ? consistentCases / totalCases : 0;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    summary: SkillEvalSummary,
    results: SkillEvalResult[]
  ): SkillEvaluationReport['recommendations'] {
    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[],
    };

    // Immediate recommendations (critical issues)
    if (summary.successRate < 0.7) {
      recommendations.immediate.push(
        'Address critical failures - review error handling and edge cases'
      );
    }

    if (summary.triggerAccuracy < 0.8) {
      recommendations.immediate.push(
        'Fix trigger logic to prevent over/under-triggering'
      );
    }

    const frequentErrors = this.getFrequentErrors(results);
    if (frequentErrors.length > 0) {
      recommendations.immediate.push(
        `Fix recurring errors: ${frequentErrors.slice(0, 3).join(', ')}`
      );
    }

    // Short-term recommendations (improvements)
    if (summary.avgQualitativeScore < 0.8) {
      recommendations.shortTerm.push(
        'Improve output quality through better prompts and validation'
      );
    }

    if (summary.deterministicCompliance < 0.9) {
      recommendations.shortTerm.push(
        'Strengthen deterministic checks and naming conventions'
      );
    }

    const performanceIssues = this.getPerformanceIssues(results);
    if (performanceIssues.length > 0) {
      recommendations.shortTerm.push(
        'Optimize performance for slow test cases'
      );
    }

    // Long-term recommendations (strategic improvements)
    recommendations.longTerm.push(
      'Implement comprehensive test coverage for edge cases'
    );
    recommendations.longTerm.push(
      'Add automated regression testing to prevent future issues'
    );
    recommendations.longTerm.push(
      'Consider skill refactoring based on usage patterns'
    );

    return recommendations;
  }

  /**
   * Extract frequent error patterns
   */
  private getFrequentErrors(results: SkillEvalResult[]): string[] {
    const errorCounts = results.reduce(
      (counts, result) => {
        result.errors.forEach(error => {
          counts[error] = (counts[error] || 0) + 1;
        });
        return counts;
      },
      {} as Record<string, number>
    );

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([error]) => error);
  }

  /**
   * Identify performance issues
   */
  private getPerformanceIssues(results: SkillEvalResult[]): string[] {
    const slowCases = results
      .filter(r => r.duration > 5000)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    return slowCases.map(r => `${r.testCase}: ${r.duration}ms`);
  }

  /**
   * Generate visualizations for the report
   */
  private async generateVisualizations(
    results: SkillEvalResult[]
  ): Promise<SkillEvaluationReport['visualizations']> {
    // Simple text-based visualizations
    // In production, would use charting libraries like D3.js or Chart.js

    const successRateChart = this.generateSuccessRateChart(results);
    const confidenceDistribution = this.generateConfidenceDistribution(results);
    const performanceMetrics = this.generatePerformanceMetrics(results);

    return {
      successRateChart,
      confidenceDistribution,
      performanceMetrics,
    };
  }

  /**
   * Generate success rate chart (ASCII)
   */
  private generateSuccessRateChart(results: SkillEvalResult[]): string {
    const successRates = results.reduce(
      (rates, result) => {
        if (!rates[result.testCase]) {
          rates[result.testCase] = { success: 0, total: 0 };
        }
        rates[result.testCase].total++;
        if (result.success) {
          rates[result.testCase].success++;
        }
        return rates;
      },
      {} as Record<string, { success: number; total: number }>
    );

    let chart = 'Success Rate by Test Case:\n';
    chart += `${'='.repeat(50)}\n`;

    Object.entries(successRates).forEach(([testCase, { success, total }]) => {
      const rate = success / total;
      const bar =
        '█'.repeat(Math.round(rate * 20)) +
        '░'.repeat(20 - Math.round(rate * 20));
      chart += `${testCase.padEnd(25)} ${bar} ${(rate * 100).toFixed(0)}%\n`;
    });

    return chart;
  }

  /**
   * Generate confidence distribution chart
   */
  private generateConfidenceDistribution(results: SkillEvalResult[]): string {
    const confidenceCounts = { high: 0, medium: 0, low: 0 };

    results.forEach(result => {
      if (result.output && result.output.confidence) {
        confidenceCounts[
          result.output.confidence as keyof typeof confidenceCounts
        ]++;
      }
    });

    let chart = 'Confidence Level Distribution:\n';
    chart += `${'='.repeat(30)}\n`;

    Object.entries(confidenceCounts).forEach(([level, count]) => {
      const percentage = (count / results.length) * 100;
      const bar = '█'.repeat(Math.round(percentage / 5));
      chart += `${level.padEnd(8)} ${bar} ${count} (${percentage.toFixed(0)}%)\n`;
    });

    return chart;
  }

  /**
   * Generate performance metrics chart
   */
  private generatePerformanceMetrics(results: SkillEvalResult[]): string {
    const durations = results.map(r => r.duration).sort((a, b) => a - b);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];
    const median = durations[Math.floor(durations.length / 2)];

    let chart = 'Performance Metrics:\n';
    chart += `${'='.repeat(30)}\n`;
    chart += `Average: ${avg.toFixed(0)}ms\n`;
    chart += `Median:  ${median}ms\n`;
    chart += `Min:     ${min}ms\n`;
    chart += `Max:     ${max}ms\n`;

    // Simple histogram
    const buckets = [0, 1000, 2000, 5000, 10000];
    chart += '\nDuration Distribution:\n';

    buckets.slice(0, -1).forEach((bucket, i) => {
      const nextBucket = buckets[i + 1];
      const count = durations.filter(d => d >= bucket && d < nextBucket).length;
      const percentage = (count / durations.length) * 100;
      const bar = '█'.repeat(Math.round(percentage / 2));
      chart += `${bucket}-${nextBucket}ms: ${bar} ${count}\n`;
    });

    return chart;
  }

  /**
   * Format report based on configuration
   */
  private formatReport(report: SkillEvaluationReport): string {
    switch (this.config.format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'markdown':
        return this.generateMarkdownReport(report);
      case 'html':
        return this.generateHtmlReport(report);
      default:
        return this.generateMarkdownReport(report);
    }
  }

  /**
   * Generate Markdown report
   */
  private generateMarkdownReport(report: SkillEvaluationReport): string {
    let md = '';

    // Header
    md += `# Skill Evaluation Report: ${report.metadata.skillName}\n\n`;
    md += `**Evaluation Date:** ${new Date(report.metadata.evaluationDate).toLocaleDateString()}\n`;
    md += `**Framework Version:** ${report.metadata.frameworkVersion}\n`;
    md += `**Test Cases:** ${report.metadata.totalTestCases}\n`;
    md += `**Total Trials:** ${report.metadata.totalTrials}\n\n`;

    // Executive Summary
    md += '## Executive Summary\n\n';
    md += `- **Success Rate:** ${(report.summary.successRate * 100).toFixed(1)}%\n`;
    md += `- **Trigger Accuracy:** ${(report.summary.triggerAccuracy * 100).toFixed(1)}%\n`;
    md += `- **Qualitative Score:** ${(report.summary.avgQualitativeScore * 100).toFixed(1)}%\n`;
    md += `- **Deterministic Compliance:** ${(report.summary.deterministicCompliance * 100).toFixed(1)}%\n\n`;

    // Analysis
    md += '## Analysis\n\n';

    if (report.analysis.strengths.length > 0) {
      md += '### Strengths\n\n';
      report.analysis.strengths.forEach(strength => {
        md += `- ✅ ${strength}\n`;
      });
      md += '\n';
    }

    if (report.analysis.weaknesses.length > 0) {
      md += '### Weaknesses\n\n';
      report.analysis.weaknesses.forEach(weakness => {
        md += `- ❌ ${weakness}\n`;
      });
      md += '\n';
    }

    if (report.analysis.improvementAreas.length > 0) {
      md += '### Improvement Areas\n\n';
      report.analysis.improvementAreas.forEach(area => {
        md += `- 🔧 ${area}\n`;
      });
      md += '\n';
    }

    if (report.analysis.riskFactors.length > 0) {
      md += '### Risk Factors\n\n';
      report.analysis.riskFactors.forEach(risk => {
        md += `- ⚠️ ${risk}\n`;
      });
      md += '\n';
    }

    // Recommendations
    md += '## Recommendations\n\n';

    if (report.recommendations.immediate.length > 0) {
      md += '### Immediate Actions (Critical)\n\n';
      report.recommendations.immediate.forEach(rec => {
        md += `- 🚨 ${rec}\n`;
      });
      md += '\n';
    }

    if (report.recommendations.shortTerm.length > 0) {
      md += '### Short-term Improvements\n\n';
      report.recommendations.shortTerm.forEach(rec => {
        md += `- 📋 ${rec}\n`;
      });
      md += '\n';
    }

    if (report.recommendations.longTerm.length > 0) {
      md += '### Long-term Strategy\n\n';
      report.recommendations.longTerm.forEach(rec => {
        md += `- 🎯 ${rec}\n`;
      });
      md += '\n';
    }

    // Visualizations
    if (report.visualizations) {
      md += '## Visualizations\n\n';

      if (report.visualizations.successRateChart) {
        md += '### Success Rate by Test Case\n\n';
        md += `\`\`\`\n${report.visualizations.successRateChart}\n\`\`\`\n\n`;
      }

      if (report.visualizations.confidenceDistribution) {
        md += '### Confidence Distribution\n\n';
        md += `\`\`\`\n${report.visualizations.confidenceDistribution}\n\`\`\`\n\n`;
      }

      if (report.visualizations.performanceMetrics) {
        md += '### Performance Metrics\n\n';
        md += `\`\`\`\n${report.visualizations.performanceMetrics}\n\`\`\`\n\n`;
      }
    }

    // Detailed Results
    md += '## Detailed Results\n\n';
    md += '| Test Case | Trial | Success | Triggered | Duration | Score |\n';
    md += '|-----------|-------|---------|-----------|----------|-------|\n';

    report.detailedResults.forEach(result => {
      const score = result.qualitativeScore
        ? `${(result.qualitativeScore * 100).toFixed(0)}%`
        : 'N/A';
      md += `| ${result.testCase} | ${result.trial} | ${result.success ? '✅' : '❌'} | ${result.triggered ? '✅' : '❌'} | ${result.duration}ms | ${score} |\n`;
    });

    return md;
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(report: SkillEvaluationReport): string {
    // Simple HTML template - in production would use proper templating
    const md = this.generateMarkdownReport(report);

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Skill Evaluation Report: ${report.metadata.skillName}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 0.9em; color: #64748b; }
        pre { background: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .success { color: #16a34a; }
        .failure { color: #dc2626; }
    </style>
</head>
<body>
    <h1>Skill Evaluation Report: ${report.metadata.skillName}</h1>
    
    <div class="summary">
        <div class="metric">
            <div class="metric-value">${(report.summary.successRate * 100).toFixed(1)}%</div>
            <div class="metric-label">Success Rate</div>
        </div>
        <div class="metric">
            <div class="metric-value">${(report.summary.triggerAccuracy * 100).toFixed(1)}%</div>
            <div class="metric-label">Trigger Accuracy</div>
        </div>
        <div class="metric">
            <div class="metric-value">${(report.summary.avgQualitativeScore * 100).toFixed(1)}%</div>
            <div class="metric-label">Qualitative Score</div>
        </div>
        <div class="metric">
            <div class="metric-value">${(report.summary.deterministicCompliance * 100).toFixed(1)}%</div>
            <div class="metric-label">Deterministic Compliance</div>
        </div>
    </div>

    <div class="content">
        ${md.replace(/#{1,6}\s/g, '<h2>').replace(/\n/g, '<br>')}
    </div>
</body>
</html>`;
  }

  /**
   * Save report to file
   */
  async saveReport(content: string): Promise<void> {
    const extension =
      this.config.format === 'html'
        ? 'html'
        : this.config.format === 'json'
          ? 'json'
          : 'md';

    const filename = `skill-eval-report-${Date.now()}.${extension}`;
    const filepath = path.join(this.config.outputPath, filename);

    await fs.mkdir(this.config.outputPath, { recursive: true });
    await fs.writeFile(filepath, content);

    console.log(`📄 Report saved to: ${filepath}`);
  }
}
