/**
 * Tech Stack Analyzer Skill Evaluation Runner
 *
 * Executes comprehensive evaluation of the Tech Stack Analyzer skill
 * using the structured testing framework with LLM-as-judge and deterministic checks
 */

import { SkillEvalHarness, SkillEvalSummary } from '../framework/eval-harness';
import { techStackAnalyzerTestCases } from '../test-cases/tech-stack-analyzer.test-cases';
import { TechStackAnalyzer } from '../../../skills/tech-stack-analyzer/scripts/analyzer';
import path from 'path';

/**
 * Mock LLM Judge for qualitative evaluation
 * In production, this would use a real LLM API
 */
class MockLLMJudge {
  async generate(prompt: string): Promise<string> {
    // Simple mock evaluation based on keyword matching
    if (prompt.includes('react') && prompt.includes('typescript')) {
      return '0.9'; // High score for React/TypeScript
    } else if (prompt.includes('express') && prompt.includes('node')) {
      return '0.8'; // Good score for Node.js
    } else if (prompt.includes('error') || prompt.includes('failed')) {
      return '0.3'; // Low score for errors
    } else {
      return '0.6'; // Neutral score
    }
  }
}

/**
 * Custom Skill Execution Implementation
 * Integrates with actual TechStackAnalyzer
 */
class TechStackSkillExecutor {
  async execute(_skillPath: string, _input: any): Promise<any> {
    const startTime = Date.now();

    try {
      // Extract repository path from input context
      const repoPath = _input.context?.repoPath || _input.repoPath || './';

      // Create analyzer instance
      const analyzer = new TechStackAnalyzer({ repoPath });

      // Execute analysis
      const result = await analyzer.analyze();

      // Get technology categories
      const categories = await analyzer.getTechnologyCategories();

      return {
        triggered: true,
        output: {
          ...result,
          categories,
        },
        filesCreated: [],
        apisUsed: ['@specfy/stack-analyser'],
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        triggered: false,
        output: {
          error: (error as Error).message,
          detected: null,
          confidence: 'low',
          summary: 'Analysis failed',
        },
        filesCreated: [],
        apisUsed: [],
        executionTime: Date.now() - startTime,
      };
    }
  }
}

/**
 * Enhanced Evaluation Harness with Tech Stack Analyzer integration
 */
class TechStackEvalHarness extends SkillEvalHarness {
  private executor: TechStackSkillExecutor;

  constructor(options: { sandboxDir?: string } = {}) {
    super({
      ...options,
      judgeLLM: new MockLLMJudge(),
    });
    this.executor = new TechStackSkillExecutor();
  }

  /**
   * Override skill execution to use actual TechStackAnalyzer
   */
  protected async executeSkill(skillPath: string, input: any): Promise<any> {
    return this.executor.execute(skillPath, input);
  }

  /**
   * Setup test environments for specific test cases
   */
  protected async setupTestEnvironment(
    type: 'clean' | 'populated' | 'corrupted'
  ): Promise<void> {
    await super.setupTestEnvironment(type);

    // Additional setup for specific test types based on context
    if (type === 'populated') {
      // Could add more sophisticated environment setup here
      // based on test case requirements
    }
  }

  /**
   * Enhanced deterministic checks for Tech Stack Analyzer
   */
  protected async runDeterministicChecks(execution: any): Promise<any> {
    const baseChecks = await super.runDeterministicChecks(execution);

    // Tech Stack Analyzer specific checks
    const techStackChecks = {
      hasRequiredFields: false,
      confidenceValid: false,
      categoriesValid: false,
      summaryNotEmpty: false,
    };

    if (execution.output && typeof execution.output === 'object') {
      const output = execution.output;

      // Check required fields
      techStackChecks.hasRequiredFields = !!(
        output.detected &&
        output.confidence &&
        output.summary
      );

      // Check confidence is valid
      techStackChecks.confidenceValid = ['high', 'medium', 'low'].includes(
        output.confidence
      );

      // Check categories structure if present
      if (output.categories) {
        techStackChecks.categoriesValid = !!(
          output.categories.frameworks &&
          output.categories.buildTools &&
          output.categories.testing
        );
      }

      // Check summary is not empty
      techStackChecks.summaryNotEmpty =
        output.summary && output.summary.length > 0;
    }

    return {
      ...baseChecks,
      ...techStackChecks,
    };
  }

  /**
   * Enhanced success evaluation for Tech Stack Analyzer
   */
  protected evaluateSuccess(result: any, testCase: any): boolean {
    const baseSuccess = super.evaluateSuccess(result, testCase);

    if (!baseSuccess) {
      return false;
    }

    // Tech Stack Analyzer specific success criteria
    if (result.triggered && result.output) {
      // Check that execution completed within reasonable time
      if (result.executionTime && result.executionTime > 10000) {
        return false; // Too slow
      }

      // Check for error handling
      if (testCase.type === 'edge' && result.output.error) {
        // Edge cases with errors are acceptable
        return true;
      }

      // Check confidence levels match expectations
      if (
        testCase.expected.confidence &&
        result.output.confidence !== testCase.expected.confidence
      ) {
        // Allow some flexibility in confidence levels
        const confidenceOrder = ['low', 'medium', 'high'];
        const expectedIndex = confidenceOrder.indexOf(
          testCase.expected.confidence
        );
        const actualIndex = confidenceOrder.indexOf(result.output.confidence);

        // Allow one level difference
        if (Math.abs(expectedIndex - actualIndex) > 1) {
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * Main evaluation function
 */
export async function evaluateTechStackAnalyzerSkill(): Promise<SkillEvalSummary> {
  const skillPath = path.join(__dirname, '../../../skills/tech-stack-analyzer');

  const harness = new TechStackEvalHarness({
    sandboxDir: `/tmp/tsa-eval-${Date.now()}`,
  });

  console.log('🔍 Starting Tech Stack Analyzer Skill Evaluation...');
  console.log(
    `📊 Running ${techStackAnalyzerTestCases.length} test cases with multiple trials...`
  );

  try {
    const summary = await harness.evaluateSkill(
      skillPath,
      techStackAnalyzerTestCases
    );

    console.log('\n📈 Evaluation Results:');
    console.log(`✅ Success Rate: ${(summary.successRate * 100).toFixed(1)}%`);
    console.log(
      `🎯 Trigger Accuracy: ${(summary.triggerAccuracy * 100).toFixed(1)}%`
    );
    console.log(
      `⭐ Avg Qualitative Score: ${(summary.avgQualitativeScore * 100).toFixed(1)}%`
    );
    console.log(
      `🔧 Deterministic Compliance: ${(summary.deterministicCompliance * 100).toFixed(1)}%`
    );

    if (summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      summary.recommendations.forEach(rec => console.log(`   • ${rec}`));
    }

    return summary;
  } catch (error) {
    console.error('❌ Evaluation failed:', error);
    throw error;
  }
}

/**
 * Individual test case runner for debugging
 */
export async function runSingleTestCase(testCaseId: string): Promise<void> {
  const testCase = techStackAnalyzerTestCases.find(tc => tc.id === testCaseId);
  if (!testCase) {
    throw new Error(`Test case not found: ${testCaseId}`);
  }

  console.log(`🔍 Running single test case: ${testCase.name}`);

  const skillPath = path.join(__dirname, '../../../skills/tech-stack-analyzer');
  const harness = new TechStackEvalHarness();

  try {
    const summary = await harness.evaluateSkill(skillPath, [testCase]);
    console.log('✅ Single test case completed');
    console.log(`Success Rate: ${(summary.successRate * 100).toFixed(1)}%`);
  } catch (error) {
    console.error('❌ Single test case failed:', error);
  }
}

/**
 * Performance benchmark runner
 */
export async function runPerformanceBenchmark(): Promise<void> {
  console.log('🚀 Running Tech Stack Analyzer Performance Benchmark...');

  const skillPath = path.join(__dirname, '../../../skills/tech-stack-analyzer');
  const executor = new TechStackSkillExecutor();

  const testRepo = path.join(__dirname, '../../../'); // Test against current repo

  const iterations = 10;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();

    try {
      await executor.execute(skillPath, {
        context: { repoPath: testRepo },
      });

      const duration = Date.now() - startTime;
      times.push(duration);

      console.log(`Iteration ${i + 1}: ${duration}ms`);
    } catch (error) {
      console.error(`Iteration ${i + 1} failed:`, error);
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log('\n📊 Performance Results:');
    console.log(`Average: ${avgTime.toFixed(1)}ms`);
    console.log(`Min: ${minTime}ms`);
    console.log(`Max: ${maxTime}ms`);
    console.log(`Iterations: ${times.length}`);
  }
}

// CLI interface for running evaluations
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'eval':
      evaluateTechStackAnalyzerSkill().catch(console.error);
      break;
    case 'single':
      const testCaseId = process.argv[3];
      if (testCaseId) {
        runSingleTestCase(testCaseId).catch(console.error);
      } else {
        console.error('Please provide a test case ID');
      }
      break;
    case 'perf':
      runPerformanceBenchmark().catch(console.error);
      break;
    default:
      console.log('Available commands:');
      console.log('  eval    - Run full evaluation');
      console.log('  single <id> - Run single test case');
      console.log('  perf    - Run performance benchmark');
  }
}
