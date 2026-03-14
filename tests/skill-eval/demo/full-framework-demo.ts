/**
 * Full Framework Demo with LLM-as-Judge
 *
 * Demonstrates the complete evaluation framework including:
 * - Multi-trial evaluation
 * - LLM-as-judge scoring
 * - Comprehensive reporting
 * - Visual analytics
 */

import { TechStackAnalyzer } from '../../../skills/tech-stack-analyzer/scripts/analyzer';
import path from 'path';

interface TrialResult {
  trial: number;
  success: boolean;
  triggered: boolean;
  output: any;
  duration: number;
  confidence: string;
  summary: string;
  qualitativeScore?: number;
}

interface TestCaseResult {
  testCase: string;
  type: 'positive' | 'negative' | 'edge';
  trials: TrialResult[];
  summary: {
    successRate: number;
    avgDuration: number;
    avgConfidence: string;
    avgQualitativeScore: number;
    consistency: number;
  };
}

/**
 * Mock LLM Judge for demonstration
 */
class MockLLMJudge {
  async evaluate(output: any, expectedType: string): Promise<number> {
    // Simple scoring logic based on output quality
    if (!output || output.error) {
      return expectedType === 'negative' ? 0.9 : 0.2; // Good score for expected failure
    }

    if (output.confidence === 'high' && output.detected?.techs?.length > 5) {
      return 0.9; // Excellent result
    } else if (
      output.confidence === 'medium' &&
      output.detected?.techs?.length > 2
    ) {
      return 0.7; // Good result
    } else if (output.confidence === 'low') {
      return 0.5; // Acceptable result
    }

    return 0.6; // Neutral score
  }
}

/**
 * Comprehensive Evaluation Demo
 */
class FullFrameworkDemo {
  private llmJudge: MockLLMJudge;

  constructor() {
    this.llmJudge = new MockLLMJudge();
  }

  async runSingleTrial(
    repoPath: string,
    testCaseType: string,
    trialNumber: number
  ): Promise<TrialResult> {
    const startTime = Date.now();

    try {
      const analyzer = new TechStackAnalyzer({ repoPath });
      const result = await analyzer.analyze();

      const duration = Date.now() - startTime;

      // LLM-as-Judge evaluation
      const qualitativeScore = await this.llmJudge.evaluate(
        result,
        testCaseType
      );

      return {
        trial: trialNumber,
        success: true,
        triggered: true,
        output: result,
        duration,
        confidence: result.confidence,
        summary: result.summary,
        qualitativeScore,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorResult = { error: (error as Error).message };

      // LLM-as-Judge evaluation of error
      const qualitativeScore = await this.llmJudge.evaluate(
        errorResult,
        testCaseType
      );

      return {
        trial: trialNumber,
        success: false,
        triggered: false,
        output: errorResult,
        duration,
        confidence: 'low',
        summary: 'Analysis failed',
        qualitativeScore,
      };
    }
  }

  async runMultiTrialEvaluation(
    repoPath: string,
    testCaseName: string,
    testCaseType: string,
    trials: number = 3
  ): Promise<TestCaseResult> {
    console.log(`🔍 Running ${trials}-trial evaluation: ${testCaseName}`);
    console.log(`📁 Repository: ${repoPath}`);
    console.log(`🎯 Type: ${testCaseType}`);

    const trialResults: TrialResult[] = [];

    for (let i = 1; i <= trials; i++) {
      console.log(`   Trial ${i}/${trials}...`);
      const result = await this.runSingleTrial(repoPath, testCaseType, i);
      trialResults.push(result);

      // Brief result summary
      const status = result.success ? '✅' : '❌';
      console.log(
        `   ${status} ${result.duration}ms | Confidence: ${result.confidence} | Score: ${result.qualitativeScore ? `${(result.qualitativeScore * 100).toFixed(0)}%` : 'N/A'}`
      );
    }

    // Calculate summary statistics
    const successRate =
      trialResults.filter(r => r.success).length / trialResults.length;
    const avgDuration =
      trialResults.reduce((sum, r) => sum + r.duration, 0) /
      trialResults.length;
    const confidenceScores = { high: 0, medium: 0, low: 0 };

    trialResults.forEach(r => {
      confidenceScores[r.confidence as keyof typeof confidenceScores]++;
    });

    const avgConfidence = Object.entries(confidenceScores).sort(
      ([, a], [, b]) => b - a
    )[0][0];

    const avgQualitativeScore =
      trialResults
        .filter(r => r.qualitativeScore !== undefined)
        .reduce((sum, r) => sum + (r.qualitativeScore || 0), 0) /
      trialResults.filter(r => r.qualitativeScore !== undefined).length;

    // Consistency check (how similar are the results?)
    const consistency = this.calculateConsistency(trialResults);

    const summary = {
      successRate,
      avgDuration,
      avgConfidence,
      avgQualitativeScore,
      consistency,
    };

    console.log(
      `📊 Summary: ${(successRate * 100).toFixed(1)}% success | ${avgDuration.toFixed(1)}ms avg | ${(avgQualitativeScore * 100).toFixed(0)}% avg score | ${(consistency * 100).toFixed(0)}% consistency`
    );

    return {
      testCase: testCaseName,
      type: testCaseType as 'positive' | 'negative' | 'edge',
      trials: trialResults,
      summary,
    };
  }

  private calculateConsistency(trials: TrialResult[]): number {
    if (trials.length < 2) return 1.0;

    // Check consistency of success/failure
    const successValues = trials.map(t => t.success);
    const allSame = successValues.every(v => v === successValues[0]);

    if (!allSame) return 0.5; // Inconsistent results

    // Check consistency of confidence levels
    const confidenceValues = trials.map(t => t.confidence);
    const confidenceConsistency = confidenceValues.every(
      v => v === confidenceValues[0]
    );

    return confidenceConsistency ? 1.0 : 0.8;
  }

  generateVisualization(results: TestCaseResult[]): void {
    console.log('\n📊 Visual Analytics Dashboard');
    console.log('='.repeat(60));

    // Success Rate Chart
    console.log('\n🎯 Success Rate by Test Case:');
    results.forEach(result => {
      const bar = '█'.repeat(Math.round(result.summary.successRate * 20));
      const empty = '░'.repeat(
        20 - Math.round(result.summary.successRate * 20)
      );
      console.log(
        `${result.testCase.padEnd(25)} ${bar}${empty} ${(result.summary.successRate * 100).toFixed(0)}%`
      );
    });

    // Performance Chart
    console.log('\n⚡ Performance (Avg Duration):');
    const maxDuration = Math.max(...results.map(r => r.summary.avgDuration));
    results.forEach(result => {
      const normalized = (result.summary.avgDuration / maxDuration) * 20;
      const bar = '█'.repeat(Math.round(normalized));
      const empty = '░'.repeat(20 - Math.round(normalized));
      console.log(
        `${result.testCase.padEnd(25)} ${bar}${empty} ${result.summary.avgDuration.toFixed(1)}ms`
      );
    });

    // Quality Score Chart
    console.log('\n⭐ LLM-as-Judge Quality Scores:');
    results.forEach(result => {
      const bar = '█'.repeat(
        Math.round(result.summary.avgQualitativeScore * 20)
      );
      const empty = '░'.repeat(
        20 - Math.round(result.summary.avgQualitativeScore * 20)
      );
      console.log(
        `${result.testCase.padEnd(25)} ${bar}${empty} ${(result.summary.avgQualitativeScore * 100).toFixed(0)}%`
      );
    });

    // Consistency Chart
    console.log('\n🔄 Trial Consistency:');
    results.forEach(result => {
      const bar = '█'.repeat(Math.round(result.summary.consistency * 20));
      const empty = '░'.repeat(
        20 - Math.round(result.summary.consistency * 20)
      );
      console.log(
        `${result.testCase.padEnd(25)} ${bar}${empty} ${(result.summary.consistency * 100).toFixed(0)}%`
      );
    });
  }

  generateComprehensiveReport(results: TestCaseResult[]): void {
    console.log('\n📋 Comprehensive Evaluation Report');
    console.log('='.repeat(60));

    // Overall metrics
    const totalSuccess =
      results.reduce((sum, r) => sum + r.summary.successRate, 0) /
      results.length;
    const avgDuration =
      results.reduce((sum, r) => sum + r.summary.avgDuration, 0) /
      results.length;
    const avgQuality =
      results.reduce((sum, r) => sum + r.summary.avgQualitativeScore, 0) /
      results.length;
    const avgConsistency =
      results.reduce((sum, r) => sum + r.summary.consistency, 0) /
      results.length;

    console.log('\n🎯 Executive Summary:');
    console.log(`   Overall Success Rate: ${(totalSuccess * 100).toFixed(1)}%`);
    console.log(`   Average Performance: ${avgDuration.toFixed(1)}ms`);
    console.log(`   Average Quality Score: ${(avgQuality * 100).toFixed(0)}%`);
    console.log(
      `   Average Consistency: ${(avgConsistency * 100).toFixed(0)}%`
    );

    // Test case analysis
    console.log('\n📈 Test Case Analysis:');
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.testCase} (${result.type})`);
      console.log(
        `   Success Rate: ${(result.summary.successRate * 100).toFixed(1)}%`
      );
      console.log(
        `   Performance: ${result.summary.avgDuration.toFixed(1)}ms avg`
      );
      console.log(
        `   Quality: ${(result.summary.avgQualitativeScore * 100).toFixed(0)}% avg score`
      );
      console.log(
        `   Consistency: ${(result.summary.consistency * 100).toFixed(0)}%`
      );
      console.log(`   Confidence: ${result.summary.avgConfidence}`);

      // Show individual trial results
      console.log('   Trial Results:');
      result.trials.forEach(trial => {
        const status = trial.success ? '✅' : '❌';
        const score = trial.qualitativeScore
          ? ` | Score: ${(trial.qualitativeScore * 100).toFixed(0)}%`
          : '';
        console.log(
          `     ${status} Trial ${trial.trial}: ${trial.duration}ms | ${trial.confidence}${score}`
        );
      });
    });

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (totalSuccess > 0.8) {
      console.log(
        '✅ Excellent overall performance - skill ready for production'
      );
    } else if (totalSuccess > 0.6) {
      console.log('⚠️  Good performance with room for improvement');
    } else {
      console.log('❌ Performance issues need attention before production');
    }

    if (avgQuality > 0.8) {
      console.log('✅ High-quality output consistently meets expectations');
    } else if (avgQuality > 0.6) {
      console.log('📈 Output quality good, consider refinement for edge cases');
    } else {
      console.log('🔧 Output quality needs improvement');
    }

    if (avgConsistency > 0.9) {
      console.log('✅ Highly consistent behavior across trials');
    } else {
      console.log('🔄 Consider improving consistency for reliable performance');
    }
  }

  async runFullDemo(): Promise<void> {
    console.log('🚀 Full Agent Skills Evaluation Framework Demo');
    console.log('🔬 Demonstrating Multi-Trial Evaluation with LLM-as-Judge');
    console.log('='.repeat(70));

    const testCases = [
      {
        name: 'Current Repository Analysis',
        path: path.join(__dirname, '../../..'),
        type: 'positive',
        trials: 3,
      },
      {
        name: 'Empty Directory Edge Case',
        path: '/tmp/demo-empty-dir',
        type: 'edge',
        trials: 3,
      },
      {
        name: 'Invalid Path Negative Test',
        path: '/path/that/does/not/exist',
        type: 'negative',
        trials: 3,
      },
    ];

    const results: TestCaseResult[] = [];

    // Run each test case with multiple trials
    for (const testCase of testCases) {
      console.log(`\n📋 Test Case: ${testCase.name}`);
      console.log('-'.repeat(50));

      const result = await this.runMultiTrialEvaluation(
        testCase.path,
        testCase.name,
        testCase.type,
        testCase.trials
      );

      results.push(result);
      console.log(''); // Spacing
    }

    // Generate comprehensive analysis
    this.generateVisualization(results);
    this.generateComprehensiveReport(results);

    // Framework capabilities demonstrated
    console.log('\n🏆 Framework Capabilities Demonstrated:');
    console.log('✅ Multi-trial statistical evaluation');
    console.log('✅ LLM-as-judge qualitative assessment');
    console.log('✅ Visual analytics and dashboard');
    console.log('✅ Comprehensive reporting with recommendations');
    console.log('✅ Performance benchmarking');
    console.log('✅ Consistency analysis');
    console.log('✅ Edge case and negative testing');
    console.log('✅ Executive summary generation');

    console.log('\n🎉 Full Framework Demo Complete!');
    console.log('🚀 Ready for enterprise-grade AI agent skill evaluation!');
  }
}

// Run the demo
if (require.main === module) {
  const demo = new FullFrameworkDemo();
  demo.runFullDemo().catch(console.error);
}

export { FullFrameworkDemo };
