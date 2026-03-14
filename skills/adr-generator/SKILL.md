---
name: adr-generator
description: Generates consultant-quality Architecture Decision Records (ADRs) with evidence-based analysis, risk assessment, and phased implementation recommendations. Use when creating formal documentation for AI enablement decisions.
license: MIT
metadata:
  author: Ankh Studio
  version: '1.0'
  capabilities: document-generation template-processing risk-assessment
---

# ADR Generator

Creates professional Architecture Decision Records with comprehensive analysis and actionable recommendations.

## Usage

```bash
copilot run adr-generator --assessment ./assessment.json --template consultant
```

## Inputs

- Readiness assessment results (from readiness-scorer)
- Tech stack analysis (from tech-stack-analyzer)
- Security analysis (from security-scanner)
- Optional: ADR template style (consultant, technical, executive)

## Outputs

- **Primary**: Markdown ADR with structured sections
- \*\*Secondary: JSON ADR for programmatic use
- **Metadata**: Template version and generation timestamp

## ADR Structure

### Standard Sections

- **Title & Status**: Clear decision identifier and current state
- **Context**: Repository analysis and current state summary
- **Decision**: Specific AI enablement recommendations
- **Consequences**: Expected outcomes and trade-offs
- **Implementation**: Phased action plan with timelines
- **Evidence**: Supporting data and analysis results

### Consultant-Quality Features

- **Evidence-Based Analysis**: All recommendations backed by data
- **Risk Assessment**: Identification of potential blockers
- **Phased Implementation**: 30/60/90 day action plans
- **Executive Summary**: High-level overview for stakeholders
- **Technical Details**: Specific implementation guidance

## Template Styles

### Consultant Template

- Executive summary and business impact
- Detailed risk assessment with mitigation strategies
- Comprehensive implementation roadmap
- ROI analysis and success metrics

### Technical Template

- Implementation details and code examples
- Integration patterns and best practices
- Performance considerations and monitoring
- Security and compliance requirements

### Executive Template

- High-level strategic overview
- Business case and value proposition
- Resource requirements and budget estimates
- Timeline and milestone tracking

## Output Example

```markdown
# ADR: AI Enablement Assessment

## Status

**Draft** - Assessment completed on January 15, 2024

## Repository Analyzed

`./my-project`

## Readiness Scores

- **Repo Readiness**: 75/100 (medium confidence)
- **Team Readiness**: 60/100 (low confidence)
- **Org Enablement**: 45/100 (low confidence)
- **Overall**: 60/100

## Current Maturity Layer

**Current**: foundations
**Next Target**: build-test

## Recommendations

- **Improve repository foundations** (30 days): Add clear documentation, establish build processes, and enable security scanning
- **Enable GitHub Advanced Security** (30 days): Configure CodeQL, Dependabot, and secret scanning for improved security posture
- **Add Copilot instructions** (60 days): Create copilot-instructions.md to guide AI assistants with repository-specific context

## Evidence

### Repository Readiness

- Clear tech stack detected
- CodeQL scanning enabled
- Documentation structure assessed

### Team Readiness

- Security practices in place
- Standard development practices assumed

### Org Enablement

- Basic organizational structure assumed
```

## Implementation Notes

- Templates are customizable via assets/adr-templates/
- Supports multiple output formats (Markdown, JSON, HTML)
- Includes version control and change tracking
- Integrates with existing documentation workflows

## Customization Options

- **Brand Templates**: Add organization-specific styling
- **Section Extensions**: Include custom ADR sections
- **Output Formats**: Support for PDF, Word, and Confluence
- **Integration Hooks**: Connect to documentation systems

## References

See `assets/adr-templates/` for template files and `references/adr-guide.md` for ADR best practices.
