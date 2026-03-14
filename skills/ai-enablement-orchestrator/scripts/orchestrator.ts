import TechStackAnalyzer from '../../tech-stack-analyzer/scripts/analyzer';
import SecurityScanner from '../../security-scanner/scripts/scanner';
import ReadinessScorer from '../../readiness-scorer/scripts/scorer';
import ADRGenerator from '../../adr-generator/scripts/generator';

export interface OrchestratorOptions {
  repoPath?: string;
  githubUrl?: string;
  githubToken?: string;
  adrTemplate?: 'consultant' | 'technical' | 'executive';
  orgContext?: {
    size?: 'small' | 'medium' | 'large';
    industry?: string;
    compliance?: string[];
  };
}

export interface SkillResult {
  name: string;
  success: boolean;
  duration: number;
  data?: any;
  error?: string;
}

export interface OrchestrationResult {
  workflow: string;
  duration: number;
  skills: SkillResult[];
  assessment?: any;
  adr?: string;
  metadata: {
    timestamp: string;
    repository: string;
    workflow: string;
  };
}

class AIEnablementOrchestrator {
  private repoPath: string;
  private githubUrl?: string;
  private githubToken?: string;
  private adrTemplate: string;
  private orgContext: any;

  constructor(options: OrchestratorOptions = {}) {
    this.repoPath = options.repoPath || process.cwd();
    this.githubUrl = options.githubUrl;
    this.githubToken = options.githubToken;
    this.adrTemplate = options.adrTemplate || 'consultant';
    this.orgContext = options.orgContext || {};
  }

  async orchestrate(): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const results: SkillResult[] = [];

    try {
      // Phase 1: Analysis
      const [techStackResult, securityResult] = await Promise.all([
        this.executeTechStackAnalysis(),
        this.executeSecurityAnalysis()
      ]);

      results.push(techStackResult, securityResult);

      // Phase 2: Readiness Scoring
      const readinessResult = await this.executeReadinessScoring(
        techStackResult.data,
        securityResult.data
      );
      results.push(readinessResult);

      // Phase 3: ADR Generation
      const adrResult = await this.executeADRGeneration(
        techStackResult.data,
        securityResult.data,
        readinessResult.data
      );
      results.push(adrResult);

      const duration = Date.now() - startTime;

      return {
        workflow: 'ai-enablement-assessment',
        duration,
        skills: results,
        assessment: readinessResult.data,
        adr: adrResult.data,
        metadata: {
          timestamp: new Date().toISOString(),
          repository: this.repoPath,
          workflow: 'ai-enablement-assessment'
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        workflow: 'ai-enablement-assessment',
        duration,
        skills: results,
        metadata: {
          timestamp: new Date().toISOString(),
          repository: this.repoPath,
          workflow: 'ai-enablement-assessment'
        }
      };
    }
  }

  private async executeTechStackAnalysis(): Promise<SkillResult> {
    const startTime = Date.now();
    
    try {
      const analyzer = new TechStackAnalyzer({ repoPath: this.repoPath });
      const result = await analyzer.analyze();

      return {
        name: 'tech-stack-analyzer',
        success: true,
        duration: Date.now() - startTime,
        data: result
      };
    } catch (error) {
      return {
        name: 'tech-stack-analyzer',
        success: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      };
    }
  }

  private async executeSecurityAnalysis(): Promise<SkillResult> {
    const startTime = Date.now();
    
    try {
      if (!this.githubUrl || !this.githubToken) {
        return {
          name: 'security-scanner',
          success: false,
          duration: Date.now() - startTime,
          error: 'GitHub URL or token not provided'
        };
      }

      const scanner = new SecurityScanner({
        githubUrl: this.githubUrl,
        githubToken: this.githubToken
      });
      const result = await scanner.analyze();

      return {
        name: 'security-scanner',
        success: true,
        duration: Date.now() - startTime,
        data: result
      };
    } catch (error) {
      return {
        name: 'security-scanner',
        success: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      };
    }
  }

  private async executeReadinessScoring(
    techStack: any,
    security: any
  ): Promise<SkillResult> {
    const startTime = Date.now();
    
    try {
      const scorer = new ReadinessScorer({
        techStack,
        security,
        orgContext: this.orgContext
      });
      const result = scorer.calculateScores();

      return {
        name: 'readiness-scorer',
        success: true,
        duration: Date.now() - startTime,
        data: result
      };
    } catch (error) {
      return {
        name: 'readiness-scorer',
        success: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      };
    }
  }

  private async executeADRGeneration(
    techStack: any,
    security: any,
    readiness: any
  ): Promise<SkillResult> {
    const startTime = Date.now();
    
    try {
      const generator = new ADRGenerator({
        template: this.adrTemplate as any,
        includeEvidence: true,
        includeRisks: true
      });

      const assessment = {
        timestamp: new Date().toISOString(),
        repository: this.repoPath,
        techStack: techStack || { summary: 'Analysis failed', confidence: 'low' },
        githubSecurity: security || { available: false },
        readinessScores: readiness || {
          repo: { score: 0, confidence: 'low', evidence: [] },
          team: { score: 0, confidence: 'low', evidence: [] },
          org: { score: 0, confidence: 'low', evidence: [] },
          overall: 0
        },
        maturityLayers: {
          current: 'unknown',
          next: 'foundations'
        },
        recommendations: this.generateFallbackRecommendations(readiness)
      };

      const adr = generator.generateADR(assessment);

      return {
        name: 'adr-generator',
        success: true,
        duration: Date.now() - startTime,
        data: adr
      };
    } catch (error) {
      return {
        name: 'adr-generator',
        success: false,
        duration: Date.now() - startTime,
        error: (error as Error).message
      };
    }
  }

  private generateFallbackRecommendations(readiness: any): any[] {
    const recommendations = [];

    if (!readiness || readiness.overall < 50) {
      recommendations.push({
        priority: 'high',
        category: 'foundations',
        title: 'Improve repository foundations',
        description: 'Add clear documentation, establish build processes, and enable security scanning',
        timeframe: '30 days'
      });
    }

    if (!readiness || readiness.repo?.score < 70) {
      recommendations.push({
        priority: 'medium',
        category: 'security',
        title: 'Enable GitHub Advanced Security',
        description: 'Configure CodeQL, Dependabot, and secret scanning for improved security posture',
        timeframe: '30 days'
      });
    }

    recommendations.push({
      priority: 'low',
      category: 'ai',
      title: 'Add Copilot instructions',
      description: 'Create copilot-instructions.md to guide AI assistants with repository-specific context',
      timeframe: '60 days'
    });

    return recommendations;
  }

  async exportJSON(result: OrchestrationResult): Promise<string> {
    return JSON.stringify(result, null, 2);
  }

  async getWorkflowSummary(result: OrchestrationResult): Promise<string> {
    const successfulSkills = result.skills.filter(s => s.success).length;
    const totalSkills = result.skills.length;
    const successRate = Math.round((successfulSkills / totalSkills) * 100);

    return `AI Enablement Assessment Summary:
- Repository: ${result.metadata.repository}
- Duration: ${result.duration}ms
- Skills Executed: ${successfulSkills}/${totalSkills} (${successRate}% success rate)
- Overall Readiness: ${result.assessment?.overall || 'N/A'}/100
- ADR Generated: ${result.adr ? 'Yes' : 'No'}

Skill Results:
${result.skills.map(skill => 
  `- ${skill.name}: ${skill.success ? '✅ Success' : '❌ Failed'} (${skill.duration}ms)`
).join('\n')}`;
  }

  // Copilot SDK integration methods (placeholder for future implementation)
  async registerWithCopilotSDK(): Promise<void> {
    // TODO: Implement Copilot SDK registration
    console.log('Copilot SDK registration not yet implemented');
  }

  async createExportEndpoints(): Promise<void> {
    // TODO: Implement REST API endpoints for external agent integration
    console.log('Export endpoints not yet implemented');
  }

  async setupStateManagement(): Promise<void> {
    // TODO: Implement persistent workflow state management
    console.log('State management not yet implemented');
  }
}

export default AIEnablementOrchestrator;
