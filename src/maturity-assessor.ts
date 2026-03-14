/**
 * Maturity Assessor
 *
 * Implements the 8-layer path to agentic maturity assessment:
 * 1. Foundations - Basic repo clarity and structure
 * 2. Build/Test Determinism - Reproducible development workflows
 * 3. Documentation Spec Maturity - Adequate context for AI/human understanding
 * 4. Repo-Aware AI Guidance - Copilot instructions and conventions
 * 5. Evaluation/Verification Loops - Quality gates and review processes
 * 6. Tool Augmentation - MCP servers, custom agents and skills
 * 7. Memory/Artifact Continuity - ADRs, specs, decision logs, reusable prompts
 * 8. Safe Orchestration - Autonomy with guardrails, verification, measurable outcomes
 */

import { RepositoryClassification } from './repository-classifier';
import { CopilotFeatureAnalysis } from './copilot-feature-scanner';

export interface MaturityAssessment {
  currentLevel: number;
  maxLevel: number;
  levelScores: LevelScore[];
  overallScore: number;
  gaps: MaturityGap[];
  recommendations: MaturityRecommendation[];
  progressionRoadmap: ProgressionStep[];
  confidence: 'high' | 'medium' | 'low';
}

export interface LevelScore {
  level: number;
  name: string;
  score: number;
  maxScore: number;
  achieved: boolean;
  evidence: string[];
  missing: string[];
}

export interface MaturityGap {
  level: number;
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  prerequisites: number[];
}

export interface MaturityRecommendation {
  level: number;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
  timeframe: string;
  expectedImpact: string;
}

export interface ProgressionStep {
  fromLevel: number;
  toLevel: number;
  title: string;
  description: string;
  prerequisites: string[];
  actions: string[];
  estimatedTime: string;
  successCriteria: string[];
}

export class MaturityAssessor {
  async assess(
    classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): Promise<MaturityAssessment> {
    const levelScores = this.calculateLevelScores(
      classification,
      copilotFeatures
    );
    const currentLevel = this.determineCurrentLevel(levelScores);
    const gaps = this.identifyGaps(
      levelScores,
      classification,
      copilotFeatures
    );
    const recommendations = this.generateRecommendations(
      gaps,
      classification,
      copilotFeatures
    );
    const progressionRoadmap = this.createProgressionRoadmap(
      currentLevel,
      gaps,
      recommendations
    );
    const confidence = this.calculateConfidence(
      levelScores,
      classification,
      copilotFeatures
    );

    return {
      currentLevel,
      maxLevel: 8,
      levelScores,
      overallScore: this.calculateOverallScore(levelScores),
      gaps,
      recommendations,
      progressionRoadmap,
      confidence,
    };
  }

  private calculateLevelScores(
    classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): LevelScore[] {
    return [
      this.assessLevel1Foundations(classification, copilotFeatures),
      this.assessLevel2BuildTest(classification, copilotFeatures),
      this.assessLevel3Documentation(classification, copilotFeatures),
      this.assessLevel4RepoAwareAI(classification, copilotFeatures),
      this.assessLevel5EvaluationLoops(classification, copilotFeatures),
      this.assessLevel6ToolAugmentation(classification, copilotFeatures),
      this.assessLevel7MemoryContinuity(classification, copilotFeatures),
      this.assessLevel8SafeOrchestration(classification, copilotFeatures),
    ];
  }

  private assessLevel1Foundations(
    classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): LevelScore {
    const evidence: string[] = [];
    const missing: string[] = [];
    let score = 0;

    // Check for basic repo structure
    if (classification.patterns.length > 0) {
      evidence.push('Repository has identifiable patterns');
      score += 25;
    } else {
      missing.push('No clear architectural patterns detected');
    }

    // Check for basic documentation
    if (copilotFeatures.aiFiles.configs.length > 0) {
      evidence.push('Documentation files present');
      score += 25;
    } else {
      missing.push('Missing basic documentation');
    }

    // Check for configuration files
    if (classification.buildSystem.length > 0) {
      evidence.push('Build system configured');
      score += 25;
    } else {
      missing.push('No build system detected');
    }

    // Check for version control patterns
    if (classification.confidence !== 'low') {
      evidence.push('Repository structure is clear and analyzable');
      score += 25;
    } else {
      missing.push('Repository structure unclear or minimal');
    }

    return {
      level: 1,
      name: 'Foundations',
      score,
      maxScore: 100,
      achieved: score >= 75,
      evidence,
      missing,
    };
  }

  private assessLevel2BuildTest(
    _classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): LevelScore {
    const evidence: string[] = [];
    const missing: string[] = [];
    let score = 0;

    // Check for build systems
    if (_classification.buildSystem.length > 0) {
      evidence.push(`Build systems: ${_classification.buildSystem.join(', ')}`);
      score += 30;
    } else {
      missing.push('No build system detected');
    }

    // Check for CI/CD workflows
    if (copilotFeatures.githubFeatures.aiWorkflows.found) {
      evidence.push('AI workflows present');
      score += 30;
    } else {
      missing.push('No CI/CD workflows detected');
    }

    // Check for testing configurations
    if (
      _classification.framework.some(
        f => f.includes('Test') || f.includes('Jest')
      )
    ) {
      evidence.push('Testing framework detected');
      score += 20;
    } else {
      missing.push('No testing framework detected');
    }

    // Check for reproducible builds
    if (_classification.deployment.length > 0) {
      evidence.push('Deployment configurations found');
      score += 20;
    } else {
      missing.push('No deployment configurations');
    }

    return {
      level: 2,
      name: 'Build/Test Determinism',
      score,
      maxScore: 100,
      achieved: score >= 75,
      evidence,
      missing,
    };
  }

  private assessLevel3Documentation(
    _classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): LevelScore {
    const evidence: string[] = [];
    const missing: string[] = [];
    let score = 0;

    // Check for comprehensive documentation
    if (copilotFeatures.aiFiles.configs.length >= 2) {
      evidence.push('Multiple documentation files found');
      score += 30;
    } else {
      missing.push('Insufficient documentation');
    }

    // Check for API documentation
    if (_classification.patterns.includes('Service Architecture')) {
      evidence.push('Service architecture documented');
      score += 25;
    } else {
      missing.push('API documentation missing');
    }

    // Check for README and setup instructions
    if (
      copilotFeatures.aiFiles.configs.some((f: string) => f.includes('readme'))
    ) {
      evidence.push('README documentation present');
      score += 25;
    } else {
      missing.push('No README or setup documentation');
    }

    // Check for architectural decision records
    if (copilotFeatures.aiFiles.templates.length > 0) {
      evidence.push('Template files present');
      score += 20;
    } else {
      missing.push('No ADRs or decision records');
    }

    return {
      level: 3,
      name: 'Documentation Spec Maturity',
      score,
      maxScore: 100,
      achieved: score >= 75,
      evidence,
      missing,
    };
  }

  private assessLevel4RepoAwareAI(
    _classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): LevelScore {
    const evidence: string[] = [];
    const missing: string[] = [];
    let score = 0;

    // Check for Copilot instructions
    if (copilotFeatures.githubFeatures.copilotInstructions.found) {
      evidence.push('Copilot instructions found');
      score += 40;
    } else {
      missing.push('No Copilot instructions');
    }

    // Check for AI-enhanced PR templates
    if (copilotFeatures.githubFeatures.prTemplates.aiEnhanced) {
      evidence.push('AI-enhanced PR templates');
      score += 30;
    } else {
      missing.push('PR templates not AI-enhanced');
    }

    // Check for AI settings in VS Code
    if (copilotFeatures.vscodeFeatures.aiSettings.found) {
      evidence.push('AI settings configured in VS Code');
      score += 30;
    } else {
      missing.push('No AI settings in VS Code');
    }

    return {
      level: 4,
      name: 'Repo-Aware AI Guidance',
      score,
      maxScore: 100,
      achieved: score >= 75,
      evidence,
      missing,
    };
  }

  private assessLevel5EvaluationLoops(
    _classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): LevelScore {
    const evidence: string[] = [];
    const missing: string[] = [];
    let score = 0;

    // Check for AI workflows
    if (copilotFeatures.githubFeatures.aiWorkflows.found) {
      evidence.push('AI workflows present');
      score += 35;
    } else {
      missing.push('No AI workflows');
    }

    // Check for CODEOWNERS
    if (copilotFeatures.githubFeatures.codeowners.found) {
      evidence.push('CODEOWNERS file present');
      score += 25;
    } else {
      missing.push('No CODEOWNERS file');
    }

    // Check for AI tasks
    if (copilotFeatures.vscodeFeatures.aiTasks.found) {
      evidence.push('AI tasks configured');
      score += 20;
    } else {
      missing.push('No AI tasks');
    }

    // Check for quality gates
    if (copilotFeatures.enterpriseFeatures.advancedSecurity) {
      evidence.push('Advanced security features enabled');
      score += 20;
    } else {
      missing.push('No advanced security features');
    }

    return {
      level: 5,
      name: 'Evaluation/Verification Loops',
      score,
      maxScore: 100,
      achieved: score >= 75,
      evidence,
      missing,
    };
  }

  private assessLevel6ToolAugmentation(
    _classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): LevelScore {
    const evidence: string[] = [];
    const missing: string[] = [];
    let score = 0;

    // Check for MCP servers
    if (copilotFeatures.vscodeFeatures.mcpServers.found) {
      evidence.push(
        `${copilotFeatures.vscodeFeatures.mcpServers.servers.length} MCP servers found`
      );
      score += 50;
    } else {
      missing.push('No MCP servers configured');
    }

    // Check for Copilot skills
    if (copilotFeatures.githubFeatures.copilotSkills.found) {
      evidence.push(
        `${copilotFeatures.githubFeatures.copilotSkills.skills.length} Copilot skills found`
      );
      score += 30;
    } else {
      missing.push('No Copilot skills');
    }

    // Check for AI extensions
    if (copilotFeatures.vscodeFeatures.aiExtensions.found) {
      evidence.push('AI extensions installed');
      score += 20;
    } else {
      missing.push('No AI extensions');
    }

    return {
      level: 6,
      name: 'Tool Augmentation',
      score,
      maxScore: 100,
      achieved: score >= 75,
      evidence,
      missing,
    };
  }

  private assessLevel7MemoryContinuity(
    _classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): LevelScore {
    const evidence: string[] = [];
    const missing: string[] = [];
    let score = 0;

    // Check for memory servers
    if (copilotFeatures.vscodeFeatures.memoryServers.found) {
      evidence.push(
        `${copilotFeatures.vscodeFeatures.memoryServers.servers.length} memory servers found`
      );
      score += 40;
    } else {
      missing.push('No memory servers');
    }

    // Check for ADRs
    if (copilotFeatures.aiFiles.instructions.length > 0) {
      evidence.push('AI instruction files present');
      score += 30;
    } else {
      missing.push('No AI instruction files');
    }

    // Check for prompts
    if (copilotFeatures.aiFiles.prompts.length > 0) {
      evidence.push('AI prompt files present');
      score += 30;
    } else {
      missing.push('No AI prompt files');
    }

    return {
      level: 7,
      name: 'Memory/Artifact Continuity',
      score,
      maxScore: 100,
      achieved: score >= 75,
      evidence,
      missing,
    };
  }

  private assessLevel8SafeOrchestration(
    _classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): LevelScore {
    const evidence: string[] = [];
    const missing: string[] = [];
    let score = 0;

    // Check for enterprise features
    if (copilotFeatures.enterpriseFeatures.copilotBusiness) {
      evidence.push('Copilot Business enabled');
      score += 30;
    } else {
      missing.push('Copilot Business not enabled');
    }

    // Check for team management
    if (copilotFeatures.enterpriseFeatures.teamManagement) {
      evidence.push('Team management features enabled');
      score += 25;
    } else {
      missing.push('No team management features');
    }

    // Check for usage analytics
    if (copilotFeatures.enterpriseFeatures.usageAnalytics) {
      evidence.push('Usage analytics enabled');
      score += 25;
    } else {
      missing.push('No usage analytics');
    }

    // Check for advanced automation
    if (copilotFeatures.currentLevel >= 7) {
      evidence.push('High level of automation achieved');
      score += 20;
    } else {
      missing.push('Insufficient automation level');
    }

    return {
      level: 8,
      name: 'Safe Orchestration',
      score,
      maxScore: 100,
      achieved: score >= 75,
      evidence,
      missing,
    };
  }

  private determineCurrentLevel(levelScores: LevelScore[]): number {
    for (let i = levelScores.length - 1; i >= 0; i--) {
      if (levelScores[i].achieved) {
        return levelScores[i].level;
      }
    }
    return 1;
  }

  private calculateOverallScore(levelScores: LevelScore[]): number {
    const totalScore = levelScores.reduce((sum, level) => sum + level.score, 0);
    const maxScore = levelScores.reduce(
      (sum, level) => sum + level.maxScore,
      0
    );
    return Math.round((totalScore / maxScore) * 100);
  }

  private identifyGaps(
    levelScores: LevelScore[],
    classification: RepositoryClassification,
    _copilotFeatures: CopilotFeatureAnalysis
  ): MaturityGap[] {
    const gaps: MaturityGap[] = [];

    levelScores.forEach(levelScore => {
      if (!levelScore.achieved && levelScore.missing.length > 0) {
        gaps.push({
          level: levelScore.level,
          name: levelScore.name,
          description: `Missing critical components for ${levelScore.name}`,
          impact: this.assessGapImpact(levelScore.level, classification),
          effort: this.assessGapEffort(levelScore.level, classification),
          prerequisites: levelScore.level > 1 ? [levelScore.level - 1] : [],
        });
      }
    });

    return gaps;
  }

  private assessGapImpact(
    level: number,
    _classification: RepositoryClassification
  ): 'high' | 'medium' | 'low' {
    if (level <= 3) return 'high'; // Foundation levels are critical
    if (level <= 5) return 'medium'; // Intermediate levels are important
    return 'low'; // Advanced levels are nice to have
  }

  private assessGapEffort(
    level: number,
    classification: RepositoryClassification
  ): 'high' | 'medium' | 'low' {
    if (classification.complexity === 'enterprise') return 'high';
    if (classification.complexity === 'complex')
      return level <= 4 ? 'high' : 'medium';
    return 'low';
  }

  private generateRecommendations(
    gaps: MaturityGap[],
    classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): MaturityRecommendation[] {
    const recommendations: MaturityRecommendation[] = [];

    gaps.forEach(gap => {
      recommendations.push({
        level: gap.level,
        priority: gap.impact,
        title: `Achieve ${gap.name}`,
        description: gap.description,
        actions: this.generateActionsForLevel(
          gap.level,
          classification,
          copilotFeatures
        ),
        timeframe: this.estimateTimeframe(gap.level, classification),
        expectedImpact: this.estimateImpact(gap.level, classification),
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private generateActionsForLevel(
    level: number,
    _classification: RepositoryClassification,
    _copilotFeatures: CopilotFeatureAnalysis
  ): string[] {
    switch (level) {
      case 1:
        return [
          'Create basic repository structure',
          'Add README documentation',
          'Configure build system',
          'Establish version control practices',
        ];
      case 2:
        return [
          'Set up CI/CD workflows',
          'Configure testing framework',
          'Create reproducible build process',
          'Add deployment automation',
        ];
      case 3:
        return [
          'Create comprehensive documentation',
          'Add API documentation',
          'Create setup guides',
          'Add architectural decision records',
        ];
      case 4:
        return [
          'Create copilot-instructions.md',
          'Enhance PR templates with AI guidance',
          'Configure AI settings in VS Code',
          'Add AI-specific development guidelines',
        ];
      case 5:
        return [
          'Create AI workflows for CI/CD',
          'Add CODEOWNERS file',
          'Configure AI tasks in VS Code',
          'Enable advanced security features',
        ];
      case 6:
        return [
          'Configure MCP servers',
          'Create Copilot skills',
          'Install AI extensions',
          'Set up AI tooling integration',
        ];
      case 7:
        return [
          'Configure memory servers',
          'Create AI instruction files',
          'Add AI prompt templates',
          'Set up context management',
        ];
      case 8:
        return [
          'Enable Copilot Business features',
          'Configure team management',
          'Set up usage analytics',
          'Implement advanced automation',
        ];
      default:
        return [];
    }
  }

  private estimateTimeframe(
    level: number,
    classification: RepositoryClassification
  ): string {
    const baseTime = {
      1: '1-2 weeks',
      2: '2-4 weeks',
      3: '3-6 weeks',
      4: '2-4 weeks',
      5: '4-6 weeks',
      6: '6-8 weeks',
      7: '8-12 weeks',
      8: '12-16 weeks',
    };

    const complexityMultiplier = {
      simple: 1,
      medium: 1.5,
      complex: 2,
      enterprise: 3,
    };

    const multiplier = complexityMultiplier[classification.complexity];
    const weeks =
      parseInt(baseTime[level as keyof typeof baseTime]) * multiplier;

    return `${Math.ceil(weeks)} weeks`;
  }

  private estimateImpact(
    level: number,
    _classification: RepositoryClassification
  ): string {
    const impacts = {
      1: 'Establishes foundation for all AI enablement',
      2: 'Improves development reliability and speed',
      3: 'Enhances knowledge sharing and onboarding',
      4: 'Significantly improves AI assistance quality',
      5: 'Reduces errors and improves code quality',
      6: 'Dramatically increases developer productivity',
      7: 'Enables consistent AI context and memory',
      8: 'Provides autonomous AI capabilities with safety',
    };

    return impacts[level as keyof typeof impacts];
  }

  private createProgressionRoadmap(
    _currentLevel: number,
    gaps: MaturityGap[],
    recommendations: MaturityRecommendation[]
  ): ProgressionStep[] {
    const roadmap: ProgressionStep[] = [];

    // Sort gaps by level
    const sortedGaps = gaps.sort((a, b) => a.level - b.level);

    sortedGaps.forEach(gap => {
      const recommendation = recommendations.find(r => r.level === gap.level);
      if (recommendation) {
        roadmap.push({
          fromLevel: gap.level - 1,
          toLevel: gap.level,
          title: `Progress to ${gap.name}`,
          description: recommendation.description,
          prerequisites: gap.prerequisites.map(p => `Level ${p} achieved`),
          actions: recommendation.actions,
          estimatedTime: recommendation.timeframe,
          successCriteria: [`Level ${gap.level} score >= 75%`],
        });
      }
    });

    return roadmap;
  }

  private calculateConfidence(
    levelScores: LevelScore[],
    classification: RepositoryClassification,
    copilotFeatures: CopilotFeatureAnalysis
  ): 'high' | 'medium' | 'low' {
    const signalCount = [
      classification.confidence === 'high',
      copilotFeatures.confidence === 'high',
      levelScores.filter(l => l.achieved).length >= 3,
      levelScores.every(l => l.evidence.length > 0 || l.missing.length > 0),
    ].filter(Boolean).length;

    if (signalCount >= 3) return 'high';
    if (signalCount >= 2) return 'medium';
    return 'low';
  }
}
