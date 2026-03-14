/**
 * ADR Template System
 *
 * Centralized template management for Architecture Decision Records
 * Following the dual-layer architecture: templates in src/, orchestration in skills/
 */

export interface TemplateContext {
  assessment: any;
  businessImpact?: any;
  resourceRequirements?: any;
  longTermRecs?: string;
  midTermRecs?: string;
  shortTermRecs?: string;
}

export interface ADRTemplate {
  name: string;
  description: string;
  sections: TemplateSection[];
}

export interface TemplateSection {
  title: string;
  template: string;
  condition?: (context: TemplateContext) => boolean;
  priority?: number;
}

/**
 * Consultant-quality ADR template
 * Comprehensive, detailed, suitable for technical leadership
 */
export const consultantTemplate: ADRTemplate = {
  name: 'consultant',
  description: 'Comprehensive consultant-quality ADR with detailed analysis',
  sections: [
    {
      title: 'Executive Summary',
      template: `## Executive Summary

This Architecture Decision Record (ADR) documents the analysis and recommendations for AI enablement readiness of the {{assessment.repository}} repository. The current maturity level is assessed as **{{assessment.maturityLayers.current}}** with a target progression to **{{assessment.maturityLayers.next}}**.

**Key Findings:**
- Overall Readiness Score: {{assessment.readinessScores.overall}}/100
- Repository Readiness: {{assessment.readinessScores.repo.score}}/100 ({{assessment.readinessScores.repo.confidence}} confidence)
- Team Readiness: {{assessment.readinessScores.team.score}}/100 ({{assessment.readinessScores.team.confidence}} confidence)
- Organizational Readiness: {{assessment.readinessScores.org.score}}/100 ({{assessment.readinessScores.org.confidence}} confidence)

**Primary Recommendation:** Adopt a phased approach to AI enablement, focusing on foundational improvements before advanced AI integration.

## Current State Assessment

### Technology Stack Analysis
{{assessment.techStack.summary}}

Confidence in analysis: **{{assessment.techStack.confidence}}**

### Security Posture
GitHub Security Features Status:
{{#if assessment.githubSecurity.available}}
- CodeQL: {{#if assessment.githubSecurity.codeql.enabled}}Enabled{{else}}Disabled{{/if}}
- Dependabot: {{#if assessment.githubSecurity.dependabot.enabled}}Enabled{{else}}Disabled{{/if}}
- Secret Scanning: {{#if assessment.githubSecurity.secretScanning.enabled}}Enabled{{else}}Disabled{{/if}}
{{else}}
GitHub security analysis not available - manual review recommended
{{/if}}

### Readiness Assessment

#### Repository Dimension ({{assessment.readinessScores.repo.score}}/100)
{{#each assessment.readinessScores.repo.evidence}}
- {{this}}
{{/each}}

#### Team Dimension ({{assessment.readinessScores.team.score}}/100)
{{#each assessment.readinessScores.team.evidence}}
- {{this}}
{{/each}}

#### Organizational Dimension ({{assessment.readinessScores.org.score}}/100)
{{#each assessment.readinessScores.org.evidence}}
- {{this}}
{{/each}}

## Maturity Layer Analysis

### Current Layer: {{assessment.maturityLayers.current}}
[Detailed analysis of current maturity characteristics]

### Target Layer: {{assessment.maturityLayers.next}}
[Description of target maturity and benefits]

## Implementation Roadmap

### 30-Day Actions (Foundation)
{{shortTermRecs}}

### 60-Day Actions (Capability Building)  
{{midTermRecs}}

### 90-Day Actions (Advanced Integration)
{{longTermRecs}}

## Risk Assessment

### High Risks
{{#each assessment.recommendations}}
{{#eq priority "high"}}
- **{{title}}**: {{description}}
{{/eq}}
{{/each}}

### Medium Risks  
{{#each assessment.recommendations}}
{{#eq priority "medium"}}
- **{{title}}**: {{description}}
{{/eq}}
{{/each}}

### Low Risks
{{#each assessment.recommendations}}
{{#eq priority "low"}}
- **{{title}}**: {{description}}
{{/eq}}
{{/each}}

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
5. Monitor progress and adjust approach based on results`,
      priority: 1,
    },
  ],
};

/**
 * Technical-focused ADR template
 * Implementation details, technical specifications, integration patterns
 */
export const technicalTemplate: ADRTemplate = {
  name: 'technical',
  description: 'Technical implementation focused ADR',
  sections: [
    {
      title: 'Technical Implementation',
      template: `## Technical Implementation

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
- Assess AI assistance effectiveness`,
      priority: 1,
    },
  ],
};

/**
 * Executive-focused ADR template
 * Business impact, resource requirements, ROI analysis
 */
export const executiveTemplate: ADRTemplate = {
  name: 'executive',
  description: 'Executive summary focused ADR with business impact',
  sections: [
    {
      title: 'Executive Summary',
      template: `## Executive Summary

**Business Impact Assessment: {{businessImpact.level}}**
**Investment Requirement: {{resourceRequirements.level}}**
**Expected ROI Timeline: {{businessImpact.timeline}}**

### Key Business Drivers
{{#each businessImpact.drivers}}
- {{this}}
{{/each}}

### Resource Requirements
{{#each resourceRequirements.categories}}
- **{{name}}**: {{description}} ({{effort}} effort)
{{/each}}

### Financial Impact
- **Short-term Costs**: {{resourceRequirements.shortTermCosts}}
- **Long-term Benefits**: {{businessImpact.longTermBenefits}}
- **Risk Mitigation**: {{businessImpact.riskMitigation}}`,
      priority: 1,
      condition: ctx => !!ctx.businessImpact,
    },
  ],
};

/**
 * Template registry for easy access and extension
 */
export const templates = {
  consultant: consultantTemplate,
  technical: technicalTemplate,
  executive: executiveTemplate,
};

/**
 * Template renderer using simple string interpolation
 * In a real implementation, you might use Handlebars, Mustache, or similar
 */
export class TemplateRenderer {
  /**
   * Render a template with the given context
   */
  static render(template: string, context: TemplateContext): string {
    let result = template;

    // Simple variable substitution {{variable}}
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(context, path.trim());
      return value !== undefined ? String(value) : match;
    });

    // Handle simple conditionals {{#if condition}}...{{/if}}
    result = result.replace(
      /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_match, condition, content) => {
        const value = this.getNestedValue(context, condition.trim());
        return value ? content : '';
      }
    );

    // Handle simple loops {{#each array}}...{{/each}}
    result = result.replace(
      /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_match, path, template) => {
        const array = this.getNestedValue(context, path.trim());
        if (!Array.isArray(array)) return '';

        return array
          .map(item => {
            let itemResult = template;
            if (typeof item === 'object' && item !== null) {
              Object.keys(item).forEach(key => {
                itemResult = itemResult.replace(
                  new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
                  String(item[key])
                );
              });
            }
            return itemResult;
          })
          .join('\n');
      }
    );

    // Handle equality checks {{#eq value "target"}}...{{/eq}}
    result = result.replace(
      /\{\{#eq\s+([^}]+)\s+"([^"]+)"\}\}([\s\S]*?)\{\{\/eq\}\}/g,
      (_match, path, target, content) => {
        const value = this.getNestedValue(context, path.trim());
        return String(value) === target ? content : '';
      }
    );

    return result;
  }

  /**
   * Get nested object value by path (e.g., "assessment.readinessScores.repo.score")
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Render an entire ADR template
   */
  static renderADR(template: ADRTemplate, context: TemplateContext): string {
    const sections = template.sections
      .filter(section => !section.condition || section.condition(context))
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));

    return sections
      .map(section => {
        const content = this.render(section.template, context);
        return content.trim();
      })
      .join('\n\n');
  }
}

/**
 * Get template by name
 */
export function getTemplate(name: string): ADRTemplate {
  const template = templates[name as keyof typeof templates];
  if (!template) {
    throw new Error(
      `Template '${name}' not found. Available templates: ${Object.keys(templates).join(', ')}`
    );
  }
  return template;
}

/**
 * List all available templates
 */
export function listTemplates(): string[] {
  return Object.keys(templates);
}
