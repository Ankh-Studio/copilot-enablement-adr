/**
 * Agent Skills Evaluation Harness
 *
 * Implements structured, engineering-driven evaluation for AI agent skills
 * following best practices for deterministic checks, LLM-as-judge, and negative testing
 */

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface SkillTestCase {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'edge';
  input: {
    prompt: string;
    context?: any;
    environment: 'clean' | 'populated' | 'corrupted';
  };
  expected: {
    shouldTrigger: boolean;
    outputSchema?: any;
    filesCreated?: string[];
    apisUsed?: string[];
    confidence?: 'high' | 'medium' | 'low';
  };
  trials: number; // 3-5 recommended
}

export interface SkillEvalResult {
  testCase: string;
  trial: number;
  success: boolean;
  triggered: boolean;
  output: any;
  errors: string[];
  duration: number;
  deterministicChecks: {
    filesCreated: string[];
    apisUsed: string[];
    namingConventions: boolean;
  };
  qualitativeScore?: number; // LLM-as-judge score
}

export interface SkillEvalSummary {
  skillName: string;
  totalTests: number;
  successRate: number;
  triggerAccuracy: number;
  avgQualitativeScore: number;
  deterministicCompliance: number;
  recommendations: string[];
}

export class SkillEvalHarness {
  private sandboxDir: string;
  private judgeLLM: any; // Would be configured with independent LLM

  constructor(options: { sandboxDir?: string; judgeLLM?: any } = {}) {
    this.sandboxDir = options.sandboxDir || `/tmp/skill-eval-${uuidv4()}`;
    this.judgeLLM = options.judgeLLM;
  }

  /**
   * Run comprehensive skill evaluation
   */
  async evaluateSkill(
    skillPath: string,
    testCases: SkillTestCase[]
  ): Promise<SkillEvalSummary> {
    const results: SkillEvalResult[] = [];

    // Create isolated environment
    await this.createSandbox();

    try {
      // Verify skill trigger metadata
      await this.verifySkillTrigger(skillPath);

      // Run all test cases with multiple trials
      for (const testCase of testCases) {
        for (let trial = 1; trial <= testCase.trials; trial++) {
          const result = await this.runSingleTrial(skillPath, testCase, trial);
          results.push(result);
        }
      }

      // Generate comprehensive summary
      return this.generateSummary(skillPath, testCases, results);
    } finally {
      // Clean up sandbox
      await this.cleanupSandbox();
    }
  }

  /**
   * Verify skill trigger metadata (frontmatter validation)
   */
  private async verifySkillTrigger(skillPath: string): Promise<void> {
    const skillMd = path.join(skillPath, 'SKILL.md');
    const content = await fs.readFile(skillMd, 'utf-8');

    // Extract YAML frontmatter
    const frontmatterMatch = content.match(/^---\n(.*?)\n---/s);
    if (!frontmatterMatch) {
      throw new Error('Skill missing YAML frontmatter trigger');
    }

    const frontmatter = this.parseYaml(frontmatterMatch[1]);

    // Validate required trigger fields
    if (!frontmatter.name || !frontmatter.description) {
      throw new Error(
        'Skill trigger missing required fields: name, description'
      );
    }

    // Check trigger specificity
    if (frontmatter.description.length < 20) {
      throw new Error(
        'Skill description too vague - may cause over-triggering'
      );
    }
  }

  /**
   * Run single trial of a test case
   */
  private async runSingleTrial(
    skillPath: string,
    testCase: SkillTestCase,
    trial: number
  ): Promise<SkillEvalResult> {
    const startTime = Date.now();
    const result: SkillEvalResult = {
      testCase: testCase.id,
      trial,
      success: false,
      triggered: false,
      output: null,
      errors: [],
      duration: 0,
      deterministicChecks: {
        filesCreated: [],
        apisUsed: [],
        namingConventions: false,
      },
    };

    try {
      // Setup test environment
      await this.setupTestEnvironment(testCase.input.environment);

      // Execute skill (this would integrate with actual skill execution)
      const execution = await this.executeSkill(skillPath, testCase.input);

      result.triggered = execution.triggered;
      result.output = execution.output;

      // Run deterministic checks
      result.deterministicChecks = await this.runDeterministicChecks(execution);

      // Run LLM-as-judge evaluation if schema provided
      if (testCase.expected.outputSchema) {
        result.qualitativeScore = await this.llmJudge(
          execution.output,
          testCase.expected.outputSchema,
          testCase.input.prompt
        );
      }

      // Evaluate success
      result.success = this.evaluateSuccess(result, testCase);
    } catch (error) {
      result.errors.push((error as Error).message);
    } finally {
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * LLM-as-Judge evaluation
   */
  private async llmJudge(
    output: any,
    expectedSchema: any,
    originalPrompt: string
  ): Promise<number> {
    if (!this.judgeLLM) {
      return 0.5; // Neutral score if no judge configured
    }

    const judgePrompt = `
Evaluate this AI agent skill output against the expected schema:

Original Prompt: ${originalPrompt}

Expected Schema:
${JSON.stringify(expectedSchema, null, 2)}

Actual Output:
${JSON.stringify(output, null, 2)}

Rate the output quality on a scale of 0.0 to 1.0 where:
- 1.0 = Perfect match to schema and requirements
- 0.8 = Good match with minor issues
- 0.6 = Acceptable but notable deviations
- 0.4 = Poor match, significant issues
- 0.2 = Very poor, major deviations
- 0.0 = Complete failure

Respond with only the numeric score (0.0-1.0):
`;

    try {
      const response = await this.judgeLLM.generate(judgePrompt);
      const score = parseFloat(response.trim());
      return Math.max(0, Math.min(1, score)); // Clamp to 0-1 range
    } catch (error) {
      console.warn('LLM judge evaluation failed:', error);
      return 0.5;
    }
  }

  /**
   * Run deterministic checks
   */
  protected async runDeterministicChecks(
    execution: any
  ): Promise<SkillEvalResult['deterministicChecks']> {
    const checks = {
      filesCreated: [] as string[],
      apisUsed: [] as string[],
      namingConventions: false,
    };

    // Check files created (if applicable)
    if (execution.filesCreated) {
      checks.filesCreated = execution.filesCreated;
    }

    // Check API usage (if applicable)
    if (execution.apisUsed) {
      checks.apisUsed = execution.apisUsed;
    }

    // Check naming conventions
    if (execution.output && typeof execution.output === 'object') {
      checks.namingConventions = this.checkNamingConventions(execution.output);
    }

    return checks;
  }

  /**
   * Check naming conventions in output
   */
  protected checkNamingConventions(output: any): boolean {
    // Example: Check for camelCase, proper naming patterns
    const keys = Object.keys(output);
    const hasValidNaming = keys.every(
      key => /^[a-z][a-zA-Z0-9]*$/.test(key) // camelCase
    );
    return hasValidNaming;
  }

  /**
   * Evaluate overall success of a trial
   */
  protected evaluateSuccess(
    result: SkillEvalResult,
    testCase: SkillTestCase
  ): boolean {
    // Check if trigger behavior matches expectation
    if (result.triggered !== testCase.expected.shouldTrigger) {
      return false;
    }

    // Check deterministic requirements
    if (testCase.expected.filesCreated) {
      const expectedFiles = testCase.expected.filesCreated.sort();
      const actualFiles = result.deterministicChecks.filesCreated.sort();
      if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles)) {
        return false;
      }
    }

    // Check qualitative score if applicable
    if (
      testCase.expected.outputSchema &&
      result.qualitativeScore !== undefined
    ) {
      const minScore =
        testCase.expected.confidence === 'high'
          ? 0.8
          : testCase.expected.confidence === 'medium'
            ? 0.6
            : 0.4;
      if (result.qualitativeScore < minScore) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate comprehensive evaluation summary
   */
  protected generateSummary(
    skillPath: string,
    testCases: SkillTestCase[],
    results: SkillEvalResult[]
  ): SkillEvalSummary {
    const skillName = path.basename(skillPath);
    const successfulResults = results.filter(r => r.success);
    const triggeredResults = results.filter(r => r.triggered);
    const qualitativeScores = results
      .filter(r => r.qualitativeScore !== undefined)
      .map(r => r.qualitativeScore!);

    return {
      skillName,
      totalTests: testCases.length,
      successRate: successfulResults.length / results.length,
      triggerAccuracy: triggeredResults.length / results.length,
      avgQualitativeScore:
        qualitativeScores.length > 0
          ? qualitativeScores.reduce((a, b) => a + b, 0) /
            qualitativeScores.length
          : 0,
      deterministicCompliance: this.calculateDeterministicCompliance(results),
      recommendations: this.generateRecommendations(results, testCases),
    };
  }

  /**
   * Calculate deterministic compliance rate
   */
  protected calculateDeterministicCompliance(
    results: SkillEvalResult[]
  ): number {
    const compliantResults = results.filter(
      r => r.deterministicChecks.namingConventions
    );
    return compliantResults.length / results.length;
  }

  /**
   * Generate improvement recommendations
   */
  protected generateRecommendations(
    results: SkillEvalResult[],
    testCases: SkillTestCase[]
  ): string[] {
    const recommendations: string[] = [];

    // Analyze failure patterns
    const failures = results.filter(r => !r.success);
    const triggerFailures = failures.filter(r => {
      const testCase = testCases.find(tc => tc.id === r.testCase);
      return r.triggered !== testCase?.expected.shouldTrigger;
    });

    if (triggerFailures.length > 0) {
      recommendations.push(
        'Review skill trigger logic - incorrect activation detected'
      );
    }

    const qualityFailures = failures.filter(
      r => r.qualitativeScore !== undefined && r.qualitativeScore < 0.6
    );

    if (qualityFailures.length > 0) {
      recommendations.push(
        'Improve output quality - LLM judge scores below threshold'
      );
    }

    const deterministicFailures = failures.filter(
      r => !r.deterministicChecks.namingConventions
    );

    if (deterministicFailures.length > 0) {
      recommendations.push('Fix naming conventions in output structure');
    }

    return recommendations;
  }

  /**
   * Setup isolated test environment
   */
  protected async setupTestEnvironment(
    type: 'clean' | 'populated' | 'corrupted'
  ): Promise<void> {
    await fs.mkdir(this.sandboxDir, { recursive: true });

    switch (type) {
      case 'clean':
        // Empty sandbox
        break;
      case 'populated':
        // Add sample files
        await this.createSampleEnvironment();
        break;
      case 'corrupted':
        // Add corrupted/malformed files
        await this.createCorruptedEnvironment();
        break;
    }
  }

  /**
   * Create sample populated environment
   */
  private async createSampleEnvironment(): Promise<void> {
    const sampleFiles = {
      'package.json': JSON.stringify(
        {
          name: 'test-project',
          dependencies: { react: '^18.0.0', typescript: '^5.0.0' },
        },
        null,
        2
      ),
      'README.md': '# Test Project\n\nA sample project for testing.',
      'src/index.ts': 'console.log("Hello, world!");',
    };

    for (const [filename, content] of Object.entries(sampleFiles)) {
      const filePath = path.join(this.sandboxDir, filename);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
    }
  }

  /**
   * Create corrupted environment for negative testing
   */
  private async createCorruptedEnvironment(): Promise<void> {
    const corruptedFiles = {
      'package.json': '{ invalid json content',
      'README.md': '',
      'src/broken.ts': 'this is not valid typescript syntax {{{',
    };

    for (const [filename, content] of Object.entries(corruptedFiles)) {
      const filePath = path.join(this.sandboxDir, filename);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
    }
  }

  /**
   * Execute skill (placeholder for actual skill execution)
   */
  protected async executeSkill(_skillPath: string, _input: any): Promise<any> {
    // This would integrate with the actual skill execution system
    // For now, return a mock execution result
    return {
      triggered: true,
      output: { result: 'mock execution' },
      filesCreated: [],
      apisUsed: [],
    };
  }

  /**
   * Create sandbox directory
   */
  private async createSandbox(): Promise<void> {
    await fs.mkdir(this.sandboxDir, { recursive: true });
  }

  /**
   * Clean up sandbox directory
   */
  private async cleanupSandbox(): Promise<void> {
    try {
      await fs.rm(this.sandboxDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup sandbox:', error);
    }
  }

  /**
   * Parse YAML (simple implementation)
   */
  private parseYaml(yamlString: string): any {
    // Simple YAML parsing - in production would use proper YAML parser
    const lines = yamlString.split('\n');
    const result: any = {};

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        result[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
      }
    }

    return result;
  }
}
