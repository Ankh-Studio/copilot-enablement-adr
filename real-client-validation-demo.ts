#!/usr/bin/env node

/**
 * Real Client Validation Demo
 *
 * Shows how the Output Quality Validator would work in practice:
 * 1. Client runs the assessment on their machine
 * 2. Client gets the AI-generated output
 * 3. We validate that output before trusting it
 */

import { OutputQualityValidator } from './output-quality-validator';

console.log('🏢 Real Client Validation Workflow');
console.log('='.repeat(60));
console.log('Simulating client assessment and validation...\n');

// Step 1: Simulate client running assessment
console.log('📍 Step 1: Client Runs Assessment');
console.log('-'.repeat(40));

function simulateClientAssessment(clientRepo: string) {
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

const validator = new OutputQualityValidator();

// Test with different client scenarios
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
  if (validationResult.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    validationResult.recommendations.forEach(rec => console.log(`   ${rec}`));
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
