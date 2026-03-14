#!/usr/bin/env node

/**
 * CLI Validator - Command Line Interface for Enhanced AI Evaluation
 *
 * Simple command-line tool for validating client ADR content
 */

import { readFileSync, existsSync } from 'fs';
import { EnhancedOutputValidator } from './enhanced-output-validator';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function printHeader(): void {
  console.log(
    `${colors.blue}${colors.white}    🧠 ENHANCED AI EVALUATION CLI    ${colors.reset}`
  );
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.yellow}📝 Advanced AI evaluation for client ADR validation${colors.reset}`
  );
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`
  );
}

function printSuccess(message: string): void {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function printWarning(message: string): void {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function printError(message: string): void {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function printInfo(message: string): void {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function printSection(title: string): void {
  console.log(`\n${colors.magenta}${colors.bright}📊 ${title}${colors.reset}`);
  console.log(`${colors.cyan}─`.repeat(60));
}

function getScoreColor(score: number): string {
  if (score >= 80) return colors.green;
  if (score >= 60) return colors.yellow;
  return colors.red;
}

function displayResults(results: any): void {
  // Overall Results
  printSection('EVALUATION RESULTS');
  const overallColor = results.overall.passed ? colors.green : colors.red;
  const readyColor = results.productionReady ? colors.green : colors.red;

  console.log(
    `${overallColor}📊 Overall Score: ${results.overall.score}/100${colors.reset}`
  );
  console.log(
    `${readyColor}🚀 Production Ready: ${results.productionReady ? 'YES ✅' : 'NO ❌'}${colors.reset}`
  );
  console.log(
    `${colors.blue}🎯 Confidence: ${results.overall.confidence}%${colors.reset}`
  );

  // Persona Evaluations
  printSection('PERSONA EVALUATIONS');
  for (const [personaKey, personaResult] of Object.entries(results.personas)) {
    const persona = personaResult as any;
    const status = persona.passed
      ? `${colors.green}✅ PASS${colors.reset}`
      : `${colors.red}❌ FAIL${colors.reset}`;
    const scoreColor = getScoreColor(persona.score);

    console.log(
      `${colors.cyan}🎭 ${personaKey}:${colors.reset} ${scoreColor}${persona.score}/100${colors.reset} ${status}`
    );

    if (persona.concerns && persona.concerns.length > 0) {
      persona.concerns.forEach((concern: string) => {
        console.log(`   ${colors.yellow}⚠️  ${concern}${colors.reset}`);
      });
    }
  }

  // Advanced Evaluation
  printSection('ADVANCED AI EVALUATION');
  const { socraticAnalysis, chainOfReasoning, adversarialTest, rubricScore } =
    results.advancedEvaluation;

  console.log(
    `${colors.blue}🧠 Socratic Analysis:${colors.reset} ${getScoreColor(socraticAnalysis.confidenceScore)}${socraticAnalysis.confidenceScore}/100${colors.reset}`
  );
  console.log(
    `${colors.blue}🔗 Chain of Reasoning:${colors.reset} ${getScoreColor(chainOfReasoning.confidenceScore)}${chainOfReasoning.confidenceScore}/100${colors.reset}`
  );
  console.log(
    `${colors.blue}⚔️  Adversarial Testing:${colors.reset} ${getScoreColor(adversarialTest.robustnessScore)}${adversarialTest.robustnessScore}/100${colors.reset}`
  );
  console.log(
    `${colors.blue}📋 Rubric Score:${colors.reset} ${getScoreColor(Math.round(rubricScore.totalScore))}${Math.round(rubricScore.totalScore)}/100${colors.reset}`
  );

  // Recommendations
  if (results.recommendations && results.recommendations.length > 0) {
    console.log(
      `\n${colors.yellow}${colors.bright}💡 RECOMMENDATIONS:${colors.reset}`
    );
    results.recommendations.forEach((rec: string, index: number) => {
      console.log(`${colors.yellow}${index + 1}. ${rec}${colors.reset}`);
    });
  }

  // Summary
  console.log(
    `\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`
  );
  if (results.productionReady) {
    printSuccess('This ADR meets production readiness standards!');
  } else {
    printWarning('This ADR needs improvements before production use.');
  }
  console.log(
    `${colors.blue}🔍 Analysis completed using advanced AI evaluation techniques${colors.reset}`
  );
}

// Sample ADR for demonstration
const SAMPLE_ADR = `# ADR-001: AI Enablement Strategy

## Status
ACCEPTED

## Context
Our organization needs to implement AI-powered development tools to improve productivity and code quality while maintaining security standards.

## Decision
We will implement GitHub Copilot across all repositories and establish comprehensive AI development guidelines.

## Implementation Plan
1. Week 1-2: Enable Copilot organization-wide
2. Week 3-4: Create AI development guidelines  
3. Week 5-6: Establish code review processes
4. Week 7-8: Monitor and optimize

## Consequences
### Positive
- Improved developer productivity by 30%
- Better code quality and consistency
- Enhanced security posture with AI assistance

### Negative
- Learning curve for team members
- Subscription costs of $10 per developer

## Risk Mitigation
- Gradual rollout with pilot team
- Comprehensive training program
- Regular security audits

## Success Metrics
- Developer productivity: +30%
- Code review time: -40%  
- Security vulnerabilities: -25%
- Team satisfaction: >80%`;

function showUsage(): void {
  console.log(`${colors.cyan}Usage:${colors.reset}`);
  console.log(
    `  ${colors.green}npx ts-node cli-validator.ts <file>${colors.reset}    Validate ADR from file`
  );
  console.log(
    `  ${colors.green}npx ts-node cli-validator.ts --demo${colors.reset}    Run demo with sample ADR`
  );
  console.log(
    `  ${colors.green}npx ts-node cli-validator.ts --help${colors.reset}    Show this help`
  );
  console.log(`\n${colors.yellow}Examples:${colors.reset}`);
  console.log(
    `  ${colors.blue}npx ts-node cli-validator.ts examples/sample-adr-output.md${colors.reset}`
  );
  console.log(
    `  ${colors.blue}npx ts-node cli-validator.ts my-client-adr.md${colors.reset}`
  );
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHeader();
    printError('No arguments provided.');
    showUsage();
    process.exit(1);
  }

  const command = args[0];

  if (command === '--help' || command === '-h') {
    printHeader();
    showUsage();
    return;
  }

  if (command === '--demo') {
    printHeader();
    printInfo('Running demo with sample ADR...');

    const validator = new EnhancedOutputValidator();
    const results = validator.validateOutput(SAMPLE_ADR);
    displayResults(results);
    return;
  }

  // Validate file
  const filePath = command;

  if (!existsSync(filePath)) {
    printHeader();
    printError(`File not found: ${filePath}`);
    showUsage();
    process.exit(1);
  }

  try {
    const content = readFileSync(filePath, 'utf8');

    printHeader();
    printSuccess(`File loaded: ${filePath}`);
    printInfo('Analyzing ADR content with advanced AI evaluation...');

    const validator = new EnhancedOutputValidator();
    const results = validator.validateOutput(content);
    displayResults(results);
  } catch (error) {
    printHeader();
    printError(`Error reading file: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as cliMain };
