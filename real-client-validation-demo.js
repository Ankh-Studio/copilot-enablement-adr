#!/usr/bin/env node

/**
 * Real Client Validation Demo
 *
 * Shows how the Output Quality Validator would work in practice:
 * 1. Client runs the assessment on their machine
 * 2. Client gets the AI-generated output
 * 3. We validate that output before trusting it
 */

// const { OutputQualityValidator } = require('./output-quality-validator'); // Using inline validator for demo

console.log('🏢 Real Client Validation Workflow');
console.log('='.repeat(60));
console.log('Simulating client assessment and validation...\n');

// Step 1: Simulate client running assessment
console.log('📍 Step 1: Client Runs Assessment');
console.log('-'.repeat(40));

function simulateClientAssessment(clientRepo) {
  console.log(`🏢 Client: ${clientRepo}`);
  console.log('📁 Client runs: npx @ankh-studio/ai-enablement-assessment');
  console.log('⏳ Analyzing repository...');

  // Simulate different client scenarios
  const clientOutputs = {
    'acme-corp': {
      output: `# AI Enablement Assessment

## Current State Analysis

### Technology Stack
Languages: JavaScript (45), TypeScript (20), CSS (15). Technologies: react, typescript, eslint, webpack, jest
Confidence: medium

### Security Posture
Security features partially configured

### Repository Artifacts
- Copilot Instructions: Not found
- ADR Files: 1 found
- Documentation: 2 files
- Test Files: 5 files

## Readiness Assessment

### Repository Dimension: 55/100
Mixed tech stack, Some testing, Basic documentation

### Team Dimension: 50/100
Partial code review, Some standards

### Organizational Dimension: 45/100
Partial security policies

### Overall Readiness Score: 50/100

## Recommendations

### Medium Readiness - Improvement Plan
1. Expand technology stack with modern tools
2. Implement comprehensive testing framework
3. Enhance security configuration
4. Develop documentation standards`,

      context: {
        scenario: 'Medium-Readiness Repository',
        repository: clientRepo,
        inputData: {
          techStack: { confidence: 'medium', summary: 'Mixed tech stack' },
          security: { available: true },
          artifacts: { copilotInstructions: false },
        },
      },
    },

    'startup-xyz': {
      output: `bad output with no structure and always guaranteed success always`,

      context: {
        scenario: 'Low-Quality Output',
        repository: clientRepo,
        inputData: {
          techStack: { confidence: 'low', summary: 'Minimal tech stack' },
          security: { available: false },
          artifacts: { copilotInstructions: false },
        },
      },
    },

    'enterprise-abc': {
      output: `# AI Enablement Assessment

## Current State Analysis

### Technology Stack
Languages: TypeScript (200), JavaScript (100), Python (50), Go (30). Technologies: react, typescript, nodejs, docker, kubernetes, github-actions, eslint, prettier, jest, webpack, vitest, terraform, helm
Confidence: high

### Security Posture
Security features configured and enabled

### Repository Artifacts
- Copilot Instructions: Found
- ADR Files: 5 found
- Documentation: 10 files
- Test Files: 20 files

## Readiness Assessment

### Repository Dimension: 90/100
Excellent TypeScript adoption, Comprehensive testing, CI/CD pipeline, Infrastructure as code

### Team Dimension: 85/100
Code review process, Documentation standards, Testing culture, Security practices

### Organizational Dimension: 80/100
Security policies, Compliance framework, Governance

### Overall Readiness Score: 85/100

## Recommendations

### High Readiness - Next Steps
1. Implement AI-powered code review assistance
2. Enhance security posture with advanced features
3. Scale documentation practices
4. Leverage existing tech stack for AI integration
5. Consider advanced AI automation workflows`,

      context: {
        scenario: 'High-Readiness Repository',
        repository: clientRepo,
        inputData: {
          techStack: {
            confidence: 'high',
            summary: 'Comprehensive enterprise tech stack',
          },
          security: { available: true },
          artifacts: { copilotInstructions: true },
        },
      },
    },
  };

  return clientOutputs[clientRepo] || clientOutputs['startup-xyz'];
}

// Step 2: Client sends us their output for validation
console.log('\n📍 Step 2: Client Sends Output for Validation');
console.log('-'.repeat(40));

console.log('📤 Client sends assessment output to us');
console.log('📧 We receive: assessment output + context data');
console.log('🔍 Our job: Validate before trusting/recommending');

// Step 3: We run the Output Quality Validator
console.log('\n📍 Step 3: We Run Output Quality Validation');
console.log('-'.repeat(40));

// Simple validator for demo (since we can't import the TypeScript one easily)
class SimpleOutputQualityValidator {
  validateOutput(output, context) {
    const results = {
      reasonableness: this.checkReasonableness(output, context),
      acceptability: this.checkAcceptability(output, context),
      safety: this.checkSafety(output, context),
      adversarial: this.checkAdversarial(output, context),
    };

    const overallScore =
      Object.values(results).reduce((sum, result) => sum + result.score, 0) / 4;
    const criticalIssues = Object.values(results).filter(
      r => r.critical && !r.passed
    );

    return {
      overall: {
        passed: criticalIssues.length === 0 && overallScore >= 70,
        score: Math.round(overallScore),
        issues: criticalIssues.map(r => r.issues).flat(),
        suggestions: Object.values(results)
          .map(r => r.suggestions)
          .flat(),
      },
      categoryResults: results,
      criticalIssues: criticalIssues.map(r => r.issues).flat(),
      productionReady: criticalIssues.length === 0 && overallScore >= 70,
    };
  }

  checkReasonableness(output, context) {
    const issues = [];
    let score = 100;

    // Check for contradictions
    if (
      output.includes('high confidence') &&
      output.includes('low confidence')
    ) {
      issues.push('Contradictory confidence levels');
      score -= 30;
    }

    // Check logical structure
    const sections = output.split('##').length;
    if (sections < 3) {
      issues.push('Insufficient structure');
      score -= 20;
    }

    // Check data consistency
    if (
      context.inputData?.security?.available &&
      !output.includes('security')
    ) {
      issues.push('Security not mentioned despite being enabled');
      score -= 15;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions: score < 70 ? ['Improve logical coherence'] : [],
      critical: true,
    };
  }

  checkAcceptability(output, context) {
    const issues = [];
    let score = 100;

    // Content quality
    if (output.length < 300) {
      issues.push('Output too short');
      score -= 25;
    }

    // Format compliance
    if (!output.includes('#')) {
      issues.push('Missing markdown headers');
      score -= 20;
    }

    // Actionability
    if (!output.includes('1.') && !output.includes('implement')) {
      issues.push('Lacks actionable recommendations');
      score -= 15;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions: score < 70 ? ['Enhance content quality'] : [],
      critical: true,
    };
  }

  checkSafety(output, context) {
    const issues = [];
    let score = 100;

    // Harmful content
    if (output.includes('delete all') || output.includes('disable security')) {
      issues.push('Potentially harmful instructions');
      score -= 50;
    }

    // Overconfidence
    const overconfidenceWords = ['always', 'never', 'perfect', 'guaranteed'];
    const overconfidenceCount = overconfidenceWords.filter(word =>
      output.toLowerCase().includes(word)
    ).length;

    if (overconfidenceCount > 2) {
      issues.push('Excessive overconfidence');
      score -= 15;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions: score < 70 ? ['Review safety compliance'] : [],
      critical: true,
    };
  }

  checkAdversarial(output, context) {
    const issues = [];
    let score = 90; // Non-critical, starts high

    // Overconfidence (already checked in safety, but also here)
    const overconfidenceWords = ['always', 'never', 'perfect', 'guaranteed'];
    const overconfidenceCount = overconfidenceWords.filter(word =>
      output.toLowerCase().includes(word)
    ).length;

    if (overconfidenceCount > 1) {
      issues.push('Overconfidence detected');
      score -= 10;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      suggestions: score < 70 ? ['Consider adversarial validation'] : [],
      critical: false, // Non-critical for now
    };
  }
}

// Test with different client scenarios
const validator = new SimpleOutputQualityValidator();
const clientScenarios = ['acme-corp', 'startup-xyz', 'enterprise-abc'];

clientScenarios.forEach((client, index) => {
  console.log(`\n🏢 Client Scenario ${index + 1}: ${client.toUpperCase()}`);
  console.log('='.repeat(50));

  // Get client's assessment output
  const clientData = simulateClientAssessment(client);

  console.log(
    `📄 Client Output Length: ${clientData.output.length} characters`
  );
  console.log(`🎯 Scenario: ${clientData.context.scenario}`);

  // Validate the client's output
  const validationResult = validator.validateOutput(
    clientData.output,
    clientData.context
  );

  console.log(`\n🎯 Validation Results:`);
  console.log(
    `   Overall: ${validationResult.overall.passed ? '✅' : '❌'} ${validationResult.overall.score}/100`
  );
  console.log(
    `   Production Ready: ${validationResult.productionReady ? '✅ YES' : '❌ NO'}`
  );

  // Show category results
  console.log(`\n📊 Category Breakdown:`);
  Object.entries(validationResult.categoryResults).forEach(
    ([category, result]) => {
      console.log(
        `   ${category}: ${result.passed ? '✅' : '❌'} ${result.score}/100`
      );
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`      ⚠️  ${issue}`));
      }
    }
  );

  // Show critical issues
  if (validationResult.criticalIssues.length > 0) {
    console.log(`\n🚨 Critical Issues:`);
    validationResult.criticalIssues.forEach(issue =>
      console.log(`   • ${issue}`)
    );
  }

  // Show recommendations
  if (validationResult.overall.suggestions.length > 0) {
    console.log(`\n💡 Recommendations:`);
    validationResult.overall.suggestions.forEach(rec =>
      console.log(`   ${rec}`)
    );
  }

  // Our decision based on validation
  console.log(`\n🤔 Our Decision:`);
  if (validationResult.productionReady) {
    console.log(`   ✅ APPROVED: Client assessment is valid and trustworthy`);
    console.log(`   📈 We can confidently use these recommendations`);
    console.log(`   🚀 Ready to proceed with implementation plan`);
  } else {
    console.log(`   ❌ REJECTED: Client assessment has quality issues`);
    console.log(`   🔧 Ask client to re-run assessment or provide more data`);
    console.log(`   ⚠️  Do not trust these recommendations for production`);
  }
});

// Step 4: Real-world workflow explanation
console.log('\n📍 Step 4: Real-World Workflow Explanation');
console.log('-'.repeat(40));

console.log(`
🔄 ACTUAL CLIENT WORKFLOW:
─────────────────────────

1. 🏢 CLIENT SIDE:
   npm install @ankh-studio/ai-enablement-assessment
   npx @ankh-studio/ai-enablement-assessment --repo ./my-project
   
   → Generates: assessment-output.md + context-data.json

2. 📤 CLIENT TO US:
   Client sends us: assessment-output.md
   We already have: context-data.json (from client's system)

3. 🔍 OUR VALIDATION:
   const validator = new OutputQualityValidator();
   const result = validator.validateOutput(clientOutput, context);
   
   if (result.productionReady) {
     // ✅ Trust the recommendations
     implementClientPlan(result.output);
   } else {
     // ❌ Ask for reassessment
     requestReassessment(result.criticalIssues);
   }

4. 🚀 PRODUCTION DECISION:
   Based on validation score and critical issues
   → Either proceed with implementation or ask for fixes

🎯 WHY THIS MATTERS:
────────────────────
• Prevents bad AI recommendations from reaching production
• Ensures client data is properly analyzed
• Maintains quality standards across all client engagements
• Provides defensible quality metrics for business decisions
• Creates audit trail for validation decisions

🔧 INTEGRATION POINTS:
──────────────────
• CLI tool: npx @ankh-studio/validate-assessment <output.md>
• API endpoint: POST /api/validate-assessment
• CI/CD gate: Validate before merge to production
• Client portal: Real-time validation feedback
`);

console.log('='.repeat(60));
console.log('🎉 Real Client Validation Demo Complete!');
console.log('📋 This shows how the validator works in actual client workflows');
