#!/usr/bin/env node

/**
 * Simple TUI Validator - Terminal Interface for Enhanced AI Evaluation
 *
 * Interactive terminal interface for pasting client ADR content and getting instant validation
 */

import { createInterface } from 'readline';
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

function clearScreen(): void {
  console.clear();
}

function printHeader(): void {
  console.log(
    `${colors.blue}${colors.white}    🧠 ENHANCED AI EVALUATION TUI    ${colors.reset}`
  );
  console.log(
    `${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.yellow}📝 Paste client ADR content → Get instant expert validation${colors.reset}`
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

// Main TUI Class
class SimpleTUIValidator {
  private rl: any;
  private validator: EnhancedOutputValidator;

  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.validator = new EnhancedOutputValidator();
  }

  async start(): Promise<void> {
    clearScreen();
    printHeader();
    printInfo('Welcome to the Enhanced AI Evaluation Terminal Interface!');

    await this.showMenu();
  }

  private async showMenu(): Promise<void> {
    while (true) {
      console.log(
        `\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`
      );
      console.log(`${colors.white}📋 MENU OPTIONS:${colors.reset}`);
      console.log(`${colors.green}1.${colors.reset} Paste new ADR content`);
      console.log(`${colors.green}2.${colors.reset} Load ADR from file`);
      console.log(`${colors.green}3.${colors.reset} View sample ADR`);
      console.log(`${colors.red}4.${colors.reset} Exit`);
      console.log(
        `${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`
      );

      const choice = await this.askQuestion('Enter your choice (1-4): ');

      switch (choice.trim()) {
        case '1':
          await this.pasteADR();
          break;
        case '2':
          await this.loadFromFile();
          break;
        case '3':
          await this.showSampleADR();
          break;
        case '4':
          this.exit();
          return;
        default:
          printError('Invalid choice. Please enter 1-4.');
          await this.askQuestion('Press Enter to continue...');
          break;
      }
    }
  }

  private async pasteADR(): Promise<void> {
    clearScreen();
    printHeader();
    printSection('PASTE ADR CONTENT');
    printInfo(
      'Paste your client ADR content below. Press Enter twice when done:'
    );

    console.log(`${colors.cyan}─`.repeat(60));

    const content = await this.collectMultilineInput();

    if (content.trim().length === 0) {
      printError('No content provided.');
      await this.askQuestion('Press Enter to return to menu...');
      return;
    }

    console.log(`${colors.cyan}─`.repeat(60));

    printInfo('Analyzing ADR content with advanced AI evaluation...');

    try {
      const results = this.validator.validateOutput(content);
      this.displayResults(results);
    } catch (error) {
      printError(`Analysis failed: ${(error as Error).message}`);
    }

    await this.askQuestion('\nPress Enter to return to menu...');
  }

  private async loadFromFile(): Promise<void> {
    clearScreen();
    printHeader();
    printSection('LOAD ADR FROM FILE');

    const filePath = await this.askQuestion('Enter file path: ');

    try {
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        printError(`File not found: ${filePath}`);
        await this.askQuestion('Press Enter to return to menu...');
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      printSuccess(`File loaded: ${filePath}`);
      printInfo('Analyzing ADR content with advanced AI evaluation...');

      const results = this.validator.validateOutput(content);
      this.displayResults(results);
    } catch (error) {
      printError(`Error loading file: ${(error as Error).message}`);
    }

    await this.askQuestion('\nPress Enter to return to menu...');
  }

  private async showSampleADR(): Promise<void> {
    clearScreen();
    printHeader();
    printSection('SAMPLE ADR');

    console.log(
      `${colors.cyan}Sample ADR content for demonstration:${colors.reset}\n`
    );
    console.log(`${colors.white}${SAMPLE_ADR}${colors.reset}\n`);

    const proceed = await this.askQuestion('Analyze this sample ADR? (y/n): ');

    if (proceed.toLowerCase() === 'y') {
      printInfo('Analyzing sample ADR with advanced AI evaluation...');

      const results = this.validator.validateOutput(SAMPLE_ADR);
      this.displayResults(results);
    }

    await this.askQuestion('\nPress Enter to return to menu...');
  }

  private displayResults(results: any): void {
    clearScreen();
    printHeader();

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
    for (const [personaKey, personaResult] of Object.entries(
      results.personas
    )) {
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

  private async collectMultilineInput(): Promise<string> {
    const lines: string[] = [];
    let emptyLineCount = 0;

    while (true) {
      const line = await this.askQuestion('');

      if (line.trim() === '') {
        emptyLineCount++;
        if (emptyLineCount >= 2) {
          break;
        }
      } else {
        emptyLineCount = 0;
      }

      lines.push(line);
    }

    return lines.join('\n');
  }

  private async askQuestion(question: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(question, (answer: string) => {
        resolve(answer);
      });
    });
  }

  private exit(): void {
    clearScreen();
    console.log(
      `${colors.green}👋 Thank you for using Enhanced AI Evaluation TUI!${colors.reset}`
    );
    console.log(
      `${colors.blue}🔍 Advanced AI evaluation techniques for client ADR validation${colors.reset}`
    );
    this.rl.close();
  }
}

// CLI Entry Point
if (require.main === module) {
  const tui = new SimpleTUIValidator();
  tui.start().catch(error => {
    console.error(
      `${colors.red}❌ Fatal error: ${(error as Error).message}${colors.reset}`
    );
    process.exit(1);
  });
}

export { SimpleTUIValidator };
