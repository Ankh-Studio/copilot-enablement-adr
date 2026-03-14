# Consumer Guide: AI Enablement Assessment Plugin

## Installation

```bash
npm install @ankh-studio/copilot-enablement-adr
```

## Quick Start

### Basic Usage

```typescript
import { AIEnablementAssessment } from '@ankh-studio/copilot-enablement-adr';

// Initialize the assessment
const assessment = new AIEnablementAssessment({
  repoPath: '/path/to/your/repository',
  githubUrl: 'https://github.com/owner/repo',
  githubToken: 'your-github-token', // Optional
});

// Perform analysis
const result = await assessment.analyze();

// Generate ADR
const adr = assessment.generateADR(result);
console.log(adr);
```

### Advanced Usage

```typescript
import { AIEnablementAssessment } from '@ankh-studio/copilot-enablement-adr';

const assessment = new AIEnablementAssessment({
  repoPath: process.cwd(), // Default: current directory
  githubUrl: 'https://github.com/owner/repo',
  githubToken: process.env.GITHUB_TOKEN,
});

// Get full assessment
const result = await assessment.analyze();

// Access specific components
console.log('Tech Stack:', result.techStack.summary);
console.log('Readiness Scores:', result.readinessScores);
console.log('Recommendations:', result.recommendations);

// Generate formatted ADR
const adr = assessment.generateADR(result);
```

## API Reference

### Constructor Options

```typescript
interface AssessmentOptions {
  repoPath?: string; // Path to repository (default: process.cwd())
  githubUrl?: string; // GitHub repository URL
  githubToken?: string; // GitHub personal access token
}
```

### Assessment Result

```typescript
interface Assessment {
  timestamp: string; // ISO timestamp
  repository: string; // Repository path
  techStack: TechStackAnalysis;
  githubSecurity: GitHubSecurityAnalysis;
  readinessScores: ReadinessScores;
  maturityLayers: MaturityLayers;
  risks: {
    governance: string[];
    teamProcess: string[];
  };
  recommendations: Recommendation[];
}
```

### Tech Stack Analysis

```typescript
interface TechStackAnalysis {
  detected: any; // Raw @specfy/stack-analyser output
  flat: any; // Flattened technology list
  summary: string; // Human-readable summary
  confidence: 'high' | 'medium' | 'low';
}
```

### GitHub Security Analysis

```typescript
interface GitHubSecurityAnalysis {
  available: boolean;
  reason?: string;
  codeql?: {
    enabled: boolean;
    openAlerts: number;
    lastAnalysis?: string;
  };
  dependabot?: {
    enabled: boolean;
    openAlerts: number;
    dependencyReview: boolean;
  };
  secretScanning?: {
    enabled: boolean;
    openAlerts: number;
    lastAnalysis?: string;
  };
}
```

## Integration Examples

### GitHub Copilot CLI Plugin

```json
{
  "name": "ai-enablement-assessment",
  "description": "Analyze repository AI enablement readiness",
  "version": "1.0.0",
  "entry": "dist/bundle.js",
  "permissions": ["read:repository", "read:org"]
}
```

### Express.js Endpoint

```typescript
import express from 'express';
import { AIEnablementAssessment } from '@ankh-studio/copilot-enablement-adr';

const app = express();

app.post('/api/assess', async (req, res) => {
  try {
    const { repoPath, githubUrl, githubToken } = req.body;

    const assessment = new AIEnablementAssessment({
      repoPath,
      githubUrl,
      githubToken,
    });

    const result = await assessment.analyze();
    const adr = assessment.generateADR(result);

    res.json({ assessment: result, adr });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
```

### CLI Tool

```typescript
#!/usr/bin/env node

import { AIEnablementAssessment } from '@ankh-studio/copilot-enablement-adr';
import { Command } from 'commander';

const program = new Command();

program
  .name('ai-assessment')
  .description('AI Enablement Assessment Tool')
  .option('-r, --repo <path>', 'Repository path', process.cwd())
  .option('-u, --url <url>', 'GitHub URL')
  .option('-t, --token <token>', 'GitHub token')
  .option('-o, --output <file>', 'Output file', 'assessment.md')
  .action(async options => {
    const assessment = new AIEnablementAssessment({
      repoPath: options.repo,
      githubUrl: options.url,
      githubToken: options.token,
    });

    const result = await assessment.analyze();
    const adr = assessment.generateADR(result);

    require('fs').writeFileSync(options.output, adr);
    console.log(`Assessment saved to ${options.output}`);
  });

program.parse();
```

## Output Formats

### ADR Format

The plugin generates Architecture Decision Records (ADR) with:

- Repository analysis summary
- Readiness scores across dimensions
- Maturity layer assessment
- Risk identification
- Actionable recommendations with timeframes

### JSON Format

Raw assessment data available for programmatic consumption:

- Structured tech stack analysis
- GitHub security metrics
- Quantified readiness scores
- Categorized recommendations

## Dependencies

The plugin requires these runtime dependencies:

- `@specfy/stack-analyser` - Technology stack detection
- `@octokit/rest` - GitHub API integration

## Error Handling

The plugin provides graceful error handling:

- Missing GitHub token → Limited analysis without security data
- Invalid repository path → Clear error messages
- API failures → Fallback to static analysis
- Network issues → Timeout handling

## Performance Considerations

- **Tech Stack Analysis**: ~2-5 seconds for typical repositories
- **GitHub API**: Rate limited to 5000 requests/hour
- **Memory Usage**: ~50MB for large repositories
- **Bundle Size**: 13.8KB (gzipped: ~4KB)

## License

MIT License - see LICENSE file for details.
