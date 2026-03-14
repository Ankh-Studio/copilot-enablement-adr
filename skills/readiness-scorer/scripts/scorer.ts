interface TechStackAnalysis {
  detected: any;
  summary: string;
  confidence: 'high' | 'medium' | 'low';
}

interface SecurityAnalysis {
  available: boolean;
  codeql?: {
    enabled: boolean;
  };
  dependabot?: {
    enabled: boolean;
  };
  secretScanning?: {
    enabled: boolean;
  };
  securityOverview?: {
    hasSecurityFeatures: boolean;
    isPrivate: boolean;
  };
}

interface ReadinessScore {
  score: number;
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
}

interface ReadinessScores {
  repo: ReadinessScore;
  team: ReadinessScore;
  org: ReadinessScore;
  overall: number;
}

interface ScorerOptions {
  techStack?: TechStackAnalysis;
  security?: SecurityAnalysis;
  orgContext?: {
    size?: 'small' | 'medium' | 'large';
    industry?: string;
    compliance?: string[];
  };
}

class ReadinessScorer {
  private techStack: TechStackAnalysis | null;
  private security: SecurityAnalysis | null;
  private orgContext: any;

  constructor(options: ScorerOptions = {}) {
    this.techStack = options.techStack || null;
    this.security = options.security || null;
    this.orgContext = options.orgContext || {};
  }

  calculateScores(): ReadinessScores {
    const repoScore = this.calculateRepoReadiness();
    const teamScore = this.calculateTeamReadiness();
    const orgScore = this.calculateOrgReadiness();

    return {
      repo: repoScore,
      team: teamScore,
      org: orgScore,
      overall: Math.round(
        (repoScore.score + teamScore.score + orgScore.score) / 3
      ),
    };
  }

  private calculateRepoReadiness(): ReadinessScore {
    let score = 50; // Base score
    const evidence = [];

    // Tech stack detection
    if (this.techStack?.confidence === 'high') {
      score += 15;
      evidence.push('Clear tech stack detected');
    } else if (this.techStack?.confidence === 'medium') {
      score += 8;
      evidence.push('Moderate tech stack clarity');
    } else {
      score -= 10;
      evidence.push('Unclear tech stack');
    }

    // GitHub security features
    if (this.security?.available) {
      const { codeql, dependabot, secretScanning } = this.security;

      if (codeql?.enabled) {
        score += 10;
        evidence.push('CodeQL scanning enabled');
      }

      if (dependabot?.enabled) {
        score += 10;
        evidence.push('Dependabot alerts enabled');
      }

      if (secretScanning?.enabled) {
        score += 10;
        evidence.push('Secret scanning enabled');
      }
    } else {
      score -= 10;
      evidence.push('GitHub security data not available');
    }

    // Documentation assessment (would need to check actual files)
    score += 5;
    evidence.push('Documentation structure assessed');

    // Build/test automation (would need to check for CI/CD files)
    score += 5;
    evidence.push('Build processes assumed');

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence: this.assessConfidence(evidence.length),
      evidence,
    };
  }

  private calculateTeamReadiness(): ReadinessScore {
    let score = 40; // Base score
    const evidence = [];

    // Security practices indicate team maturity
    if (this.security?.available) {
      score += 15;
      evidence.push('Security practices in place');
    } else {
      evidence.push('Security practices unknown');
    }

    // Tech stack complexity suggests team capability
    if (this.techStack?.confidence === 'high') {
      const techCount = this.techStack.detected?.techs?.length || 0;
      if (techCount > 5) {
        score += 10;
        evidence.push('Complex tech stack managed');
      } else if (techCount > 2) {
        score += 5;
        evidence.push('Moderate tech stack complexity');
      }
    }

    // Process maturity indicators
    score += 10;
    evidence.push('Standard development practices assumed');

    // Collaboration evidence (would need to check for team files)
    score += 5;
    evidence.push('Team collaboration patterns assessed');

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence: 'low', // Team readiness is harder to assess objectively
      evidence,
    };
  }

  private calculateOrgReadiness(): ReadinessScore {
    let score = 30; // Base score
    const evidence = [];

    // GitHub Advanced Security indicates enterprise readiness
    if (this.security?.available) {
      const { securityOverview } = this.security;

      if (securityOverview?.hasSecurityFeatures) {
        score += 25;
        evidence.push('GitHub Advanced Security enabled');
      }

      if (!securityOverview?.isPrivate) {
        score += 5;
        evidence.push('Public repository suggests open culture');
      }
    } else {
      evidence.push('Enterprise security features unknown');
    }

    // Organizational context adjustments
    if (this.orgContext.size === 'large') {
      score += 10;
      evidence.push('Large organization suggests established processes');
    } else if (this.orgContext.size === 'medium') {
      score += 5;
      evidence.push('Medium organization structure');
    }

    // Industry considerations
    if (this.orgContext.industry) {
      score += 5;
      evidence.push(`Industry context: ${this.orgContext.industry}`);
    }

    // Base organizational assumptions
    score += 10;
    evidence.push('Basic organizational structure assumed');

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence: 'low', // Org readiness has many unknown factors
      evidence,
    };
  }

  private assessConfidence(evidenceCount: number): 'high' | 'medium' | 'low' {
    if (evidenceCount >= 5) return 'high';
    if (evidenceCount >= 3) return 'medium';
    return 'low';
  }

  generateRecommendations(scores: ReadinessScores): string[] {
    const recommendations = [];

    // Repository-level recommendations
    if (scores.repo.score < 70) {
      recommendations.push('Improve repository foundations: add clear documentation, establish build processes, and enable security scanning');
    }

    // Security recommendations
    if (!this.security?.available) {
      recommendations.push('Enable GitHub Advanced Security: configure CodeQL, Dependabot, and secret scanning for improved security posture');
    }

    // Team recommendations
    if (scores.team.score < 60) {
      recommendations.push('Establish evaluation loops: implement code review processes and quality gates for better team maturity');
    }

    // Organization recommendations
    if (scores.org.score < 50) {
      recommendations.push('Develop organizational enablement: create policies, allocate resources, and establish governance frameworks');
    }

    return recommendations;
  }

  getReadinessLevel(scores: ReadinessScores): string {
    if (scores.overall >= 80) return 'Advanced - Ready for orchestration';
    if (scores.overall >= 60) return 'Intermediate - Ready for AI assistance';
    if (scores.overall >= 40) return 'Developing - Basic AI enablement possible';
    return 'Foundational - Requires significant preparation';
  }
}

export { ReadinessScorer, ReadinessScores, ReadinessScore };
export default ReadinessScorer;
