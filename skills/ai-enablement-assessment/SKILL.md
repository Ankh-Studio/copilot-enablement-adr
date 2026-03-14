# AI Enablement Assessment

## Description

Analyzes a repository's AI/agentic enablement readiness and generates a consultant-quality Architecture Decision Record (ADR) with evidence-based scoring, risk assessment, and phased implementation recommendations.

## Capabilities

- **Tech Stack Analysis**: Uses @specfy/stack-analyser for comprehensive technology detection
- **GitHub Advanced Security Integration**: Analyzes security posture and GH-AS features
- **Evidence-Based Scoring**: Three-dimensional readiness assessment (Repo, Team, Org)
- **Maturity Path Assessment**: 8-layer path-to-agentic evaluation
- **ADR Generation**: Consultant-quality proposals with actionable recommendations

## Inputs

- Repository path (default: current directory)
- Optional: GitHub repository URL for GH-AS data
- Optional: Organization context and constraints

## Outputs

- **Primary**: Markdown ADR with comprehensive analysis
- **Secondary**: JSON assessment object for programmatic use

## Usage

```bash
copilot run ai-enablement-assessment --repo ./my-project
```

## Dependencies

- @specfy/stack-analyser - Tech stack detection
- @octokit/rest - GitHub API integration
- Copilot CLI built-in capabilities

## Implementation Notes

### Tech Stack Detection Strategy

1. **Primary**: Use @specfy/stack-analyser for deterministic detection of 700+ technologies
2. **Fallback**: Use LLM inference for ambiguous findings and architectural context
3. **Integration**: Seamless Copilot CLI skill integration with structured JSON output

### GitHub Advanced Security Integration

- Detect existing CodeQL scanning setup and results
- Identify Dependabot alerts and dependency review status
- Check for secret scanning configuration and findings
- Assess Copilot Autofix adoption and security campaigns
- Evaluate security overview and risk distribution

### Scoring Model

Three readiness dimensions (0-100 each):

1. **Repo Readiness**: Technical foundation and hygiene
2. **Team Readiness**: Process and capability maturity
3. **Org Enablement Readiness**: Enterprise and governance readiness

### 8-Layer Path to Agentic Maturity

1. Foundations - Basic repo clarity and structure
2. Build/Test Determinism - Reproducible development workflows
3. Documentation Spec Maturity - Adequate context for AI/human understanding
4. Repo-Aware AI Guidance - Copilot instructions and conventions
5. Evaluation/Verification Loops - Quality gates and review processes
6. Tool Augmentation - MCP servers, custom agents and skills
7. Memory/Artifact Continuity - ADRs, specs, decision logs, reusable prompts
8. Safe Orchestration - Autonomy with guardrails, verification, measurable outcomes

## Evidence-Based Assessment

Each score includes:

- Numerical rating (0-100)
- Confidence level (High/Medium/Low)
- Supporting evidence from repository analysis
- Specific recommendations for improvement

## Risk Categorization

Risks are separated by type:

- **Governance barriers**: Environmental constraints, policies, compliance
- **Team/Process barriers**: Workflow, skill gaps, cultural factors

## Output Formats

### Markdown ADR Structure

- Title, Status, Date, Repository analyzed
- Inferred product/service purpose with confidence
- Current state summary
- Evidence inventory (observed vs inferred)
- Tech stack summary
- Existing AI/Copilot enablement detected
- Readiness scores (Repo, Team, Org) with evidence
- Maturity assessment by layers
- Risks and blockers separated by type
- Governance environmental constraints
- Team process behavior change requirements
- Missing artifacts and recommended additions
- Phased path toward orchestration
- Tradeoffs and cautions
- 30/60/90 day action plan

### JSON Assessment Object

Structured data for programmatic consumption including all scores, evidence, and recommendations.

## Installation

```bash
copilot plugin install @ankh-studio/copilot-enablement-adr
```
