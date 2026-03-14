# Agent Skills Evaluation Framework

A comprehensive, engineering-driven testing framework for AI agent skills that goes beyond "vibe checks" to provide structured, reliable evaluation following industry best practices.

## 🎯 Overview

This framework implements the core testing principles for agent skills:

- **Deterministic Checks**: Verify file structure, API usage, naming conventions
- **LLM-as-Judge**: Use independent LLM for qualitative output evaluation
- **Negative Testing**: Ensure skills don't trigger inappropriately
- **Isolated Environments**: Clean sandbox testing to prevent context bleeding
- **Multi-trial Evaluation**: Statistical reliability through repeated testing
- **Trigger Verification**: Validate skill metadata and activation logic

## 🏗️ Architecture

```
tests/skill-eval/
├── framework/
│   └── eval-harness.ts          # Core evaluation engine
├── test-cases/
│   └── tech-stack-analyzer.test.ts # Comprehensive test cases
├── runner/
│   └── tech-stack-analyzer-eval.ts # Skill execution integration
├── reporting/
│   └── eval-reporter.ts         # Report generation and analysis
├── integration/
│   └── full-evaluation.test.ts   # End-to-end framework validation
└── README.md                     # This documentation
```

## 🚀 Quick Start

### 1. Run Full Evaluation

```bash
# Run comprehensive Tech Stack Analyzer evaluation
npm run test:run tests/skill-eval/integration/full-evaluation.test.ts

# Or run directly with the evaluation runner
npx ts-node tests/skill-eval/runner/tech-stack-analyzer-eval.ts eval
```

### 2. Run Single Test Case

```bash
# Run specific test case for debugging
npx ts-node tests/skill-eval/runner/tech-stack-analyzer-eval.ts single tsa-positive-react-typescript
```

### 3. Performance Benchmark

```bash
# Run performance benchmarking
npx ts-node tests/skill-eval/runner/tech-stack-analyzer-eval.ts perf
```

## 📊 Framework Components

### Evaluation Harness (`eval-harness.ts`)

The core engine that orchestrates skill evaluation:

```typescript
const harness = new SkillEvalHarness({
  sandboxDir: '/tmp/skill-eval',
  judgeLLM: new MockLLMJudge(),
});

const summary = await harness.evaluateSkill(skillPath, testCases);
```

**Key Features:**

- Isolated sandbox environments
- Multi-trial execution with statistical analysis
- LLM-as-judge integration
- Deterministic check validation
- Comprehensive error handling

### Test Cases (`test-cases/`)

Structured test definitions following best practices:

```typescript
const testCase: SkillTestCase = {
  id: 'tsa-positive-react-typescript',
  name: 'React/TypeScript Repository Analysis',
  type: 'positive', // 'positive' | 'negative' | 'edge'
  input: {
    prompt: 'Analyze this React/TypeScript repository...',
    environment: 'populated', // 'clean' | 'populated' | 'corrupted'
  },
  expected: {
    shouldTrigger: true,
    outputSchema: {
      /* validation schema */
    },
    confidence: 'high',
  },
  trials: 3, // 3-5 recommended for statistical reliability
};
```

**Test Case Types:**

- **Positive**: Expected to trigger and succeed
- **Negative**: Should NOT trigger (prevents over-triggering)
- **Edge**: Boundary conditions and error scenarios

### Skill Runner (`runner/`)

Integration layer that connects the framework to actual skills:

```typescript
class TechStackSkillExecutor {
  async execute(skillPath: string, input: any): Promise<any> {
    // Integrate with actual TechStackAnalyzer
    const analyzer = new TechStackAnalyzer({ repoPath });
    const result = await analyzer.analyze();
    return { triggered: true, output: result, ... };
  }
}
```

### Reporting (`reporting/`)

Comprehensive analysis and visualization:

```typescript
const reporter = new EvalReporter({
  outputPath: './reports',
  includeVisualizations: true,
  format: 'markdown', // 'html' | 'json' | 'markdown'
});

const report = await reporter.generateReport(skillName, summary, results);
await reporter.saveReport(report);
```

**Report Sections:**

- Executive Summary with key metrics
- Strengths, Weaknesses, and Risk Analysis
- Immediate, Short-term, and Long-term Recommendations
- Performance Visualizations
- Detailed Trial-by-Trial Results

## 🧪 Testing Best Practices Implemented

### 1. Grade Outcomes, Not Paths

✅ **Implemented**: Tests focus on final results, not implementation details

```typescript
// ✅ GOOD: Focus on expected outcome
expected: {
  shouldTrigger: true,
  outputSchema: { /* result structure */ }
}

// ❌ AVOID: Prescribing implementation
expected: {
  implementation: 'must use specific API calls'
}
```

### 2. Multiple Trials for Reliability

✅ **Implemented**: 3-5 trials per test case for statistical confidence

```typescript
{
  trials: 3, // Recommended minimum
  // Results analyzed for consistency and distribution
}
```

### 3. Trigger Verification

✅ **Implemented**: YAML frontmatter validation for skill activation

```typescript
// Automatically verifies SKILL.md frontmatter
name: "tech-stack-analyzer"
description: "Analyzes repository technology stacks..." # Must be specific
```

### 4. Isolated Environments

✅ **Implemented**: Clean sandbox testing prevents context bleeding

```typescript
// Three environment types
environment: 'clean'; // Empty sandbox
environment: 'populated'; // Sample files
environment: 'corrupted'; // Error scenarios
```

## 📈 Evaluation Metrics

### Core Metrics

- **Success Rate**: Overall test pass percentage
- **Trigger Accuracy**: Correct activation vs. false positives/negatives
- **Qualitative Score**: LLM-as-judge quality rating (0-1)
- **Deterministic Compliance**: File structure and API usage adherence
- **Performance**: Execution time and resource usage

### Advanced Analysis

- **Trial Consistency**: Behavioral consistency across multiple runs
- **Error Pattern Analysis**: Recurring issues and failure modes
- **Performance Distribution**: Execution time percentiles and outliers
- **Risk Factor Identification**: Reliability and maintainability risks

## 🔧 Extending the Framework

### Adding New Skills

1. **Create Test Cases**:

```typescript
// tests/skill-eval/test-cases/your-skill.test.ts
export const yourSkillTestCases: SkillTestCase[] = [
  // Define comprehensive test cases
];
```

2. **Create Skill Runner**:

```typescript
// tests/skill-eval/runner/your-skill-eval.ts
class YourSkillExecutor {
  async execute(skillPath: string, input: any): Promise<any> {
    // Integrate with your skill
  }
}
```

3. **Create Integration Test**:

```typescript
// tests/skill-eval/integration/your-skill.test.ts
describe('Your Skill Evaluation', () => {
  it('should run comprehensive evaluation', async () => {
    const results = await evaluateYourSkill();
    expect(results.successRate).toBeGreaterThan(0.8);
  });
});
```

### Custom LLM Judge

Replace the mock judge with real LLM integration:

```typescript
class RealLLMJudge {
  async generate(prompt: string): Promise<string> {
    // Integrate with OpenAI, Claude, etc.
    const response = await openai.completions.create({
      model: 'gpt-4',
      prompt,
      max_tokens: 10,
    });
    return response.choices[0].text;
  }
}
```

### Custom Deterministic Checks

Add skill-specific validation:

```typescript
protected async runDeterministicChecks(execution: any): Promise<any> {
  const baseChecks = await super.runDeterministicChecks(execution);

  // Add skill-specific checks
  const skillChecks = {
    customValidation: this.validateSkillSpecificRequirements(execution)
  };

  return { ...baseChecks, ...skillChecks };
}
```

## 📋 Current Skills Supported

### Tech Stack Analyzer (`tech-stack-analyzer`)

**Test Coverage:**

- ✅ React/TypeScript repository analysis
- ✅ Node.js backend detection
- ✅ Empty repository handling
- ✅ Monorepo structure analysis
- ✅ Corrupted file handling
- ✅ Permission denied scenarios
- ✅ Negative testing (non-code repos)
- ✅ Inappropriate task detection

**Metrics Tracked:**

- Technology detection accuracy
- Confidence level calibration
- Performance benchmarks
- Error handling robustness
- API usage validation

## 🚧 Roadmap

### Phase 1: Complete Current Skills

- [ ] Security Scanner validation
- [ ] Readiness Scorer validation
- [ ] ADR Generator validation

### Phase 2: Advanced Features

- [ ] Real LLM integration (OpenAI/Claude)
- [ ] Trend analysis over time
- [ ] Regression detection
- [ ] CI/CD integration

### Phase 3: Framework Enhancements

- [ ] Parallel test execution
- [ ] Distributed testing
- [ ] Real-time monitoring dashboard
- [ ] Automated skill improvement suggestions

## 🔍 Troubleshooting

### Common Issues

**Test Environment Isolation**

```bash
# Ensure clean sandbox
rm -rf /tmp/skill-eval-*
rm -rf /tmp/tsa-eval-*
```

**Permission Issues**

```bash
# Check sandbox permissions
ls -la /tmp/
chmod 755 /tmp/skill-eval-*
```

**Memory Issues**

```bash
# Limit test concurrency
NODE_OPTIONS="--max-old-space-size=2048" npm run test:run
```

### Debug Mode

Enable detailed logging:

```typescript
const harness = new SkillEvalHarness({
  debug: true, // Enable verbose logging
  sandboxDir: '/tmp/debug-eval',
});
```

## 📚 References

- [Agent Skills Testing Best Practices](https://docs.anthropic.com/agent-skills-testing)
- [LLM-as-Judge Evaluation](https://arxiv.org/abs/2306.05685)
- [Deterministic Testing Patterns](https://github.com/anthropics/agent-skills)
- [Multi-trial Statistical Methods](<https://en.wikipedia.org/wiki/Replication_(statistics)>)

---

**Framework Version**: 1.0.0  
**Last Updated**: 2025-03-14  
**Maintainer**: AI Enablement Assessment Team
