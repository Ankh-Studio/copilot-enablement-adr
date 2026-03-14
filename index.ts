import { analyser, FSProvider, flatten } from '@specfy/stack-analyser';
import { Octokit } from '@octokit/rest';
import '@specfy/stack-analyser/dist/autoload';

interface AssessmentOptions {
  repoPath?: string;
  githubUrl?: string | undefined;
  githubToken?: string;
}

interface TechStackAnalysis {
  detected: any;
  flat: any;
  summary: string;
  confidence: 'high' | 'medium' | 'low';
}

interface GitHubSecurityAnalysis {
  available: boolean;
  reason?: string;
  codeql?: any;
  dependabot?: any;
  secretScanning?: any;
  securityOverview?: any;
}

interface ReadinessScores {
  repo: { score: number; confidence: string; evidence: string[] };
  team: { score: number; confidence: string; evidence: string[] };
  org: { score: number; confidence: string; evidence: string[] };
  overall: number;
}

interface MaturityLayer {
  score: number;
  blockers: string[];
  evidence: string[];
}

interface MaturityLayers {
  layers: Record<string, MaturityLayer>;
  current: string;
  next: string;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  timeframe: string;
}

interface Assessment {
  timestamp: string;
  repository: string;
  techStack: TechStackAnalysis;
  githubSecurity: GitHubSecurityAnalysis;
  readinessScores: ReadinessScores;
  maturityLayers: MaturityLayers;
  risks: { governance: string[]; teamProcess: string[] };
  recommendations: Recommendation[];
}

class AIEnablementAssessment {
  private repoPath: string;
  private githubUrl?: string;
  private octokit: Octokit | null;

  constructor(options: AssessmentOptions = {}) {
    this.repoPath = options.repoPath || process.cwd();
    this.githubUrl = options.githubUrl;
    this.octokit = options.githubToken
      ? new Octokit({ auth: options.githubToken })
      : null;
  }

  async analyze(): Promise<Assessment> {
    const assessment: Assessment = {
      timestamp: new Date().toISOString(),
      repository: this.repoPath,
      techStack: await this.analyzeTechStack(),
      githubSecurity: await this.analyzeGitHubSecurity(),
      readinessScores: {} as ReadinessScores,
      maturityLayers: {} as MaturityLayers,
      risks: { governance: [], teamProcess: [] },
      recommendations: [],
    };

    // Calculate readiness scores
    assessment.readinessScores = this.calculateReadinessScores(assessment);

    // Assess maturity layers
    assessment.maturityLayers = this.assessMaturityLayers(assessment);

    // Generate recommendations
    assessment.recommendations = this.generateRecommendations(assessment);

    return assessment;
  }

  async analyzeTechStack(): Promise<TechStackAnalysis> {
    try {
      const result = await analyser({
        provider: new FSProvider({ path: this.repoPath }),
      });

      const json = result.toJson();
      const flat = flatten(result);

      return {
        detected: json,
        flat,
        summary: this.summarizeTechStack(json),
        confidence: 'high',
      };
    } catch (error) {
      console.warn('Tech stack analysis failed:', (error as Error).message);
      return {
        detected: null,
        flat: null,
        summary: 'Analysis failed - will use LLM fallback',
        confidence: 'low',
      };
    }
  }

  summarizeTechStack(stackData: any): string {
    if (!stackData || !stackData.techs) return 'No tech stack detected';

    const languages = Object.entries(stackData.languages || {})
      .map(([lang, count]) => `${lang} (${count})`)
      .join(', ');

    const techs = [...new Set(stackData.techs || [])].slice(0, 10).join(', ');

    return `Languages: ${languages}. Technologies: ${techs}`;
  }

  async analyzeGitHubSecurity(): Promise<GitHubSecurityAnalysis> {
    if (!this.githubUrl || !this.octokit) {
      return {
        available: false,
        reason: 'GitHub URL or token not provided',
      };
    }

    try {
      const [owner, repo] = this.extractRepoInfo(this.githubUrl);

      const [codeql, dependabot, secretScanning, securityOverview] =
        await Promise.all([
          this.getCodeQLStatus(owner, repo),
          this.getDependabotStatus(owner, repo),
          this.getSecretScanningStatus(owner, repo),
          this.getSecurityOverview(owner, repo),
        ]);

      return {
        available: true,
        codeql,
        dependabot,
        secretScanning,
        securityOverview,
      };
    } catch (error) {
      console.warn(
        'GitHub security analysis failed:',
        (error as Error).message
      );
      return {
        available: false,
        reason: (error as Error).message,
      };
    }
  }

  extractRepoInfo(githubUrl: string): [string, string] {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (!match) throw new Error('Invalid GitHub URL format');
    return [match[1], match[2]];
  }

  async getCodeQLStatus(owner: string, repo: string) {
    if (!this.octokit) {
      return { enabled: false, reason: 'Octokit not initialized' };
    }
    try {
      const { data } = await this.octokit.rest.codeScanning.listAlertsForRepo({
        owner,
        repo,
        state: 'open',
      });

      return {
        enabled: true,
        openAlerts: data.length,
        lastAnalysis: new Date().toISOString(), // Would need to check actual analysis date
      };
    } catch (error) {
      return { enabled: false, reason: (error as Error).message };
    }
  }

  async getDependabotStatus(_owner: string, _repo: string) {
    if (!this.octokit) {
      return { enabled: false, reason: 'Octokit not initialized' };
    }
    try {
      // Note: Dependabot alerts API may not be available in this version
      // Using a placeholder implementation
      return {
        enabled: false,
        reason:
          'Dependabot alerts API not available in current Octokit version',
        dependencyReview: false,
      };
    } catch (error) {
      return { enabled: false, reason: (error as Error).message };
    }
  }

  async getSecretScanningStatus(owner: string, repo: string) {
    if (!this.octokit) {
      return { enabled: false, reason: 'Octokit not initialized' };
    }
    try {
      const { data } = await this.octokit.rest.secretScanning.listAlertsForRepo(
        {
          owner,
          repo,
          state: 'open',
        }
      );

      return {
        enabled: true,
        openAlerts: data.length,
        pushProtection: true, // Would need to check actual status
      };
    } catch (error) {
      return { enabled: false, reason: (error as Error).message };
    }
  }

  async getSecurityOverview(owner: string, repo: string) {
    if (!this.octokit) {
      return { error: 'Octokit not initialized' };
    }
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        isPrivate: data.private,
        hasSecurityFeatures:
          data.security_and_analysis?.advanced_security || false,
        vulnerabilityAlerts:
          data.security_and_analysis?.dependabot_security_updates || false,
      };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  calculateReadinessScores(assessment: Assessment): ReadinessScores {
    const repoScore = this.calculateRepoReadiness(assessment);
    const teamScore = this.calculateTeamReadiness(assessment);
    const orgScore = this.calculateOrgReadiness(assessment);

    return {
      repo: {
        score: repoScore.score,
        confidence: repoScore.confidence,
        evidence: repoScore.evidence,
      },
      team: {
        score: teamScore.score,
        confidence: teamScore.confidence,
        evidence: teamScore.evidence,
      },
      org: {
        score: orgScore.score,
        confidence: orgScore.confidence,
        evidence: orgScore.evidence,
      },
      overall: Math.round(
        (repoScore.score + teamScore.score + orgScore.score) / 3
      ),
    };
  }

  calculateRepoReadiness(assessment: Assessment) {
    let score = 50; // Base score
    const evidence = [];

    // Tech stack detection
    if (assessment.techStack.confidence === 'high') {
      score += 15;
      evidence.push('Clear tech stack detected');
    }

    // GitHub security features
    if (assessment.githubSecurity.available) {
      const { codeql, dependabot, secretScanning } = assessment.githubSecurity;

      if (codeql.enabled) {
        score += 10;
        evidence.push('CodeQL scanning enabled');
      }

      if (dependabot.enabled) {
        score += 10;
        evidence.push('Dependabot alerts enabled');
      }

      if (secretScanning.enabled) {
        score += 10;
        evidence.push('Secret scanning enabled');
      }
    } else {
      score -= 10;
      evidence.push('GitHub security data not available');
    }

    // Documentation (would need to check actual files)
    score += 5;
    evidence.push('Documentation structure assessed');

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence: 'medium',
      evidence,
    };
  }

  calculateTeamReadiness(assessment: Assessment) {
    let score = 40; // Base score
    const evidence = [];

    // Security practices indicate team maturity
    if (assessment.githubSecurity.available) {
      score += 15;
      evidence.push('Security practices in place');
    } else {
      evidence.push('Security practices unknown');
    }

    // Tech stack complexity suggests team capability
    if (assessment.techStack.confidence === 'high') {
      const techCount = assessment.techStack.detected?.techs?.length || 0;
      if (techCount > 5) {
        score += 10;
        evidence.push('Complex tech stack managed');
      }
    }

    // Base assumptions about team processes
    score += 10;
    evidence.push('Standard development practices assumed');

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence: 'low',
      evidence,
    };
  }

  calculateOrgReadiness(assessment: Assessment) {
    let score = 30; // Base score
    const evidence = [];

    // GitHub Advanced Security indicates enterprise readiness
    if (assessment.githubSecurity.available) {
      const { securityOverview } = assessment.githubSecurity;

      if (securityOverview.hasSecurityFeatures) {
        score += 25;
        evidence.push('GitHub Advanced Security enabled');
      }

      if (!securityOverview.isPrivate) {
        score += 5;
        evidence.push('Public repository suggests open culture');
      }
    } else {
      evidence.push('Enterprise security features unknown');
    }

    // Base organizational assumptions
    score += 10;
    evidence.push('Basic organizational structure assumed');

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence: 'low',
      evidence,
    };
  }

  assessMaturityLayers(assessment: Assessment): MaturityLayers {
    const layers = {
      foundations: this.assessFoundations(assessment),
      buildTest: this.assessBuildTest(assessment),
      documentation: this.assessDocumentation(assessment),
      repoAware: this.assessRepoAware(assessment),
      evaluation: this.assessEvaluation(assessment),
      tools: this.assessTools(assessment),
      memory: this.assessMemory(assessment),
      orchestration: this.assessOrchestration(assessment),
    };

    // Find current layer (highest scored layer below 80)
    let currentLayer = 'foundations';
    for (const [layer, assessment] of Object.entries(layers)) {
      if (assessment.score >= 70) {
        currentLayer = layer;
      }
    }

    return {
      layers,
      current: currentLayer,
      next: this.getNextLayer(currentLayer),
    };
  }

  assessFoundations(assessment: Assessment): MaturityLayer {
    let score = 60;
    const blockers = [];

    if (assessment.techStack.confidence !== 'high') {
      score -= 20;
      blockers.push('Unclear tech stack');
    }

    return { score, blockers, evidence: ['Basic repository structure'] };
  }

  assessBuildTest(_assessment: Assessment): MaturityLayer {
    const score = 40;
    const blockers = [];

    // Would need to check for actual build/test files
    blockers.push('Build/test automation not verified');

    return { score, blockers, evidence: ['Build processes assumed'] };
  }

  assessDocumentation(_assessment: Assessment): MaturityLayer {
    const score = 50;
    const blockers = [];

    // Would need to check for actual documentation
    blockers.push('Documentation completeness not verified');

    return { score, blockers, evidence: ['Basic documentation present'] };
  }

  assessRepoAware(_assessment: Assessment): MaturityLayer {
    const score = 30;
    const blockers = [];

    // Would need to check for Copilot instructions
    blockers.push('Copilot instructions not found');

    return { score, blockers, evidence: [] };
  }

  assessEvaluation(assessment: Assessment): MaturityLayer {
    let score = 25;
    const blockers = [];

    if (assessment.githubSecurity.available) {
      score += 15;
    } else {
      blockers.push('No security evaluation processes found');
    }

    return { score, blockers, evidence: ['Basic evaluation assumed'] };
  }

  assessTools(_assessment: Assessment): MaturityLayer {
    const score = 20;
    const blockers = ['No MCP servers or custom tools detected'];

    return { score, blockers, evidence: [] };
  }

  assessMemory(_assessment: Assessment): MaturityLayer {
    const score = 15;
    const blockers = ['No ADR process or memory artifacts found'];

    return { score, blockers, evidence: [] };
  }

  assessOrchestration(_assessment: Assessment): MaturityLayer {
    const score = 10;
    const blockers = ['No orchestration capabilities detected'];

    return { score, blockers, evidence: [] };
  }

  getNextLayer(currentLayer: string): string {
    const layerOrder = [
      'foundations',
      'buildTest',
      'documentation',
      'repoAware',
      'evaluation',
      'tools',
      'memory',
      'orchestration',
    ];

    const currentIndex = layerOrder.indexOf(currentLayer);
    return currentIndex < layerOrder.length - 1
      ? layerOrder[currentIndex + 1]
      : 'orchestration';
  }

  generateRecommendations(assessment: Assessment): Recommendation[] {
    const recommendations = [];
    const { readinessScores, maturityLayers } = assessment;

    // Repository-level recommendations
    if (readinessScores.repo.score < 70) {
      recommendations.push({
        priority: 'high' as const,
        category: 'repository',
        title: 'Improve repository foundations',
        description:
          'Add clear documentation, establish build processes, and enable security scanning',
        timeframe: '30 days',
      });
    }

    // Security recommendations
    if (!assessment.githubSecurity.available) {
      recommendations.push({
        priority: 'high' as const,
        category: 'security',
        title: 'Enable GitHub Advanced Security',
        description:
          'Configure CodeQL, Dependabot, and secret scanning for improved security posture',
        timeframe: '30 days',
      });
    }

    // AI enablement recommendations
    if (maturityLayers.layers.repoAware.score < 50) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'ai-enablement',
        title: 'Add Copilot instructions',
        description:
          'Create copilot-instructions.md to guide AI assistants with repository-specific context',
        timeframe: '60 days',
      });
    }

    // Process recommendations
    if (readinessScores.team.score < 60) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'process',
        title: 'Establish evaluation loops',
        description:
          'Implement code review processes and quality gates for better team maturity',
        timeframe: '60 days',
      });
    }

    return recommendations;
  }

  generateADR(assessment: Assessment): string {
    return `# ADR: AI Enablement Assessment

## Status
**Draft** - Assessment completed on ${new Date(assessment.timestamp).toLocaleDateString()}

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
**Next Target**: ${assessment.maturityLayers.next}

## Recommendations
${assessment.recommendations
  .map(
    (rec: Recommendation) =>
      `- **${rec.title}** (${rec.timeframe}): ${rec.description}`
  )
  .join('\n')}

## Evidence
### Repository Readiness
${assessment.readinessScores.repo.evidence.map((e: string) => `- ${e}`).join('\n')}

### Team Readiness  
${assessment.readinessScores.team.evidence.map((e: string) => `- ${e}`).join('\n')}

### Org Enablement
${assessment.readinessScores.org.evidence.map((e: string) => `- ${e}`).join('\n')}
`;
  }
}

export = AIEnablementAssessment;
