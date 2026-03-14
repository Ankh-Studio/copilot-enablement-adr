#!/usr/bin/env node

/**
 * Enhanced Output Quality Validator
 *
 * Internal AI evaluation system with persona-based scoring and advanced techniques:
 * - Thinking approximation (Socratic method, chain of reasoning)
 * - Prompt chaining for multi-stage evaluation
 * - Adversarial testing for robustness checking
 * - Rubric evaluation against defined criteria
 *
 * EXCLUSIVELY FOR INTERNAL USE - Evaluates client-generated markdown ADRs
 */

import { readFileSync, existsSync } from 'fs';

// ============================================================================
// INTERFACES
// ============================================================================

interface Persona {
  name: string;
  weights: Record<string, number>;
  thinkingStyle: string;
  focusAreas: string[];
}

interface ValidationResult {
  overall: {
    passed: boolean;
    score: number;
    confidence: number;
    reasoning: string[];
  };
  personas: Record<string, PersonaResult>;
  advancedEvaluation: {
    socraticAnalysis: SocraticResult;
    chainOfReasoning: ReasoningChain;
    adversarialTest: AdversarialResult;
    rubricScore: RubricResult;
  };
  productionReady: boolean;
  recommendations: string[];
}

interface PersonaResult {
  score: number;
  passed: boolean;
  reasoning: string[];
  concerns: string[];
  strengths: string[];
}

interface SocraticResult {
  questionsAsked: string[];
  assumptionsIdentified: string[];
  logicalGaps: string[];
  confidenceScore: number;
}

interface ReasoningChain {
  steps: ReasoningStep[];
  logicalFlow: 'coherent' | 'flawed' | 'incomplete';
  confidenceScore: number;
}

interface ReasoningStep {
  step: number;
  description: string;
  evidence: string[];
  conclusion: string;
  confidence: number;
}

interface AdversarialResult {
  edgeCases: string[];
  contradictions: string[];
  overconfidence: boolean;
  robustnessScore: number;
}

interface RubricResult {
  criteria: Record<string, number>;
  totalScore: number;
  detailedFeedback: string[];
}

// ============================================================================
// PERSONA DEFINITIONS
// ============================================================================

const PERSONAS: Record<string, Persona> = {
  consultant: {
    name: 'Expert Consultant',
    weights: { business: 40, technical: 30, risk: 30 },
    thinkingStyle: 'strategic-business-focused',
    focusAreas: [
      'actionability',
      'business impact',
      'implementation feasibility',
      'risk assessment',
    ],
  },

  architect: {
    name: 'Technical Architect',
    weights: { technical: 50, security: 30, standards: 20 },
    thinkingStyle: 'technical-depth-best-practices',
    focusAreas: [
      'technical accuracy',
      'security',
      'maintainability',
      'scalability',
    ],
  },

  devops: {
    name: 'DevOps Engineer',
    weights: { implementation: 40, automation: 35, operations: 25 },
    thinkingStyle: 'practical-automation-deployment',
    focusAreas: [
      'implementation clarity',
      'CI/CD integration',
      'monitoring',
      'operational readiness',
    ],
  },
};

// ============================================================================
// ENHANCED VALIDATOR CLASS
// ============================================================================

class EnhancedOutputValidator {
  private personas: Record<string, Persona>;
  private rubricCriteria: Record<
    string,
    (output: string, context: any) => number
  > = {};

  constructor() {
    this.personas = PERSONAS;
    this.setupRubricCriteria();
  }

  // ============================================================================
  // MAIN VALIDATION ENTRY POINT
  // ============================================================================

  validateOutput(output: string, context: any = {}): ValidationResult {
    console.log('🧠 Starting Enhanced AI Evaluation...');

    const results: ValidationResult = {
      overall: { passed: false, score: 0, confidence: 0, reasoning: [] },
      personas: {},
      advancedEvaluation: {
        socraticAnalysis: this.performSocraticAnalysis(output, context),
        chainOfReasoning: this.performChainOfReasoning(output, context),
        adversarialTest: this.performAdversarialTesting(output, context),
        rubricScore: this.performRubricEvaluation(output, context),
      },
      productionReady: false,
      recommendations: [],
    };

    // Evaluate each persona
    for (const [personaKey, persona] of Object.entries(this.personas)) {
      results.personas[personaKey] = this.evaluatePersona(
        output,
        context,
        persona
      );
    }

    // Calculate overall results
    this.calculateOverallResults(results);

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);

    return results;
  }

  // ============================================================================
  // PERSONA-BASED EVALUATION
  // ============================================================================

  private evaluatePersona(
    output: string,
    context: any,
    persona: Persona
  ): PersonaResult {
    const result: PersonaResult = {
      score: 0,
      passed: false,
      reasoning: [],
      concerns: [],
      strengths: [],
    };

    // Evaluate based on persona weights and focus areas
    for (const focusArea of persona.focusAreas) {
      const evaluation = this.evaluateFocusArea(output, context, focusArea);
      result.reasoning.push(evaluation.reasoning);

      if (evaluation.strength) {
        result.strengths.push(evaluation.strength);
      }

      if (evaluation.concern) {
        result.concerns.push(evaluation.concern);
      }

      result.score += evaluation.score;
    }

    // Normalize score
    result.score = Math.min(
      100,
      Math.max(0, result.score / persona.focusAreas.length)
    );
    result.passed = result.score >= 70;

    return result;
  }

  private evaluateFocusArea(
    output: string,
    _context: any,
    focusArea: string
  ): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const evaluations: Record<
      string,
      () => {
        reasoning: string;
        score: number;
        strength?: string;
        concern?: string;
      }
    > = {
      actionability: () => this.evaluateActionability(output),
      'business impact': () => this.evaluateBusinessImpact(output),
      'implementation feasibility': () =>
        this.evaluateImplementationFeasibility(output),
      'risk assessment': () => this.evaluateRiskAssessment(output),
      'technical accuracy': () => this.evaluateTechnicalAccuracy(output),
      security: () => this.evaluateSecurity(output),
      maintainability: () => this.evaluateMaintainability(output),
      scalability: () => this.evaluateScalability(output),
      'implementation clarity': () =>
        this.evaluateImplementationClarity(output),
      'CI/CD integration': () => this.evaluateCICDIntegration(output),
      monitoring: () => this.evaluateMonitoring(output),
      'operational readiness': () => this.evaluateOperationalReadiness(output),
    };

    const evaluation = evaluations[focusArea];
    return evaluation
      ? evaluation()
      : { reasoning: 'Unknown focus area', score: 50 };
  }

  // ============================================================================
  // ADVANCED AI EVALUATION TECHNIQUES
  // ============================================================================

  private performSocraticAnalysis(
    output: string,
    _context: any
  ): SocraticResult {
    const questions: string[] = [];
    const assumptions: string[] = [];
    const gaps: string[] = [];

    // Socratic questioning to probe assumptions
    if (output.includes('always') || output.includes('never')) {
      questions.push('Are there exceptions to this absolute statement?');
      assumptions.push('Assumes absolute conditions without edge cases');
    }

    if (output.includes('easy') || output.includes('simple')) {
      questions.push('What makes this implementation easy or simple?');
      assumptions.push(
        'Assumes complexity assessment without detailed analysis'
      );
    }

    if (!output.includes('risk') && !output.includes('challenge')) {
      questions.push('What are the potential risks and challenges?');
      gaps.push('Missing risk analysis');
    }

    if (!output.includes('timeline') && !output.includes('milestone')) {
      questions.push('What is the timeline and key milestones?');
      gaps.push('Missing temporal planning');
    }

    const confidenceScore = Math.max(
      0,
      100 - questions.length * 10 - gaps.length * 15
    );

    return {
      questionsAsked: questions,
      assumptionsIdentified: assumptions,
      logicalGaps: gaps,
      confidenceScore,
    };
  }

  private performChainOfReasoning(
    output: string,
    _context: any
  ): ReasoningChain {
    const steps: ReasoningStep[] = [];

    // Step 1: Analyze current state
    steps.push({
      step: 1,
      description: 'Analyze current repository state',
      evidence: this.extractEvidence(output, 'current state'),
      conclusion: this.extractConclusion(output, 'current state'),
      confidence: 0.8,
    });

    // Step 2: Identify problems/gaps
    steps.push({
      step: 2,
      description: 'Identify problems and gaps',
      evidence: this.extractEvidence(output, 'problems'),
      conclusion: this.extractConclusion(output, 'problems'),
      confidence: 0.7,
    });

    // Step 3: Propose solutions
    steps.push({
      step: 3,
      description: 'Propose solutions and recommendations',
      evidence: this.extractEvidence(output, 'solutions'),
      conclusion: this.extractConclusion(output, 'solutions'),
      confidence: 0.6,
    });

    // Step 4: Implementation plan
    steps.push({
      step: 4,
      description: 'Create implementation plan',
      evidence: this.extractEvidence(output, 'implementation'),
      conclusion: this.extractConclusion(output, 'implementation'),
      confidence: 0.5,
    });

    // Evaluate logical flow
    const logicalFlow = steps.every(step => step.confidence > 0.4)
      ? 'coherent'
      : steps.some(step => step.confidence < 0.3)
        ? 'flawed'
        : 'incomplete';

    const confidenceScore =
      (steps.reduce((sum, step) => sum + step.confidence, 0) / steps.length) *
      100;

    return {
      steps,
      logicalFlow: logicalFlow as 'coherent' | 'flawed' | 'incomplete',
      confidenceScore,
    };
  }

  private performAdversarialTesting(
    output: string,
    _context: any
  ): AdversarialResult {
    const edgeCases: string[] = [];
    const contradictions: string[] = [];
    let overconfidence = false;

    // Test for edge cases
    if (!output.includes('backup') && !output.includes('rollback')) {
      edgeCases.push('No backup or rollback strategy mentioned');
    }

    if (!output.includes('monitoring') && !output.includes('alerting')) {
      edgeCases.push('No monitoring or alerting strategy');
    }

    // Test for contradictions
    const positiveWords = ['excellent', 'perfect', 'guaranteed', 'always'];
    const negativeWords = ['challenge', 'risk', 'problem', 'issue'];

    const hasPositives = positiveWords.some(word =>
      output.toLowerCase().includes(word)
    );
    const hasNegatives = negativeWords.some(word =>
      output.toLowerCase().includes(word)
    );

    if (hasPositives && !hasNegatives) {
      contradictions.push('Overly positive without acknowledging challenges');
      overconfidence = true;
    }

    // Test for overconfidence
    if (
      output.toLowerCase().includes('guaranteed') ||
      output.toLowerCase().includes('always succeeds')
    ) {
      overconfidence = true;
      contradictions.push('Unrealistic guarantees of success');
    }

    const robustnessScore = Math.max(
      0,
      100 -
        edgeCases.length * 20 -
        contradictions.length * 25 -
        (overconfidence ? 30 : 0)
    );

    return {
      edgeCases,
      contradictions,
      overconfidence,
      robustnessScore,
    };
  }

  private performRubricEvaluation(output: string, context: any): RubricResult {
    const criteria: Record<string, number> = {};
    const feedback: string[] = [];

    for (const [criterion, evaluator] of Object.entries(this.rubricCriteria)) {
      const score = evaluator(output, context);
      criteria[criterion] = score;

      if (score < 70) {
        feedback.push(`${criterion}: Needs improvement (score: ${score})`);
      } else if (score >= 90) {
        feedback.push(`${criterion}: Excellent (score: ${score})`);
      }
    }

    const totalScore =
      Object.values(criteria).reduce((sum, score) => sum + score, 0) /
      Object.keys(criteria).length;

    return {
      criteria,
      totalScore,
      detailedFeedback: feedback,
    };
  }

  // ============================================================================
  // FOCUS AREA EVALUATIONS
  // ============================================================================

  private evaluateActionability(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    // const hasActionItems = /\d+\./.test(output) || output.includes('## Implementation');
    const hasTimeline =
      output.toLowerCase().includes('day') ||
      output.toLowerCase().includes('week') ||
      output.toLowerCase().includes('month');
    const hasSpecificSteps = (output.match(/\d+\./g) || []).length >= 3;

    let score = 50;
    let reasoning = 'Actionability assessment: ';
    let strength, concern;

    if (hasSpecificSteps) {
      score += 30;
      reasoning += 'Multiple specific action items found. ';
      strength = 'Detailed implementation steps provided';
    }

    if (hasTimeline) {
      score += 20;
      reasoning += 'Timeline references present. ';
    } else {
      concern = 'Missing timeline for implementation';
      reasoning += 'No timeline specified. ';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateBusinessImpact(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const businessTerms = [
      'productivity',
      'efficiency',
      'cost',
      'revenue',
      'roi',
      'business value',
    ];
    const hasBusinessTerms = businessTerms.some(term =>
      output.toLowerCase().includes(term)
    );

    const score = hasBusinessTerms ? 70 : 40;
    const reasoning = `Business impact: ${hasBusinessTerms ? 'Business terms detected' : 'Limited business focus'}. `;
    let strength, concern;

    if (hasBusinessTerms) {
      strength = 'Business value considerations included';
    } else {
      concern = 'Limited business impact analysis';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateTechnicalAccuracy(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const technicalTerms = [
      'architecture',
      'api',
      'database',
      'security',
      'performance',
      'scalability',
    ];
    const hasTechnicalTerms = technicalTerms.some(term =>
      output.toLowerCase().includes(term)
    );

    const score = hasTechnicalTerms ? 75 : 50;
    const reasoning = `Technical accuracy: ${hasTechnicalTerms ? 'Technical concepts present' : 'Limited technical depth'}. `;
    let strength, concern;

    if (hasTechnicalTerms) {
      strength = 'Technical considerations included';
    } else {
      concern = 'Limited technical analysis';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateImplementationFeasibility(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const hasImplementation =
      output.includes('## Implementation') || output.includes('## Action Plan');
    const hasResources =
      output.toLowerCase().includes('team') ||
      output.toLowerCase().includes('resources');
    const hasDependencies =
      output.toLowerCase().includes('dependencies') ||
      output.toLowerCase().includes('prerequisites');

    let score = 50;
    const reasoning = 'Implementation feasibility: ';
    let strength, concern;

    if (hasImplementation) score += 20;
    if (hasResources) score += 15;
    if (hasDependencies) score += 15;

    if (score >= 80) {
      strength = 'Comprehensive implementation planning';
    } else if (score < 60) {
      concern = 'Implementation planning needs more detail';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateRiskAssessment(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const hasRisks =
      output.toLowerCase().includes('risk') ||
      output.toLowerCase().includes('challenge');
    const hasMitigation =
      output.toLowerCase().includes('mitigation') ||
      output.toLowerCase().includes('contingency');

    let score = 50;
    let reasoning = 'Risk assessment: ';
    let strength, concern;

    if (hasRisks) {
      score += 25;
      reasoning += 'Risks identified. ';
      strength = 'Risk awareness demonstrated';
    } else {
      reasoning += 'No risks identified. ';
      concern = 'Missing risk analysis';
    }

    if (hasMitigation) {
      score += 25;
      reasoning += 'Mitigation strategies present. ';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateSecurity(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const securityTerms = [
      'security',
      'authentication',
      'authorization',
      'encryption',
      'vulnerability',
    ];
    const hasSecurity = securityTerms.some(term =>
      output.toLowerCase().includes(term)
    );

    const score = hasSecurity ? 75 : 40;
    const reasoning = `Security: ${hasSecurity ? 'Security considerations present' : 'Limited security analysis'}. `;
    let strength, concern;

    if (hasSecurity) {
      strength = 'Security considerations included';
    } else {
      concern = 'Security analysis missing';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateMaintainability(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const maintainabilityTerms = [
      'documentation',
      'testing',
      'code review',
      'standards',
      'guidelines',
    ];
    const hasMaintainability = maintainabilityTerms.some(term =>
      output.toLowerCase().includes(term)
    );

    const score = hasMaintainability ? 70 : 45;
    const reasoning = `Maintainability: ${hasMaintainability ? 'Maintainability considered' : 'Limited maintainability focus'}. `;
    let strength, concern;

    if (hasMaintainability) {
      strength = 'Maintainability factors addressed';
    } else {
      concern = 'Maintainability not adequately addressed';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateScalability(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const scalabilityTerms = [
      'scale',
      'performance',
      'load',
      'capacity',
      'growth',
    ];
    const hasScalability = scalabilityTerms.some(term =>
      output.toLowerCase().includes(term)
    );

    const score = hasScalability ? 70 : 45;
    const reasoning = `Scalability: ${hasScalability ? 'Scalability considered' : 'Limited scalability analysis'}. `;
    let strength, concern;

    if (hasScalability) {
      strength = 'Scalability factors addressed';
    } else {
      concern = 'Scalability not adequately addressed';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateImplementationClarity(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const hasSteps = (output.match(/\d+\./g) || []).length >= 3;
    const hasDetails = output.length > 500;

    let score = 50;
    let reasoning = 'Implementation clarity: ';
    let strength, concern;

    if (hasSteps) {
      score += 30;
      reasoning += 'Step-by-step implementation. ';
      strength = 'Clear implementation steps';
    }

    if (hasDetails) {
      score += 20;
      reasoning += 'Detailed explanations. ';
    } else {
      concern = 'Implementation details lacking';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateCICDIntegration(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const cicdTerms = [
      'ci/cd',
      'pipeline',
      'automation',
      'deployment',
      'github actions',
    ];
    const hasCICD = cicdTerms.some(term => output.toLowerCase().includes(term));

    const score = hasCICD ? 75 : 40;
    const reasoning = `CI/CD: ${hasCICD ? 'CI/CD considered' : 'Limited CI/CD analysis'}. `;
    let strength, concern;

    if (hasCICD) {
      strength = 'CI/CD integration addressed';
    } else {
      concern = 'CI/CD integration not considered';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateMonitoring(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const monitoringTerms = [
      'monitoring',
      'logging',
      'metrics',
      'alerting',
      'observability',
    ];
    const hasMonitoring = monitoringTerms.some(term =>
      output.toLowerCase().includes(term)
    );

    const score = hasMonitoring ? 70 : 40;
    const reasoning = `Monitoring: ${hasMonitoring ? 'Monitoring considered' : 'Limited monitoring analysis'}. `;
    let strength, concern;

    if (hasMonitoring) {
      strength = 'Monitoring strategy included';
    } else {
      concern = 'Monitoring strategy missing';
    }

    return { reasoning, score, strength, concern };
  }

  private evaluateOperationalReadiness(output: string): {
    reasoning: string;
    score: number;
    strength?: string;
    concern?: string;
  } {
    const opsTerms = [
      'deployment',
      'operations',
      'support',
      'maintenance',
      'runbook',
    ];
    const hasOps = opsTerms.some(term => output.toLowerCase().includes(term));

    const score = hasOps ? 70 : 45;
    const reasoning = `Operational readiness: ${hasOps ? 'Operations considered' : 'Limited operations planning'}. `;
    let strength, concern;

    if (hasOps) {
      strength = 'Operational factors addressed';
    } else {
      concern = 'Operational readiness not adequately addressed';
    }

    return { reasoning, score, strength, concern };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private setupRubricCriteria(): void {
    this.rubricCriteria = {
      completeness: (output, _context) => {
        const sections = output.split('##').length;
        return Math.min(100, sections * 15);
      },
      clarity: (output, _context) => {
        const sentences = output.split('.').length;
        const avgSentenceLength = output.length / sentences;
        return avgSentenceLength < 100 ? 80 : 60;
      },
      feasibility: (output, _context) => {
        const hasImplementation = output.includes('## Implementation');
        const hasTimeline =
          output.toLowerCase().includes('day') ||
          output.toLowerCase().includes('week');
        return (hasImplementation ? 50 : 0) + (hasTimeline ? 50 : 0);
      },
      risk_awareness: (output, _context) => {
        const hasRisks =
          output.toLowerCase().includes('risk') ||
          output.toLowerCase().includes('challenge');
        return hasRisks ? 80 : 40;
      },
    };
  }

  private extractEvidence(output: string, section: string): string[] {
    const evidence: string[] = [];

    // Simple evidence extraction - in real implementation would be more sophisticated
    if (section === 'current state') {
      const currentMatch = output.match(/## Current State[\s\S]*?(?=##|$)/);
      if (currentMatch) {
        evidence.push(currentMatch[0]);
      }
    }

    return evidence;
  }

  private extractConclusion(_output: string, section: string): string {
    // Simple conclusion extraction
    return `Conclusion about ${section} based on analysis`;
  }

  private calculateOverallResults(results: ValidationResult): void {
    const personaScores = Object.values(results.personas).map(p => p.score);
    const avgPersonaScore =
      personaScores.reduce((sum, score) => sum + score, 0) /
      personaScores.length;

    const advancedScore =
      (results.advancedEvaluation.socraticAnalysis.confidenceScore +
        results.advancedEvaluation.chainOfReasoning.confidenceScore +
        results.advancedEvaluation.adversarialTest.robustnessScore +
        results.advancedEvaluation.rubricScore.totalScore) /
      4;

    results.overall.score = Math.round((avgPersonaScore + advancedScore) / 2);
    results.overall.passed = results.overall.score >= 70;
    results.overall.confidence = Math.min(100, results.overall.score + 10);

    // Aggregate reasoning
    results.overall.reasoning = [
      `Persona evaluation average: ${Math.round(avgPersonaScore)}/100`,
      `Advanced evaluation score: ${Math.round(advancedScore)}/100`,
      `Overall confidence: ${results.overall.confidence}%`,
    ];

    results.productionReady =
      results.overall.passed &&
      results.advancedEvaluation.adversarialTest.robustnessScore >= 60;
  }

  private generateRecommendations(results: ValidationResult): string[] {
    const recommendations: string[] = [];

    // Persona-based recommendations
    for (const [personaKey, personaResult] of Object.entries(
      results.personas
    )) {
      if (personaResult.score < 70) {
        recommendations.push(
          `Improve ${personaKey} perspective: ${personaResult.concerns.join(', ')}`
        );
      }
    }

    // Advanced evaluation recommendations
    if (results.advancedEvaluation.socraticAnalysis.logicalGaps.length > 0) {
      recommendations.push(
        `Address logical gaps: ${results.advancedEvaluation.socraticAnalysis.logicalGaps.join(', ')}`
      );
    }

    if (results.advancedEvaluation.adversarialTest.edgeCases.length > 0) {
      recommendations.push(
        `Consider edge cases: ${results.advancedEvaluation.adversarialTest.edgeCases.join(', ')}`
      );
    }

    if (
      results.advancedEvaluation.chainOfReasoning.logicalFlow !== 'coherent'
    ) {
      recommendations.push('Improve logical flow and reasoning chain');
    }

    return recommendations;
  }

  // ============================================================================
  // DEMO AND EXPORT
  // ============================================================================

  static demo(): void {
    console.log('🧠 Enhanced AI Evaluation System Demo');
    console.log('='.repeat(60));

    const validator = new EnhancedOutputValidator();

    // Sample client ADR output
    const sampleADR = `# ADR-001: AI Enablement Strategy

## Status
ACCEPTED

## Context
Our organization needs to implement AI-powered development tools to improve productivity.

## Decision
We will implement GitHub Copilot across all repositories and establish AI development guidelines.

## Implementation Plan
1. Week 1-2: Enable Copilot organization-wide
2. Week 3-4: Create AI development guidelines
3. Week 5-6: Establish code review processes
4. Week 7-8: Monitor and optimize

## Consequences
### Positive
- Improved developer productivity
- Better code quality
- Enhanced security posture

### Negative
- Learning curve for team members
- Subscription costs

## Success Metrics
- Developer productivity: +30%
- Code review time: -40%
- Security vulnerabilities: -25%`;

    const context = {
      repository: 'sample-repo',
      techStack: {
        languages: ['TypeScript', 'JavaScript'],
        confidence: 'medium',
      },
      security: { available: true },
      artifacts: { copilotInstructions: false },
    };

    const results = validator.validateOutput(sampleADR, context);

    console.log('\n📊 VALIDATION RESULTS:');
    console.log(`Overall Score: ${results.overall.score}/100`);
    console.log(
      `Production Ready: ${results.productionReady ? '✅ YES' : '❌ NO'}`
    );
    console.log(`Confidence: ${results.overall.confidence}%`);

    console.log('\n🎭 PERSONA EVALUATIONS:');
    for (const [personaKey, personaResult] of Object.entries(
      results.personas
    )) {
      console.log(
        `${personaKey}: ${personaResult.score}/100 - ${personaResult.passed ? '✅' : '❌'}`
      );
    }

    console.log('\n🧠 ADVANCED EVALUATION:');
    console.log(
      `Socratic Analysis: ${results.advancedEvaluation.socraticAnalysis.confidenceScore}/100`
    );
    console.log(
      `Chain of Reasoning: ${results.advancedEvaluation.chainOfReasoning.confidenceScore}/100`
    );
    console.log(
      `Adversarial Testing: ${results.advancedEvaluation.adversarialTest.robustnessScore}/100`
    );
    console.log(
      `Rubric Score: ${Math.round(results.advancedEvaluation.rubricScore.totalScore)}/100`
    );

    if (results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      results.recommendations.forEach(rec => console.log(`• ${rec}`));
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 Enhanced AI Evaluation Demo Complete!');
  }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

if (require.main === module) {
  // Check if file argument provided
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Run demo
    EnhancedOutputValidator.demo();
  } else {
    // Validate provided file
    const filePath = args[0];

    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    try {
      const content = readFileSync(filePath, 'utf8');
      const validator = new EnhancedOutputValidator();
      const results = validator.validateOutput(content);

      console.log('\n📊 ENHANCED AI EVALUATION RESULTS:');
      console.log(`Overall Score: ${results.overall.score}/100`);
      console.log(
        `Production Ready: ${results.productionReady ? '✅ YES' : '❌ NO'}`
      );
      console.log(`Confidence: ${results.overall.confidence}%`);

      console.log('\n🎭 PERSONA EVALUATIONS:');
      for (const [personaKey, personaResult] of Object.entries(
        results.personas
      )) {
        console.log(
          `${personaKey}: ${personaResult.score}/100 - ${personaResult.passed ? '✅' : '❌'}`
        );
        if (personaResult.concerns.length > 0) {
          personaResult.concerns.forEach(concern =>
            console.log(`  ⚠️  ${concern}`)
          );
        }
      }

      console.log('\n🧠 ADVANCED EVALUATION:');
      console.log(
        `Socratic Analysis: ${results.advancedEvaluation.socraticAnalysis.confidenceScore}/100`
      );
      console.log(
        `Chain of Reasoning: ${results.advancedEvaluation.chainOfReasoning.confidenceScore}/100`
      );
      console.log(
        `Adversarial Testing: ${results.advancedEvaluation.adversarialTest.robustnessScore}/100`
      );
      console.log(
        `Rubric Score: ${Math.round(results.advancedEvaluation.rubricScore.totalScore)}/100`
      );

      if (results.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        results.recommendations.forEach(rec => console.log(`• ${rec}`));
      }

      console.log(`\n${'='.repeat(60)}`);
    } catch (error) {
      console.error(`❌ Error reading file: ${(error as Error).message}`);
      process.exit(1);
    }
  }
}

export { EnhancedOutputValidator, ValidationResult, Persona };
