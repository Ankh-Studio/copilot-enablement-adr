interface ReadinessScores {
  repo: { score: number; confidence: string; evidence: string[] };
  team: { score: number; confidence: string; evidence: string[] };
  org: { score: number; confidence: string; evidence: string[] };
  overall: number;
}

interface TechStackAnalysis {
  summary: string;
  confidence: string;
}

interface SecurityAnalysis {
  available: boolean;
  codeql?: { enabled: boolean };
  dependabot?: { enabled: boolean };
  secretScanning?: { enabled: boolean };
}

interface Assessment {
  timestamp: string;
  repository: string;
  techStack: TechStackAnalysis;
  githubSecurity: SecurityAnalysis;
  readinessScores: ReadinessScores;
  maturityLayers: {
    current: string;
    next: string;
  };
  recommendations: Array<{
    priority: string;
    category: string;
    title: string;
    description: string;
    timeframe: string;
  }>;
}

interface GeneratorOptions {
  template?: 'consultant' | 'technical' | 'executive';
  includeEvidence?: boolean;
  includeRisks?: boolean;
  customSections?: string[];
}

class ADRGenerator {
  private template: string;
  private includeEvidence: boolean;
  private includeRisks: boolean;
  private customSections: string[];

  constructor(options: GeneratorOptions = {}) {
    this.template = options.template || 'consultant';
    this.includeEvidence = options.includeEvidence ?? true;
    this.includeRisks = options.includeRisks ?? true;
    this.customSections = options.customSections || [];
  }

  generateADR(assessment: Assessment): string {
    const baseADR = this.generateBaseADR(assessment);
    const templateSections = this.generateTemplateSections(assessment);
    const customSections = this.generateCustomSections(assessment);

    return [baseADR, templateSections, customSections].join('\n\n');
  }

  private generateBaseADR(assessment: Assessment): string {
    const date = new Date(assessment.timestamp).toLocaleDateString();
    
    return `# ADR: AI Enablement Assessment

## Status
**Draft** - Assessment completed on ${date}

## Repository Analyzed
\`${assessment.repository}\`

## Readiness Scores
- **Repo Readiness**: ${assessment.readinessScores.repo.score}/100 (${assessment.readinessScores.repo.confidence} confidence)
- **Team Readiness**: ${assessment.readinessScores.team.score}/100 (${assessment.readinessScores.team.confidence} confidence)
- **Org Enablement**: ${assessment.readinessScores.org.score}/100 (${assessment.readinessScores.org.confidence} confidence)
- **Overall**: ${assessment.readinessScores.overall}/100

## Tech Stack Summary
${assessment.techStack.summary}

## Current Maturity Layer
**Current**: ${assessment.maturityLayers.current}
**Next Target**: ${assessment.maturityLayers.next}`;
  }

  private generateTemplateSections(assessment: Assessment): string {
    switch (this.template) {
      case 'consultant':
        return this.generateConsultantSections(assessment);
      case 'technical':
        return this.generateTechnicalSections(assessment);
      case 'executive':
        return this.generateExecutiveSections(assessment);
      default:
        return this.generateConsultantSections(assessment);
    }
  }

  private generateConsultantSections(assessment: Assessment): string {
    const recommendations = this.formatRecommendations(assessment.recommendations);
    const evidence = this.includeEvidence ? this.generateEvidenceSection(assessment) : '';
    const risks = this.includeRisks ? this.generateRiskSection(assessment) : '';

    return `## Recommendations
${recommendations}

${evidence}

${risks}

## Implementation Timeline

### 30 Days
${this.getShortTermRecommendations(assessment.recommendations)}

### 60 Days
${this.getMediumTermRecommendations(assessment.recommendations)}

### 90 Days
${this.getLongTermRecommendations(assessment.recommendations)}

## Success Metrics
- **Repository Hygiene**: Improved documentation and build processes
- **Security Posture**: GitHub Advanced Security adoption
- **Team Capability**: Established code review and quality gates
- **Organizational Enablement**: Policy framework and resource allocation

## Next Steps
1. Review and validate assessment findings
2. Secure stakeholder buy-in for recommended changes
3. Establish implementation timeline and resource allocation
4. Begin with high-priority, low-effort improvements
5. Monitor progress and adjust approach based on results`;
  }

  private generateTechnicalSections(_assessment: Assessment): string {
    return `## Technical Implementation

### Required Tools and Services
- **GitHub Advanced Security**: CodeQL, Dependabot, Secret Scanning
- **Documentation Tools**: README improvements, API documentation
- **Build Automation**: CI/CD pipeline enhancement
- **Quality Gates**: Code review processes and automated testing

### Integration Patterns
- Leverage existing GitHub workflows and actions
- Integrate with current development toolchain
- Maintain backward compatibility during transition
- Use gradual rollout approach for new features

### Security Considerations
- Implement principle of least privilege
- Establish secure development practices
- Configure automated security scanning
- Create incident response procedures

### Performance Monitoring
- Track repository health metrics
- Monitor security alert trends
- Measure developer productivity impact
- Assess AI assistance effectiveness`;
  }

  private generateExecutiveSections(assessment: Assessment): string {
    const businessImpact = this.assessBusinessImpact(assessment);
    const resourceRequirements = this.estimateResourceRequirements(assessment);

    return `## Executive Summary

This assessment evaluates the repository's readiness for AI enablement and provides a roadmap for achieving enhanced development capabilities through AI assistance.

## Business Impact
${businessImpact}

## Resource Requirements
${resourceRequirements}

## Strategic Alignment

### Benefits
- **Development Velocity**: Faster code creation and review cycles
- **Quality Improvement**: Reduced bugs through AI-assisted development
- **Knowledge Transfer**: Better documentation and onboarding
- **Innovation Enablement**: Foundation for advanced AI adoption

### Investment Considerations
- **Time Investment**: 30-90 days for full implementation
- **Tool Costs**: GitHub Advanced Security licensing
- **Training Investment**: Team education and process adoption
- **Ongoing Maintenance**: Continuous improvement and monitoring

## Risk Mitigation
- **Technical Risk**: Gradual implementation with rollback capability
- **Adoption Risk**: Comprehensive training and support programs
- **Security Risk**: Enhanced security controls and monitoring
- **Budget Risk**: Phased investment with measurable ROI`;
  }

  private generateEvidenceSection(assessment: Assessment): string {
    return `## Evidence

### Repository Readiness
${assessment.readinessScores.repo.evidence.map((e: string) => `- ${e}`).join('\n')}

### Team Readiness  
${assessment.readinessScores.team.evidence.map((e: string) => `- ${e}`).join('\n')}

### Org Enablement
${assessment.readinessScores.org.evidence.map((e: string) => `- ${e}`).join('\n')}`;
  }

  private generateRiskSection(assessment: Assessment): string {
    const risks = this.identifyRisks(assessment);
    return `## Risk Assessment

### High Priority Risks
${risks.high.map((risk: string) => `- **${risk}**`).join('\n')}

### Medium Priority Risks
${risks.medium.map((risk: string) => `- **${risk}**`).join('\n')}

### Low Priority Risks
${risks.low.map((risk: string) => `- **${risk}**`).join('\n')}

### Mitigation Strategies
- **Technical**: Implement gradual changes with monitoring
- **Process**: Establish clear guidelines and training
- **Organizational**: Secure leadership support and resources
- **Security**: Enhanced controls and regular assessments`;
  }

  private generateCustomSections(assessment: Assessment): string {
    return this.customSections.map(section => {
      switch (section) {
        case 'compliance':
          return this.generateComplianceSection(assessment);
        case 'budget':
          return this.generateBudgetSection(assessment);
        case 'timeline':
          return this.generateDetailedTimeline(assessment);
        default:
          return `## ${section}\n\nCustom section content for ${section}`;
      }
    }).join('\n\n');
  }

  private formatRecommendations(recommendations: Assessment['recommendations']): string {
    return recommendations
      .map(rec => `- **${rec.title}** (${rec.timeframe}): ${rec.description}`)
      .join('\n');
  }

  private getShortTermRecommendations(recommendations: Assessment['recommendations']): string {
    return recommendations
      .filter(rec => rec.timeframe === '30 days')
      .map(rec => `- ${rec.title}: ${rec.description}`)
      .join('\n');
  }

  private getMediumTermRecommendations(recommendations: Assessment['recommendations']): string {
    return recommendations
      .filter(rec => rec.timeframe === '60 days')
      .map(rec => `- ${rec.title}: ${rec.description}`)
      .join('\n');
  }

  private getLongTermRecommendations(recommendations: Assessment['recommendations']): string {
    return recommendations
      .filter(rec => rec.timeframe === '90 days')
      .map(rec => `- ${rec.title}: ${rec.description}`)
      .join('\n');
  }

  private identifyRisks(_assessment: Assessment): { high: string[], medium: string[], low: string[] } {
    return {
      high: [
        'Insufficient security practices may expose sensitive data',
        'Team resistance to AI adoption could impact productivity',
        'Inadequate documentation may hinder AI assistance effectiveness'
      ],
      medium: [
        'Integration challenges with existing development workflows',
        'Learning curve for new tools and processes',
        'Potential increase in initial development time'
      ],
      low: [
        'Tool licensing and subscription costs',
        'Maintenance overhead for new systems',
        'Potential dependency on AI assistance'
      ]
    };
  }

  private assessBusinessImpact(assessment: Assessment): string {
    const overallScore = assessment.readinessScores.overall;
    
    if (overallScore >= 70) {
      return 'Repository demonstrates strong readiness for AI enablement with immediate potential for productivity gains and quality improvements.';
    } else if (overallScore >= 50) {
      return 'Repository has moderate AI enablement readiness with clear opportunities for improvement through structured implementation.';
    } else {
      return 'Repository requires significant preparation before AI enablement can deliver optimal value and ROI.';
    }
  }

  private estimateResourceRequirements(assessment: Assessment): string {
    const overallScore = assessment.readinessScores.overall;
    
    if (overallScore >= 70) {
      return '- **Time**: 30-60 days for full implementation\n- **Budget**: Minimal - primarily tool licensing\n- **Personnel**: 1-2 team members part-time\n- **Training**: Basic tool adoption training';
    } else if (overallScore >= 50) {
      return '- **Time**: 60-90 days for comprehensive implementation\n- **Budget**: Moderate - tools and process improvements\n- **Personnel**: 2-3 team members part-time\n- **Training**: Comprehensive tool and process training';
    } else {
      return '- **Time**: 90+ days for foundational improvements\n- **Budget**: Significant - tools, processes, and documentation\n- **Personnel**: 3+ team members dedicated effort\n- **Training**: Extensive training and change management';
    }
  }

  private generateComplianceSection(_assessment: Assessment): string {
    return `## Compliance Considerations

### Regulatory Requirements
- Data protection and privacy regulations
- Industry-specific compliance standards
- Intellectual property and licensing requirements

### Security Standards
- SOC 2 compliance considerations
- ISO 27001 security framework alignment
- NIST cybersecurity framework adherence

### Documentation Requirements
- Audit trail maintenance
- Policy documentation updates
- Training record keeping`;
  }

  private generateBudgetSection(_assessment: Assessment): string {
    return `## Budget Analysis

### One-Time Costs
- GitHub Advanced Security licensing: $X/month
- Training and education: $X
- Documentation improvements: $X
- Tool setup and configuration: $X

### Ongoing Costs
- License renewals: $X/year
- Training updates: $X/year
- Maintenance and support: $X/year

### ROI Projections
- Development velocity improvement: X%
- Bug reduction: X%
- Developer satisfaction: X%
- Time to market acceleration: X%`;
  }

  private generateDetailedTimeline(_assessment: Assessment): string {
    return `## Detailed Implementation Timeline

### Phase 1: Foundation (Days 1-30)
- Week 1-2: Repository assessment and documentation improvements
- Week 3: Security tool implementation
- Week 4: Initial team training and process establishment

### Phase 2: Integration (Days 31-60)
- Week 5-6: Advanced security features and CI/CD enhancement
- Week 7-8: AI tool integration and workflow optimization
- Week 9: Process refinement and feedback collection

### Phase 3: Optimization (Days 61-90)
- Week 10-12: Advanced features and custom configurations
- Week 13: Performance monitoring and optimization
- Week 14-15: Full team adoption and best practice establishment
- Week 16: Assessment review and future planning`;
  }

  generateJSON(assessment: Assessment): string {
    return JSON.stringify({
      metadata: {
        generated: new Date().toISOString(),
        template: this.template,
        version: '1.0'
      },
      assessment,
      adr: this.generateADR(assessment)
    }, null, 2);
  }
}

export { ADRGenerator };
export default ADRGenerator;
