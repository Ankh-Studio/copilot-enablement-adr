#!/usr/bin/env node

/**
 * Client-Side Validation Workflow
 *
 * Complete workflow that runs on client's machine:
 * 1. AI Assessment → Generates ADR with reasoning
 * 2. Output Quality Validation → Validates with scores/reasons
 * 3. Client brings validated results to us
 *
 * No need to copy output back to repo - everything runs locally!
 */

console.log('🏢 Client-Side Validation Workflow');
console.log('='.repeat(60));
console.log('Complete local assessment and validation...\n');

// Step 1: AI Assessment (runs on client machine)
console.log('📍 Step 1: AI Assessment (Client Machine)');
console.log('-'.repeat(40));

interface AssessmentResult {
  adr: string; // The ADR document
  reasoning: string; // AI reasoning behind decisions
  confidence: string; // Confidence level
  metadata: any; // Raw analysis data
}

function runAIAssessment(repoPath: string): AssessmentResult {
  console.log(`🔍 Analyzing repository: ${repoPath}`);
  console.log('📊 Running tech stack analysis...');
  console.log('🤖 AI generating recommendations...');

  // Simulate AI assessment output
  return {
    adr: `# ADR-001: AI Enablement Strategy

## Status
ACCEPTED

## Context
Our organization needs to implement AI-powered development tools to improve productivity and code quality. Current tech stack analysis shows we have a solid foundation but lack AI integration.

## Decision
We will implement a phased AI enablement approach:

### Phase 1: Foundation (Weeks 1-4)
1. **Copilot Integration** - Enable GitHub Copilot across all repositories
2. **Code Review Enhancement** - Implement AI-assisted code review
3. **Documentation Generation** - Auto-generate technical documentation

### Phase 2: Advanced (Weeks 5-8)
1. **AI Testing Assistant** - Implement intelligent test generation
2. **Performance Optimization** - AI-powered performance monitoring
3. **Security Scanning** - Enhanced AI security analysis

### Phase 3: Automation (Weeks 9-12)
1. **CI/CD Intelligence** - AI-optimized deployment pipelines
2. **Knowledge Management** - AI-powered documentation maintenance
3. **Custom AI Tools** - Develop organization-specific AI assistants

## Consequences
### Positive
- Improved developer productivity (estimated 30% increase)
- Better code quality and consistency
- Enhanced security posture
- Reduced technical debt accumulation

### Negative
- Initial learning curve for team members
- Subscription costs for AI services
- Need for new governance policies

### Risks
- AI dependency may reduce manual code review skills
- Potential for AI-generated code to introduce vulnerabilities
- Data privacy concerns with AI services

## Implementation Plan
\`\`\`bash
# Week 1: Enable Copilot
gh copilot enable --repo organization/*

# Week 2: Configure AI code review
# Add AI review prompts to .github/copilot-instructions.md

# Week 3: Set up documentation generation
# Implement AI-powered README and API docs generation

# Week 4: Monitor and adjust
# Track productivity metrics and AI usage patterns
\`\`\`

## Success Metrics
- Developer productivity: +30%
- Code review time: -40%
- Documentation coverage: +50%
- Security vulnerabilities: -25%
- Developer satisfaction: +20%`,

    reasoning: `## AI Reasoning Behind Recommendations

### Technology Stack Analysis
- **Current State**: Mixed TypeScript/JavaScript stack with basic testing
- **Strengths**: Modern language adoption, some CI/CD in place
- **Gaps**: No AI integration, limited automation, basic security

### Why Phased Approach?
1. **Risk Management**: Gradual adoption reduces disruption
2. **Learning Curve**: Team needs time to adapt to AI tools
3. **Budget Planning**: Spread costs over multiple quarters
4. **Success Measurement**: Each phase provides measurable outcomes

### Copilot First Priority
- **Highest ROI**: Immediate productivity gains
- **Lowest Risk**: Well-established tool with proven track record
- **Team Buy-in**: Developers already familiar with GitHub ecosystem

### Security Considerations
- Current security posture is moderate
- AI tools can enhance security scanning
- Need for AI-specific security policies
- Data governance requirements for AI usage

### Timeline Rationale
- 12-week timeline balances speed with thoroughness
- Each phase builds on previous successes
- Allows for course corrections based on metrics
- Aligns with typical quarterly planning cycles`,

    confidence: 'high',
    metadata: {
      techStack: {
        languages: { TypeScript: 45, JavaScript: 30, CSS: 15 },
        technologies: ['react', 'typescript', 'eslint', 'jest', 'webpack'],
        confidence: 'medium',
      },
      security: { available: true, configured: true },
      artifacts: {
        copilotInstructions: false,
        adrFiles: 2,
        testFiles: 8,
      },
      readinessScores: {
        repo: 65,
        team: 60,
        org: 55,
        overall: 60,
      },
    },
  };
}

// Step 2: Output Quality Validation (runs on client machine)
console.log('\n📍 Step 2: Output Quality Validation (Client Machine)');
console.log('-'.repeat(40));

interface ValidationResult {
  overall: {
    passed: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  };
  categories: {
    reasonableness: { passed: boolean; score: number; issues: string[] };
    acceptability: { passed: boolean; score: number; issues: string[] };
    safety: { passed: boolean; score: number; issues: string[] };
    adversarial: { passed: boolean; score: number; issues: string[] };
  };
  productionReady: boolean;
  executiveSummary: string;
}

function validateOutputQuality(assessment: AssessmentResult): ValidationResult {
  console.log('🔍 Running quality validation...');
  console.log('📊 Checking reasonableness, acceptability, safety...');

  // Validate the ADR content
  const adrValidation = validateADRContent(assessment.adr);
  const reasoningValidation = validateReasoningContent(assessment.reasoning);

  // Combine validations
  const overallScore = Math.round(
    (adrValidation.score + reasoningValidation.score) / 2
  );
  const passed =
    adrValidation.passed && reasoningValidation.passed && overallScore >= 70;

  return {
    overall: {
      passed,
      score: overallScore,
      issues: [...adrValidation.issues, ...reasoningValidation.issues],
      recommendations: generateRecommendations(
        adrValidation,
        reasoningValidation
      ),
    },
    categories: {
      reasonableness: checkReasonableness(assessment),
      acceptability: checkAcceptability(assessment),
      safety: checkSafety(assessment),
      adversarial: checkAdversarial(assessment),
    },
    productionReady: passed,
    executiveSummary: generateExecutiveSummary(
      assessment,
      overallScore,
      passed
    ),
  };
}

function validateADRContent(adr: string): {
  passed: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  // Check required ADR sections
  const requiredSections = [
    '## Status',
    '## Context',
    '## Decision',
    '## Consequences',
    '## Implementation Plan',
  ];
  requiredSections.forEach(section => {
    if (!adr.includes(section)) {
      issues.push(`Missing required section: ${section}`);
      score -= 20;
    }
  });

  // Check for balanced consequences
  if (adr.includes('## Consequences')) {
    const consequencesSection = adr.split('## Consequences')[1].split('##')[0];
    if (
      !consequencesSection.includes('### Positive') ||
      !consequencesSection.includes('### Negative')
    ) {
      issues.push(
        'Consequences section should include both positive and negative impacts'
      );
      score -= 15;
    }
  }

  // Check for implementation details
  if (!adr.includes('```bash') && !adr.includes('```')) {
    issues.push('Implementation plan should include concrete steps');
    score -= 10;
  }

  // Check for success metrics
  if (!adr.includes('## Success Metrics')) {
    issues.push('Should include measurable success criteria');
    score -= 10;
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    issues,
  };
}

function validateReasoningContent(reasoning: string): {
  passed: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  // Check for logical structure
  if (!reasoning.includes('###') || reasoning.split('###').length < 3) {
    issues.push('Reasoning should be well-structured with clear sections');
    score -= 15;
  }

  // Check for evidence-based reasoning
  if (
    !reasoning.toLowerCase().includes('because') &&
    !reasoning.toLowerCase().includes('due to')
  ) {
    issues.push('Reasoning should include evidence and justification');
    score -= 20;
  }

  // Check for risk awareness
  if (
    !reasoning.toLowerCase().includes('risk') &&
    !reasoning.toLowerCase().includes('consideration')
  ) {
    issues.push('Reasoning should acknowledge risks and trade-offs');
    score -= 15;
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    issues,
  };
}

function checkReasonableness(assessment: AssessmentResult): {
  passed: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  // Check consistency between confidence and content
  if (assessment.confidence === 'high' && assessment.adr.length < 500) {
    issues.push('High confidence but limited content depth');
    score -= 15;
  }

  // Check for logical flow in ADR
  if (
    !assessment.adr.includes('Context') ||
    !assessment.adr.includes('Decision')
  ) {
    issues.push('ADR missing logical flow from context to decision');
    score -= 20;
  }

  return { passed: score >= 70, score: Math.max(0, score), issues };
}

function checkAcceptability(assessment: AssessmentResult): {
  passed: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  // Check ADR format compliance
  if (!assessment.adr.startsWith('# ADR-')) {
    issues.push('ADR should follow standard naming convention');
    score -= 10;
  }

  // Check for actionable content
  if (!assessment.adr.includes('## Implementation Plan')) {
    issues.push('ADR should include implementation plan');
    score -= 15;
  }

  return { passed: score >= 70, score: Math.max(0, score), issues };
}

function checkSafety(assessment: AssessmentResult): {
  passed: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  // Check for dangerous recommendations
  const dangerousPatterns = [
    /delete all/i,
    /disable security/i,
    /skip testing/i,
  ];
  dangerousPatterns.forEach(pattern => {
    if (pattern.test(assessment.adr)) {
      issues.push('Potentially dangerous recommendation detected');
      score -= 50;
    }
  });

  // Check for security awareness
  if (
    !assessment.adr.toLowerCase().includes('security') &&
    !assessment.reasoning.toLowerCase().includes('security')
  ) {
    issues.push('Should consider security implications');
    score -= 10;
  }

  return { passed: score >= 70, score: Math.max(0, score), issues };
}

function checkAdversarial(assessment: AssessmentResult): {
  passed: boolean;
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 90;

  // Check for overconfidence
  const overconfidenceWords = ['guaranteed', 'always', 'never', 'perfect'];
  const overconfidenceCount = overconfidenceWords.filter(
    word =>
      assessment.adr.toLowerCase().includes(word) ||
      assessment.reasoning.toLowerCase().includes(word)
  ).length;

  if (overconfidenceCount > 2) {
    issues.push('Excessive overconfidence detected');
    score -= 15;
  }

  return { passed: score >= 70, score: Math.max(0, score), issues };
}

function generateRecommendations(
  adrValidation: any,
  reasoningValidation: any
): string[] {
  const recommendations: string[] = [];

  if (adrValidation.score < 70) {
    recommendations.push('Enhance ADR structure with missing sections');
  }

  if (reasoningValidation.score < 70) {
    recommendations.push(
      'Strengthen reasoning with more evidence and justification'
    );
  }

  if (
    adrValidation.issues.some((issue: string) => issue.includes('Consequences'))
  ) {
    recommendations.push(
      'Balance consequences with both positive and negative impacts'
    );
  }

  return recommendations;
}

function generateExecutiveSummary(
  assessment: AssessmentResult,
  score: number,
  passed: boolean
): string {
  const status = passed ? '✅ APPROVED' : '❌ NEEDS REVISION';
  const confidence = assessment.confidence.toUpperCase();

  return `
# Executive Summary

**Status**: ${status}
**Overall Score**: ${score}/100
**Confidence Level**: ${confidence}

## Assessment Overview
${
  passed
    ? 'The AI enablement strategy assessment has passed quality validation and is recommended for implementation.'
    : 'The assessment requires revisions before implementation. See issues and recommendations below.'
}

## Key Findings
- ADR Structure: ${assessment.adr.includes('## Context') && assessment.adr.includes('## Decision') ? '✅ Complete' : '⚠️ Needs improvement'}
- Reasoning Quality: ${assessment.reasoning.length > 200 ? '✅ Comprehensive' : '⚠️ Could be expanded'}
- Risk Awareness: ${assessment.adr.toLowerCase().includes('risk') ? '✅ Addressed' : '⚠️ Should be added'}

## Next Steps
${
  passed
    ? '✅ Ready to present to stakeholders for approval'
    : '🔧 Address validation issues and re-run assessment'
}
`;
}

// Step 3: Complete client workflow
console.log('\n📍 Step 3: Complete Client Workflow');
console.log('-'.repeat(40));

function runCompleteClientWorkflow(repoPath: string): {
  assessment: AssessmentResult;
  validation: ValidationResult;
  finalReport: string;
} {
  console.log(`🚀 Running complete workflow for: ${repoPath}`);

  // Step 1: Run AI assessment
  const assessment = runAIAssessment(repoPath);

  // Step 2: Validate output quality
  const validation = validateOutputQuality(assessment);

  // Step 3: Generate final report
  const finalReport = generateFinalReport(assessment, validation);

  return { assessment, validation, finalReport };
}

function generateFinalReport(
  assessment: AssessmentResult,
  validation: ValidationResult
): string {
  return `
# AI Enablement Assessment Report

**Generated**: ${new Date().toISOString()}
**Repository**: Client Repository
**Validation Score**: ${validation.overall.score}/100
**Status**: ${validation.productionReady ? '✅ PRODUCTION READY' : '❌ NEEDS REVISION'}

---

${validation.executiveSummary}

---

## Detailed Assessment

### Architecture Decision Record (ADR)

${assessment.adr}

---

### AI Reasoning

${assessment.reasoning}

---

## Quality Validation Results

### Overall Assessment
- **Score**: ${validation.overall.score}/100
- **Status**: ${validation.overall.passed ? '✅ PASSED' : '❌ FAILED'}
- **Production Ready**: ${validation.productionReady ? '✅ YES' : '❌ NO'}

### Category Breakdown
- **Reasonableness**: ${validation.categories.reasonableness.passed ? '✅' : '❌'} ${validation.categories.reasonableness.score}/100
- **Acceptability**: ${validation.categories.acceptability.passed ? '✅' : '❌'} ${validation.categories.acceptability.score}/100
- **Safety**: ${validation.categories.safety.passed ? '✅' : '❌'} ${validation.categories.safety.score}/100
- **Adversarial**: ${validation.categories.adversarial.passed ? '✅' : '❌'} ${validation.categories.adversarial.score}/100

### Issues Found
${
  validation.overall.issues.length > 0
    ? validation.overall.issues.map(issue => `- ⚠️ ${issue}`).join('\n')
    : '- ✅ No critical issues detected'
}

### Recommendations
${
  validation.overall.recommendations.length > 0
    ? validation.overall.recommendations.map(rec => `- 💡 ${rec}`).join('\n')
    : '- ✅ Assessment meets all quality standards'
}

---

## What to Bring to Your Consultant

### If ✅ PRODUCTION READY:
1. **This complete report** - Shows validated assessment
2. **The ADR section** - Ready for implementation
3. **Validation scores** - Proof of quality assurance

### If ❌ NEEDS REVISION:
1. **Issues identified** - What needs to be fixed
2. **Recommendations** - How to improve the assessment
3. **Re-run assessment** - After addressing issues

---

*This report was generated automatically using AI assessment and quality validation on the client's machine.*
`;
}

// Demo the complete workflow
console.log('🎭 Demo: Complete Client-Side Workflow');
console.log('-'.repeat(40));

const clientWorkflow = runCompleteClientWorkflow('./client-repository');

console.log('\n📊 Workflow Results:');
console.log(
  `✅ Assessment Generated: ${clientWorkflow.assessment.adr.length} chars`
);
console.log(
  `🔍 Validation Score: ${clientWorkflow.validation.overall.score}/100`
);
console.log(
  `🚀 Production Ready: ${clientWorkflow.validation.productionReady ? 'YES' : 'NO'}`
);

console.log(
  '\n📄 Final Report Length:',
  clientWorkflow.finalReport.length,
  'characters'
);

// Show what client brings to consultant
console.log('\n🎯 What Client Brings to Consultant:');
console.log('-'.repeat(40));

if (clientWorkflow.validation.productionReady) {
  console.log('✅ CLIENT BRINGS:');
  console.log('   📄 Complete validated assessment report');
  console.log('   🎯 Production-ready ADR with implementation plan');
  console.log('   📊 Quality validation scores and reasoning');
  console.log('   🚀 Ready for immediate implementation discussion');
  console.log('\n💼 CONSULTANT RECEIVES:');
  console.log('   ✅ Pre-validated, high-quality assessment');
  console.log('   📈 Data-driven recommendations with evidence');
  console.log('   🎯 Clear implementation roadmap');
  console.log('   ⚡ Ready-to-execute strategy');
} else {
  console.log('❌ CLIENT BRINGS:');
  console.log('   📄 Assessment report with identified issues');
  console.log('   🔍 Validation results showing what needs fixing');
  console.log('   💡 Specific recommendations for improvement');
  console.log('\n💼 CONSULTANT RECEIVES:');
  console.log('   🔍 Clear understanding of quality gaps');
  console.log('   💡 Actionable improvement guidance');
  console.log('   📋 Framework for re-assessment');
  console.log('   🎯 Path to production-ready assessment');
}

console.log('\n🔄 Client Commands:');
console.log('-'.repeat(40));
console.log('# Step 1: Run assessment');
console.log('npx @ankh-studio/ai-enablement-assessment --repo ./my-project');
console.log('');
console.log('# Step 2: Validate quality');
console.log('npx @ankh-studio/validate-assessment assessment-output.md');
console.log('');
console.log('# Step 3: Generate report');
console.log(
  'npx @ankh-studio/generate-report --assessment assessment.md --validation results.json'
);
console.log('');
console.log('# Step 4: Bring report to consultant');
console.log('# No need to copy files back to repo - everything runs locally!');

console.log(`\n${'='.repeat(60)}`);
console.log('🎉 Client-Side Validation Workflow Complete!');
console.log('🎯 Everything runs on client machine - no copying required!');
