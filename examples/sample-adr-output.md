# ADR: AI Enablement Assessment - example-web-app

## Status

**Draft** - Assessment completed on March 13, 2026

## Repository Analyzed

`./example-web-app` - Analyzed on 2026-03-13

## Inferred Purpose

Web application platform (High confidence)

## Current State Summary

Repository shows good foundational structure with modern web development stack, but lacks AI-specific guidance and advanced security features.

## Evidence Inventory

### Observed

- React frontend with TypeScript
- Node.js backend with Express
- PostgreSQL database
- Docker containerization
- Basic CI/CD with GitHub Actions
- Package-based dependency management

### Inferred

- Web application serving multiple users
- API-driven architecture
- Container-based deployment
- Team of 3-5 developers
- Production environment in cloud

## Tech Stack Summary

Languages: TypeScript (45), JavaScript (20), CSS (10), HTML (5). Technologies: react, nodejs, express, postgresql, docker, typescript, eslint, prettier, github-actions.

## Existing AI/Copilot Enablement Detected

- No copilot-instructions.md found
- No AI-specific documentation
- No MCP servers or custom agents
- Basic code quality tools (ESLint, Prettier)

## Readiness Scores

### Repo Readiness: 75/100 (Medium confidence)

- Clear tech stack detected (+15)
- Basic documentation structure (+5)
- CI/CD pipeline present (+10)
- Missing AI guidance (-10)
- Limited security scanning (-15)

**Evidence:**

- Clear tech stack detected
- Basic documentation structure
- CI/CD pipeline present
- Missing AI guidance
- Limited security scanning

### Team Readiness: 60/100 (Low confidence)

- Modern development practices (+15)
- Code quality tools present (+10)
- Security practices partially implemented (+5)
- No formal review process (-10)
- Limited automated testing (-10)

**Evidence:**

- Modern development practices assumed
- Code quality tools present
- Security practices partially implemented
- Standard development practices assumed

### Org Enablement Readiness: 45/100 (Low confidence)

- Public repository suggests open culture (+5)
- Basic organizational structure (+10)
- No enterprise security features (-20)
- Limited governance processes (-10)

**Evidence:**

- Public repository suggests open culture
- Basic organizational structure assumed
- Enterprise security features unknown

**Overall Readiness: 60/100**

## Maturity Assessment by Layers

### Current Layer: 3/8 - Documentation Spec Maturity

**Score: 50/100**
**Blockers:**

- Documentation completeness not verified
- No AI-specific guidance

**Evidence:**

- Basic documentation present

### Next Target: Layer 4 - Repo-Aware AI Guidance

**Required Improvements:**

- Add copilot-instructions.md
- Create AI development guidelines
- Establish repository-specific AI context

**Blockers:**

- Copilot instructions not found

## Risks and Blockers

### Governance Environmental Constraints

- No enterprise AI policy framework
- Limited security tooling integration
- Unclear data governance for AI usage
- No formal AI compliance review process

### Team Process Behavior Change Requirements

- No formal code review process
- Limited automated testing coverage
- Missing AI development guidelines
- No evaluation loops for AI-generated code
- Need to establish AI-assisted development workflows

## Missing Artifacts and Recommended Additions

### Immediate (30 days)

- `copilot-instructions.md` - Repository-specific AI guidance
- `docs/ai-development-guidelines.md` - Team AI usage policies
- Enhanced security scanning configuration
- Formal code review process documentation

### Short-term (60 days)

- ADR process template and examples
- AI evaluation checklists
- MCP server for repository-specific tools
- Automated testing expansion

### Medium-term (90 days)

- Custom AI agents for domain-specific tasks
- Memory artifacts for AI context continuity
- Orchestration workflows for AI-assisted development
- Advanced security monitoring

## Phased Path Toward Orchestration

### Phase 1: Foundation (30 days)

- Add Copilot instructions and AI guidelines
- Enable GitHub Advanced Security features
- Establish formal code review process
- Create documentation standards

### Phase 2: Enhancement (60 days)

- Implement comprehensive testing strategy
- Add evaluation loops for AI-generated code
- Create ADR process and memory artifacts
- Set up MCP server integration

### Phase 3: Orchestration (90 days)

- Develop custom AI agents for domain tasks
- Implement safe orchestration workflows
- Establish measurable outcomes and guardrails
- Create continuous improvement processes

## Tradeoffs and Cautions

### Tradeoffs

- **Speed vs Quality**: Rapid AI enablement may compromise code quality without proper review processes
- **Innovation vs Security**: Advanced AI features require robust security and governance frameworks
- **Automation vs Control**: Increased automation requires careful monitoring and rollback capabilities

### Cautions

- Start with pilot programs before full AI integration
- Establish clear boundaries for AI decision-making
- Maintain human oversight for critical code changes
- Regular security audits as AI capabilities expand

## 30/60/90 Day Action Plan

### 30 Days

1. **Week 1-2**: Add copilot-instructions.md and basic AI guidelines
2. **Week 3-4**: Enable GitHub Advanced Security and establish code review process
3. **Success Metrics**: Security alerts resolved, review coverage >80%

### 60 Days

1. **Month 2**: Implement comprehensive testing and ADR process
2. **Month 2**: Set up MCP server and evaluation loops
3. **Success Metrics**: Test coverage >70%, ADR process established

### 90 Days

1. **Month 3**: Develop custom agents and orchestration workflows
2. **Month 3**: Implement continuous improvement processes
3. **Success Metrics**: AI-assisted development workflow established, measurable productivity gains

---

_This ADR was generated by the Ankh Copilot Enablement ADR plugin based on repository analysis and industry best practices._
