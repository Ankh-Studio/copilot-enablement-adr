# AI Enablement Assessment Plugin

A TypeScript library that leverages the GitHub Copilot SDK to analyze repository AI enablement readiness and generates consultant-quality Architecture Decision Records (ADRs) with evidence-based scoring, risk assessment, and phased implementation recommendations.

## 🚀 Quick Start

```bash
npm install @ankh-studio/copilot-enablement-adr
```

```typescript
import CopilotPoweredAssessment from '@ankh-studio/copilot-enablement-adr';

const assessment = new CopilotPoweredAssessment({
  repoPath: './my-project',
  githubUrl: 'https://github.com/owner/repo',
  githubToken: process.env.GITHUB_TOKEN,
});

const analysis = await assessment.analyze();
const adr = await assessment.generateADR(analysis);
console.log(adr);
```

## 📋 Features

- **🤖 Copilot SDK Powered**: Leverages GitHub Copilot's reasoning engine for analysis
- **� Focused Data Collection**: Simple tools for tech stack, security, and artifact detection
- **📊 Evidence-Based Analysis**: Copilot interprets signals and provides nuanced insights
- **📝 Consultant-Quality ADRs**: Professional proposals with contextual recommendations
- **� Tool-Based Architecture**: Extensible with custom analysis tools

## 🦺 Prerequisites

This plugin requires the GitHub Copilot CLI:

```bash
# Install Copilot CLI
npm install -g @github/copilot

# Authenticate
copilot auth login
```

## 📦 Installation

```bash
# npm
npm install @ankh-studio/copilot-enablement-adr

# yarn
yarn add @ankh-studio/copilot-enablement-adr

# pnpm
pnpm add @ankh-studio/copilot-enablement-adr
```

## 🔧 Usage

### Basic Usage

```typescript
import { AIEnablementAssessment } from '@ankh-studio/copilot-enablement-adr';

const assessment = new AIEnablementAssessment();
const result = await assessment.analyze();
console.log(result.techStack.summary);
```

### Advanced Usage

```typescript
const assessment = new AIEnablementAssessment({
  repoPath: '/path/to/repo',
  githubUrl: 'https://github.com/owner/repo',
  githubToken: 'your-github-token',
});

const result = await assessment.analyze();

// Access specific data
console.log('Readiness Scores:', result.readinessScores);
console.log('Recommendations:', result.recommendations);

// Generate ADR
const adr = assessment.generateADR(result);
```

### GitHub Copilot CLI Plugin

```bash
copilot plugin install @ankh-studio/copilot-enablement-adr
copilot run ai-enablement-assessment --repo ./my-project
```

## 📊 What It Analyzes

### Tech Stack Detection

- Languages, frameworks, and dependencies
- Infrastructure and SaaS services
- Development tools and build systems
- Database and storage technologies

### GitHub Advanced Security

- CodeQL scanning setup and results
- Dependabot alerts and dependency review
- Secret scanning configuration and findings

### Readiness Assessment

- **Repo Readiness** (0-100): Technical foundation and hygiene
- **Team Readiness** (0-100): Process and capability maturity
- **Org Enablement Readiness** (0-100): Enterprise and governance readiness

### 8-Layer Path to Agentic Maturity

1. Foundations - Basic repo clarity and structure
2. Build/Test Determinism - Reproducible development workflows
3. Documentation Spec Maturity - Adequate context for AI/human understanding
4. Repo-Aware AI Guidance - Copilot instructions and conventions
5. Evaluation/Verification Loops - Quality gates and review processes
6. Tool Augmentation - MCP servers, custom agents and skills
7. Memory/Artifact Continuity - ADRs, specs, decision logs, reusable prompts
8. Safe Orchestration - Autonomy with guardrails, verification, measurable outcomes

## 📄 Output Formats

### ADR Format (Primary)

```markdown
# ADR: AI Enablement Assessment

## Readiness Scores

- **Repo Readiness**: 75/100 - Strong foundation
- **Team Readiness**: 60/100 - Needs process maturity
- **Org Enablement**: 45/100 - Limited governance

## Phased Implementation

### 30 Days

- Add Copilot instructions
- Implement code review process

### 60 Days

- Set up GitHub Advanced Security
- Create evaluation loops
```

### JSON Format (Secondary)

```json
{
  "readinessScores": {
    "repo": 75,
    "team": 60,
    "org": 45
  },
  "recommendations": [
    {
      "priority": "high",
      "category": "governance",
      "title": "Add Copilot instructions",
      "timeframe": "30 days"
    }
  ]
}
```

## 🔗 API Reference

See [CONSUMPTION.md](./CONSUMPTION.md) for detailed API documentation and integration examples.

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/Ankh-Studio/copilot-enablement-adr.git
cd copilot-enablement-adr

# Install dependencies
npm install

# Development workflow
npm run dev          # Watch mode
npm run build        # TypeScript compilation
npm run bundle       # Bundle for distribution
npm run format       # Prettier formatting
npm run lint         # Code quality checks
```

## 📦 Build & Bundle

The plugin produces two distribution formats:

```bash
npm run build    # TypeScript → dist/index.js (17KB)
npm run bundle   # Bundled → dist/bundle.js (13.8KB)
```

- **dist/index.js** - TypeScript compiled output with declarations
- **dist/bundle.js** - Minified bundle for production use

## 🏗️ Architecture

This plugin follows a simple, direct implementation approach:

```
copilot-enablement-adr/
├── index.ts              # Main plugin logic and analysis engine
├── skills/               # Orchestratable skill components
│   ├── tech-stack-analyzer/
│   ├── security-scanner/
│   ├── readiness-scorer/
│   └── adr-generator/
├── templates/            # ADR and output templates
└── dist/                 # Built distribution files
```

**Design Philosophy**

- **Small & Sharp**: Focused implementation without unnecessary abstraction layers
- **Evidence-Based**: Analysis grounded in concrete detected signals
- **Skill-First**: Components designed for future orchestration compatibility
- **Composable**: Clean upgrade path to richer agent skills without overbuilding

## 📋 Dependencies

### Runtime

- `@specfy/stack-analyser` - Tech stack detection (700+ technologies)
- `@octokit/rest` - GitHub API integration

### Development

- `typescript` - Type safety and compilation
- `eslint` + `prettier` - Code quality
- `esbuild` - Fast bundling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Ankh-Studio/copilot-enablement-adr/issues)
- **Documentation**: [CONSUMPTION.md](./CONSUMPTION.md)
- **Discussions**: [GitHub Discussions](https://github.com/Ankh-Studio/copilot-enablement-adr/discussions)

---

**Built with ❤️ by [Ankh Studio](https://github.com/Ankh-Studio)**
