---
name: readiness-scorer
description: Calculates three-dimensional AI enablement readiness scores (Repo, Team, Org) with evidence-based assessment and confidence levels. Use when evaluating repository readiness for AI/agent adoption.
license: MIT
metadata:
  author: Ankh Studio
  version: "1.0"
  capabilities: scoring-algorithms evidence-assessment maturity-evaluation
---

# Readiness Scorer

Calculates comprehensive AI enablement readiness scores across three dimensions with evidence-based assessment.

## Usage

```bash
copilot run readiness-scorer --tech-stack ./tech-stack.json --security ./security.json
```

## Inputs

- Tech stack analysis results (from tech-stack-analyzer)
- Security analysis results (from security-scanner)
- Optional: Organizational context and constraints

## Outputs

- **Primary**: JSON object with readiness scores and evidence
- **Secondary**: Readiness assessment summary
- **Metadata**: Confidence levels and scoring methodology

## Readiness Dimensions

### Repository Readiness (0-100)
Evaluates technical foundation and repository hygiene:

- **Tech Stack Clarity**: Well-defined and detectable technologies
- **Security Features**: CodeQL, Dependabot, secret scanning adoption
- **Documentation**: README, API docs, architectural documentation
- **Build Processes**: CI/CD, testing, reproducible workflows
- **Code Quality**: Linting, formatting, code review processes

### Team Readiness (0-100)
Assesses team process and capability maturity:

- **Security Practices**: Security review processes and awareness
- **Technical Complexity**: Ability to manage sophisticated tech stacks
- **Development Processes**: Code review, testing, deployment workflows
- **Collaboration**: Documentation practices and knowledge sharing
- **Learning Culture**: Adoption of new tools and practices

### Organization Enablement Readiness (0-100)
Measures enterprise and governance readiness:

- **Security Governance**: Advanced Security and compliance frameworks
- **Tool Adoption**: Enterprise tooling and integration capabilities
- **Policy Framework**: Development policies and guidelines
- **Resource Allocation**: Budget and support for AI initiatives
- **Innovation Culture**: Openness to AI and automation

## Output Structure

```json
{
  "repo": {
    "score": 75,
    "confidence": "medium",
    "evidence": ["Clear tech stack detected", "CodeQL scanning enabled"]
  },
  "team": {
    "score": 60,
    "confidence": "low", 
    "evidence": ["Security practices in place", "Standard development practices assumed"]
  },
  "org": {
    "score": 45,
    "confidence": "low",
    "evidence": ["Basic organizational structure assumed"]
  },
  "overall": 60
}
```

## Scoring Methodology

### Evidence-Based Scoring
- Each dimension starts with a base score
- Evidence increases score and confidence
- Missing features decrease score
- Confidence reflects evidence quality

### Confidence Levels
- **High**: Direct observation and measurement
- **Medium**: Strong indicators and patterns
- **Low**: Assumptions and inferences

### Evidence Categories
- **Direct**: Configured features, observable files
- **Indirect**: Patterns, dependencies, workflows
- **Inferred**: Best practices, industry standards

## Implementation Notes

- Scores are weighted averages of evidence-based factors
- Confidence levels adjust based on data availability
- Evidence is collected from multiple sources
- Scoring adapts to repository size and complexity

## Assessment Factors

### Repository Factors
- Tech stack detection confidence: +15 points
- GitHub Advanced Security features: +10-30 points
- Documentation completeness: +5-15 points
- Build/test automation: +10-20 points
- Code quality tools: +5-10 points

### Team Factors  
- Security practices: +15-25 points
- Tech stack complexity: +5-15 points
- Process maturity: +10-20 points
- Collaboration evidence: +5-15 points

### Organization Factors
- Advanced Security: +20-30 points
- Public repository culture: +5-10 points
- Enterprise features: +10-20 points
- Policy documentation: +5-15 points

## References

See `assets/scoring-rubrics/` for detailed scoring criteria and evidence requirements.
