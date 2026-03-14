---
name: ai-enablement-orchestrator
description: Metaskill that orchestrates AI enablement assessment by coordinating specialized skills for tech stack analysis, security scanning, readiness scoring, and ADR generation. Use when comprehensive AI enablement evaluation is needed.
license: MIT
metadata:
  author: Ankh Studio
  version: "1.0"
  capabilities: skill-orchestration workflow-management copilot-sdk-integration
---

# AI Enablement Orchestrator

Metaskill that coordinates specialized skills to perform comprehensive AI enablement assessments.

## Usage

```bash
copilot run ai-enablement-orchestrator --repo ./my-project --github-url https://github.com/owner/repo --token $GITHUB_TOKEN
```

## Inputs

- Repository path (default: current directory)
- Optional: GitHub repository URL and token for security analysis
- Optional: Organizational context and constraints
- Optional: ADR template style (consultant, technical, executive)

## Outputs

- **Primary**: Complete AI enablement assessment with consultant-quality ADR
- **Secondary**: Individual skill outputs for detailed analysis
- **Metadata**: Orchestration workflow and execution summary

## Orchestration Workflow

### Phase 1: Analysis
1. **Tech Stack Analysis** - Detect technologies and infrastructure
2. **Security Scanning** - Analyze GitHub Advanced Security features
3. **Readiness Scoring** - Calculate three-dimensional readiness scores

### Phase 2: Synthesis
1. **Evidence Aggregation** - Collect and correlate findings
2. **Risk Assessment** - Identify blockers and mitigation strategies
3. **Recommendation Generation** - Create actionable improvement plans

### Phase 3: Documentation
1. **ADR Generation** - Create consultant-quality Architecture Decision Record
2. **Executive Summary** - High-level overview for stakeholders
3. **Implementation Roadmap** - Phased action plan with timelines

## Coordinated Skills

### Tech Stack Analyzer
- **Purpose**: Comprehensive technology detection
- **Output**: Technology inventory with confidence levels
- **Integration**: Provides foundation for security and readiness analysis

### Security Scanner
- **Purpose**: GitHub Advanced Security analysis
- **Output**: Security posture assessment
- **Integration**: Informs readiness scoring and risk assessment

### Readiness Scorer
- **Purpose**: Three-dimensional readiness evaluation
- **Output**: Evidence-based readiness scores
- **Integration**: Drives recommendation generation and ADR content

### ADR Generator
- **Purpose**: Consultant-quality documentation generation
- **Output**: Structured ADR with implementation roadmap
- **Integration**: Final output synthesizing all assessment findings

## Copilot SDK Integration

The orchestrator uses the GitHub Copilot SDK for:

- **Skill Discovery**: Dynamic skill registration and discovery
- **Workflow Orchestration**: Coordinated skill execution
- **Error Handling**: Graceful degradation and fallback strategies
- **State Management**: Persistent workflow state and recovery
- **Export Capabilities**: External agent integration endpoints

## Output Structure

```json
{
  "orchestration": {
    "workflow": "ai-enablement-assessment",
    "duration": "45 seconds",
    "skills": ["tech-stack-analyzer", "security-scanner", "readiness-scorer", "adr-generator"]
  },
  "assessment": {
    "readinessScores": { "repo": 75, "team": 60, "org": 45, "overall": 60 },
    "maturityLayer": "foundations",
    "recommendations": [...]
  },
  "adr": {
    "title": "AI Enablement Assessment",
    "status": "Draft",
    "sections": [...]
  }
}
```

## Implementation Notes

- Skills are executed in dependency order with parallel execution where possible
- Error handling includes fallback strategies for missing dependencies
- State management ensures workflow recovery from interruptions
- Export endpoints enable integration with external systems

## Export Capabilities

### Agent Orchestration
- **REST API**: HTTP endpoints for external agent integration
- **Event Streaming**: Real-time workflow progress updates
- **Batch Processing**: Bulk repository assessment capabilities
- **Custom Workflows**: Configurable assessment pipelines

### Integration Options
- **GitHub Actions**: Native GitHub workflow integration
- **CI/CD Pipelines**: Automated assessment in development workflows
- **Documentation Systems**: Confluence, Notion, and wiki integration
- **Monitoring Tools**: Dashboard and alerting integration

## Configuration Options

### Workflow Customization
- **Skill Selection**: Choose specific skills for targeted assessments
- **Parallel Execution**: Configure skill execution strategy
- **Timeout Settings**: Adjust per-skill and overall workflow timeouts
- **Retry Policies**: Configure error handling and retry strategies

### Output Customization
- **ADR Templates**: Custom ADR sections and formatting
- **Report Formats**: JSON, Markdown, HTML, PDF output options
- **Data Export**: Structured data for integration with other tools
- **Notification**: Webhook and email notification options

## References

See `assets/workflow-configs/` for workflow templates and `references/orchestration-guide.md` for detailed integration instructions.
