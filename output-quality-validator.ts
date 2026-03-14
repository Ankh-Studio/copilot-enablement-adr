#!/usr/bin/env node

/**
 * Output Quality Validator
 *
 * Final validation layer that checks if output is reasonable and acceptable
 * before pushing to remote and testing with clients.
 *
 * This includes:
 * 1. Reasonableness checks - Is the output logical and coherent?
 * 2. Acceptability checks - Does it meet quality standards?
 * 3. Safety checks - Is it safe for production?
 * 4. Hook points for adversarial reasoning validation
 */

console.log('🔍 Output Quality Validator');
console.log('='.repeat(60));
console.log('Final validation before production deployment...\n');

interface QualityCheck {
  name: string;
  category: 'reasonableness' | 'acceptability' | 'safety' | 'adversarial';
  critical: boolean;
  validate: (output: string, context: any) => QualityResult;
}

interface QualityResult {
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
  hook?: string; // Hook for additional validation
}

class OutputQualityValidator {
  private checks: QualityCheck[] = [];
  private hooks: Map<string, (output: string, context: any) => QualityResult> =
    new Map();

  constructor() {
    this.setupChecks();
    this.setupHooks();
  }

  private setupChecks(): void {
    // Reasonableness Checks
    this.checks.push({
      name: 'Logical Coherence',
      category: 'reasonableness',
      critical: true,
      validate: (output, context) =>
        this.checkLogicalCoherence(output, context),
    });

    this.checks.push({
      name: 'Data Consistency',
      category: 'reasonableness',
      critical: true,
      validate: (output, context) => this.checkDataConsistency(output, context),
    });

    this.checks.push({
      name: 'Contextual Relevance',
      category: 'reasonableness',
      critical: true,
      validate: (output, context) =>
        this.checkContextualRelevance(output, context),
    });

    // Acceptability Checks
    this.checks.push({
      name: 'Content Quality',
      category: 'acceptability',
      critical: true,
      validate: (output, context) => this.checkContentQuality(output, context),
    });

    this.checks.push({
      name: 'Format Compliance',
      category: 'acceptability',
      critical: true,
      validate: (output, context) =>
        this.checkFormatCompliance(output, context),
    });

    this.checks.push({
      name: 'Actionability',
      category: 'acceptability',
      critical: false,
      validate: (output, context) => this.checkActionability(output, context),
    });

    // Safety Checks
    this.checks.push({
      name: 'Harmful Content',
      category: 'safety',
      critical: true,
      validate: (output, context) => this.checkHarmfulContent(output, context),
    });

    this.checks.push({
      name: 'Privacy Compliance',
      category: 'safety',
      critical: true,
      validate: (output, context) =>
        this.checkPrivacyCompliance(output, context),
    });

    // Adversarial Reasoning Hook
    this.checks.push({
      name: 'Adversarial Robustness',
      category: 'adversarial',
      critical: false,
      validate: (output, context) =>
        this.checkAdversarialRobustness(output, context),
    });
  }

  private setupHooks(): void {
    // Hook for adversarial reasoning validation
    this.hooks.set('adversarial-chain', (output, context) => {
      // Placeholder for adversarial chain of reasoning validation
      // This could integrate with external AI services or specialized models
      return {
        passed: true,
        score: 85,
        issues: [],
        suggestions: ['Consider implementing adversarial validation'],
        hook: 'adversarial-chain-validation',
      };
    });

    // Hook for domain-specific validation
    this.hooks.set('domain-expert', (output, context) => {
      // Placeholder for domain expert validation
      return {
        passed: true,
        score: 90,
        issues: [],
        suggestions: ['Domain expert review recommended'],
        hook: 'domain-expert-validation',
      };
    });
  }

  validateOutput(
    output: string,
    context: any
  ): {
    overall: QualityResult;
    categoryResults: Record<string, QualityResult>;
    criticalIssues: string[];
    recommendations: string[];
    productionReady: boolean;
  } {
    console.log('🔍 Running Quality Validation');
    console.log(`📄 Output length: ${output.length} characters`);
    console.log(`🎯 Context: ${context.scenario || 'Unknown'}`);
    console.log('-'.repeat(40));

    const categoryResults: Record<string, QualityResult> = {};
    const allIssues: string[] = [];
    const allSuggestions: string[] = [];
    const criticalIssues: string[] = [];

    // Run all checks
    for (const check of this.checks) {
      const result = check.validate(output, context);

      if (!categoryResults[check.category]) {
        categoryResults[check.category] = {
          passed: true,
          score: 100,
          issues: [],
          suggestions: [],
        };
      }

      // Aggregate results by category
      const category = categoryResults[check.category];
      category.passed = category.passed && result.passed;
      category.score = Math.min(category.score, result.score);
      category.issues.push(...result.issues);
      category.suggestions.push(...result.suggestions);

      // Track critical issues
      if (!result.passed && check.critical) {
        criticalIssues.push(`${check.name}: ${result.issues.join(', ')}`);
      }

      // Track all issues and suggestions
      allIssues.push(...result.issues.map(issue => `${check.name}: ${issue}`));
      allSuggestions.push(...result.suggestions);

      console.log(
        `${result.passed ? '✅' : '❌'} ${check.name} (${check.category}): ${result.score}/100`
      );
      if (result.issues.length > 0) {
        console.log(`   ⚠️  Issues: ${result.issues.join(', ')}`);
      }
    }

    // Calculate overall result
    const overallScore =
      Object.values(categoryResults).reduce(
        (sum, result) => sum + result.score,
        0
      ) / Object.keys(categoryResults).length;
    const overallPassed = criticalIssues.length === 0 && overallScore >= 70;

    const overall: QualityResult = {
      passed: overallPassed,
      score: Math.round(overallScore),
      issues: criticalIssues,
      suggestions: allSuggestions,
    };

    console.log();
    console.log('📊 Category Results:');
    Object.entries(categoryResults).forEach(([category, result]) => {
      console.log(
        `   ${category}: ${result.passed ? '✅' : '❌'} ${result.score}/100`
      );
    });

    console.log(
      `\n🎯 Overall: ${overallPassed ? '✅' : '❌'} ${overallScore}/100`
    );

    return {
      overall,
      categoryResults,
      criticalIssues,
      recommendations: this.generateRecommendations(overall, categoryResults),
      productionReady: overallPassed && criticalIssues.length === 0,
    };
  }

  private checkLogicalCoherence(output: string, context: any): QualityResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for contradictions
    const contradictions = [
      {
        pattern: /high confidence.*low confidence/gi,
        message: 'Contradictory confidence levels',
      },
      {
        pattern: /excellent.*poor/gi,
        message: 'Contradictory quality assessments',
      },
      {
        pattern: /ready.*not ready/gi,
        message: 'Contradictory readiness statements',
      },
    ];

    contradictions.forEach(({ pattern, message }) => {
      if (pattern.test(output)) {
        issues.push(message);
        score -= 20;
      }
    });

    // Check for logical flow
    const sections = output.split('\n##').length;
    if (sections < 3) {
      issues.push('Insufficient structure for logical flow');
      suggestions.push('Add more structured sections');
      score -= 15;
    }

    // Check for conclusion alignment
    const hasConclusion =
      output.toLowerCase().includes('conclusion') ||
      output.toLowerCase().includes('summary');
    const hasRecommendations = output.toLowerCase().includes('recommendation');
    if (!hasConclusion || !hasRecommendations) {
      issues.push('Missing conclusion or recommendations');
      suggestions.push('Add summary and actionable recommendations');
      score -= 10;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions,
      hook: 'logical-coherence-hook',
    };
  }

  private checkDataConsistency(output: string, context: any): QualityResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check if output references input data consistently
    if (context.inputData) {
      const { techStack, security, artifacts } = context.inputData;

      // Tech stack consistency
      if (techStack && techStack.summary) {
        if (
          !output.toLowerCase().includes(techStack.confidence.toLowerCase())
        ) {
          issues.push('Confidence level not reflected in output');
          score -= 15;
        }
      }

      // Security consistency
      if (security) {
        const securityMentioned = output.toLowerCase().includes('security');
        const securityEnabled = security.available;

        if (securityEnabled && !securityMentioned) {
          issues.push('Security features not mentioned despite being enabled');
          score -= 10;
        } else if (
          !securityEnabled &&
          securityMentioned &&
          output.toLowerCase().includes('configured')
        ) {
          issues.push('Security mentioned as configured but not enabled');
          score -= 20;
        }
      }

      // Artifacts consistency
      if (artifacts) {
        const hasCopilot = artifacts.copilotInstructions;
        const copilotMentioned = output.toLowerCase().includes('copilot');

        if (hasCopilot && !copilotMentioned) {
          suggestions.push('Consider mentioning Copilot instructions found');
          score -= 5;
        }
      }
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions,
      hook: 'data-consistency-hook',
    };
  }

  private checkContextualRelevance(
    output: string,
    context: any
  ): QualityResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check if output addresses the scenario
    if (context.scenario) {
      const scenario = context.scenario.toLowerCase();

      if (
        scenario.includes('high-readiness') &&
        !output.toLowerCase().includes('advanced')
      ) {
        issues.push(
          'High-readiness scenario should mention advanced capabilities'
        );
        score -= 15;
      }

      if (
        scenario.includes('low-readiness') &&
        !output.toLowerCase().includes('improve')
      ) {
        issues.push(
          'Low-readiness scenario should include improvement suggestions'
        );
        score -= 15;
      }
    }

    // Check for repository-specific references
    if (context.repository) {
      const repoMentioned = output
        .toLowerCase()
        .includes(context.repository.toLowerCase());
      if (!repoMentioned) {
        suggestions.push('Consider mentioning repository name for context');
        score -= 5;
      }
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions,
      hook: 'contextual-relevance-hook',
    };
  }

  private checkContentQuality(output: string, context: any): QualityResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Length check
    if (output.length < 300) {
      issues.push('Output too short for comprehensive analysis');
      score -= 25;
    } else if (output.length > 5000) {
      issues.push('Output excessively long');
      suggestions.push('Consider condensing the analysis');
      score -= 10;
    }

    // Readability check
    const sentences = output.split('.').length;
    const avgSentenceLength = output.length / sentences;

    if (avgSentenceLength > 100) {
      issues.push('Sentences too long - affects readability');
      suggestions.push('Break down long sentences');
      score -= 15;
    }

    // Technical jargon check
    const jargonCount = (
      output.match(/\b(AI|ML|LLM|API|SDK|CI\/CD|DevOps)\b/g) || []
    ).length;
    const jargonRatio = jargonCount / sentences;

    if (jargonRatio > 0.3) {
      suggestions.push('Consider explaining technical terms');
      score -= 10;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions,
      hook: 'content-quality-hook',
    };
  }

  private checkFormatCompliance(output: string, context: any): QualityResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Markdown format check
    const hasHeaders = /^#+\s/m.test(output);
    const hasLists = /^[-*+]\s/m.test(output);
    const hasCodeBlocks = /```/.test(output);

    if (!hasHeaders) {
      issues.push('Missing markdown headers');
      score -= 20;
    }

    if (!hasLists) {
      suggestions.push('Consider using bullet points for readability');
      score -= 10;
    }

    // Structure check
    const sections = output.split('\n##').length;
    if (sections < 2) {
      issues.push('Insufficient section structure');
      score -= 15;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions,
      hook: 'format-compliance-hook',
    };
  }

  private checkActionability(output: string, context: any): QualityResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for actionable recommendations
    const actionablePatterns = [
      /implement/i,
      /configure/i,
      /set up/i,
      /add/i,
      /create/i,
      /establish/i,
    ];

    const hasActionableContent = actionablePatterns.some(pattern =>
      pattern.test(output)
    );
    if (!hasActionableContent) {
      issues.push('No actionable recommendations found');
      suggestions.push('Add specific implementation steps');
      score -= 25;
    }

    // Check for numbered steps
    const hasNumberedSteps = /^\d+\./m.test(output);
    if (!hasNumberedSteps) {
      suggestions.push('Consider using numbered steps for clarity');
      score -= 10;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions,
      hook: 'actionability-hook',
    };
  }

  private checkHarmfulContent(output: string, context: any): QualityResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for potentially harmful content
    const harmfulPatterns = [
      /delete.*all/i,
      /remove.*everything/i,
      /disable.*security/i,
      /bypass.*authentication/i,
      /ignore.*warnings/i,
    ];

    harmfulPatterns.forEach(pattern => {
      if (pattern.test(output)) {
        issues.push('Potentially harmful instruction detected');
        score -= 50;
      }
    });

    // Check for negative language
    const negativeWords = [
      'terrible',
      'awful',
      'horrible',
      'disaster',
      'catastrophe',
    ];
    const negativeCount = negativeWords.filter(word =>
      output.toLowerCase().includes(word)
    ).length;

    if (negativeCount > 2) {
      issues.push('Excessive negative language');
      suggestions.push('Use more constructive language');
      score -= 20;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions,
      hook: 'harmful-content-hook',
    };
  }

  private checkPrivacyCompliance(output: string, context: any): QualityResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for potential privacy leaks
    const privacyPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
      /\b[A-Za-z]{2}\d{5}\b/, // Potential API keys
      /password/i,
      /secret/i,
      /token/i,
    ];

    privacyPatterns.forEach(pattern => {
      if (pattern.test(output)) {
        issues.push('Potential privacy-sensitive information detected');
        score -= 30;
      }
    });

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions,
      hook: 'privacy-compliance-hook',
    };
  }

  private checkAdversarialRobustness(
    output: string,
    context: any
  ): QualityResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 85; // Start with good score since this is non-critical

    // Hook into adversarial reasoning validation
    const adversarialHook = this.hooks.get('adversarial-chain');
    if (adversarialHook) {
      const hookResult = adversarialHook(output, context);
      issues.push(...hookResult.issues);
      suggestions.push(...hookResult.suggestions);
      score = Math.min(score, hookResult.score);
    }

    // Check for overconfidence
    const overconfidencePatterns = [
      /always/i,
      /never/i,
      /perfect/i,
      /guaranteed/i,
    ];

    const overconfidenceCount = overconfidencePatterns.filter(pattern =>
      pattern.test(output)
    ).length;
    if (overconfidenceCount > 3) {
      issues.push('Excessive overconfidence detected');
      suggestions.push('Use more nuanced language');
      score -= 15;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions,
      hook: 'adversarial-robustness-hook',
    };
  }

  private generateRecommendations(
    overall: QualityResult,
    categoryResults: Record<string, QualityResult>
  ): string[] {
    const recommendations: string[] = [];

    // Critical issue recommendations
    if (overall.issues.length > 0) {
      recommendations.push(
        '🚨 CRITICAL: Address critical issues before deployment'
      );
    }

    // Category-specific recommendations
    if (
      categoryResults.reasonableness &&
      categoryResults.reasonableness.score < 80
    ) {
      recommendations.push('🧠 Improve logical coherence and data consistency');
    }

    if (
      categoryResults.acceptability &&
      categoryResults.acceptability.score < 80
    ) {
      recommendations.push('📝 Enhance content quality and format compliance');
    }

    if (categoryResults.safety && categoryResults.safety.score < 90) {
      recommendations.push('🛡️  Review safety and privacy compliance');
    }

    if (categoryResults.adversarial && categoryResults.adversarial.score < 80) {
      recommendations.push('⚔️  Consider adversarial reasoning validation');
    }

    // General recommendations
    if (overall.score >= 70 && overall.score < 85) {
      recommendations.push('✅ Good quality - consider minor improvements');
    } else if (overall.score >= 85) {
      recommendations.push('🎉 Excellent quality - ready for production');
    }

    return recommendations;
  }
}

// Demo the quality validator
async function demonstrateQualityValidation() {
  const validator = new OutputQualityValidator();

  // Test scenarios
  const testCases = [
    {
      name: 'High-Quality Output',
      output: `# AI Enablement Assessment

## Current State Analysis

### Technology Stack
Languages: TypeScript (150), JavaScript (80), Markdown (25). Technologies: react, typescript, eslint, prettier, jest, webpack, vitest, github-actions, docker, kubernetes
Confidence: high

### Security Posture
Security features configured and enabled

### Repository Artifacts
- Copilot Instructions: Found
- ADR Files: 2 found
- Documentation: 4 files
- Test Files: 3 files

## Readiness Assessment

### Repository Dimension: 85/100
Strong TypeScript adoption, Comprehensive testing, CI/CD pipeline

### Team Dimension: 75/100
Code review process, Documentation standards, Testing culture

### Organizational Dimension: 70/100
Security policies, Compliance framework

### Overall Readiness Score: 77/100

## Recommendations

### High Readiness - Next Steps
1. Implement AI-powered code review assistance
2. Enhance security posture with advanced features
3. Scale documentation practices
4. Leverage existing tech stack for AI integration`,
      context: {
        scenario: 'High-Readiness Repository',
        repository: 'copilot-enablement-adr',
        inputData: {
          techStack: {
            confidence: 'high',
            summary: 'Comprehensive tech stack',
          },
          security: { available: true },
          artifacts: { copilotInstructions: true },
        },
      },
    },
    {
      name: 'Low-Quality Output',
      output: 'bad output with contradictions and no structure',
      context: {
        scenario: 'Low-Readiness Repository',
        repository: 'test-repo',
        inputData: {
          techStack: { confidence: 'low', summary: 'Minimal tech stack' },
          security: { available: false },
          artifacts: { copilotInstructions: false },
        },
      },
    },
  ];

  console.log('🧪 Quality Validation Demo');
  console.log('='.repeat(60));

  for (const testCase of testCases) {
    console.log(`\n📋 Test Case: ${testCase.name}`);
    console.log('-'.repeat(40));

    const result = validator.validateOutput(testCase.output, testCase.context);

    console.log(
      `\n🎯 Production Ready: ${result.productionReady ? '✅ YES' : '❌ NO'}`
    );
    console.log(`📊 Overall Score: ${result.overall.score}/100`);

    if (result.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues:');
      result.criticalIssues.forEach(issue => console.log(`   • ${issue}`));
    }

    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.forEach(rec => console.log(`   ${rec}`));
    }

    console.log(`\n${'='.repeat(60)}`);
  }
}

// Run the demo
if (require.main === module) {
  demonstrateQualityValidation().catch(console.error);
}

export { OutputQualityValidator };
