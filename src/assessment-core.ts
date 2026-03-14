/**
 * Assessment Core Logic
 *
 * Core business logic for AI enablement assessment
 */

import { CopilotClient, defineTool } from '@github/copilot-sdk';
import { analyser, FSProvider } from '@specfy/stack-analyser';
import { Octokit } from '@octokit/rest';
import '@specfy/stack-analyser/dist/autoload';
import { DataQualityValidator } from './data-quality-validator';
import { AssessmentErrorHandler } from './error-handler';
import { RepositoryClassifier } from './repository-classifier';
import { CopilotFeatureScanner } from './copilot-feature-scanner';

export interface AssessmentOptions {
  repoPath?: string;
  githubUrl?: string;
  githubToken?: string;
}

export interface TechStackInsights {
  languages: string[];
  technologies: string[];
  infrastructure: string[];
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  error?: string;
}

export interface SecurityAnalysis {
  available: boolean;
  reason?: string;
  features: {
    codeql?: any;
    dependabot?: any;
    secretScanning?: any;
    securityOverview?: any;
  };
}

export interface ArtifactDetection {
  copilotInstructions: boolean;
  adrFiles: string[];
  documentationFiles: string[];
  configFiles: string[];
  testFiles: string[];
  error?: string;
}

export interface RepositoryClassificationResult {
  type: string;
  complexity: string;
  domain: string;
  teamSize: string;
  confidence: 'high' | 'medium' | 'low';
  patterns: string[];
  framework: string[];
  buildSystem: string[];
  deployment: string[];
  error?: string;
}

export interface CopilotFeatureResult {
  githubFeatures: {
    copilotInstructions: { found: boolean; files: string[] };
    copilotSkills: { found: boolean; files: string[]; skills: string[] };
    aiWorkflows: { found: boolean; files: string[]; workflows: string[] };
    aiTemplates: { found: boolean; files: string[]; types: string[] };
    codeowners: { found: boolean };
    prTemplates: { found: boolean; files: string[]; aiEnhanced: boolean };
  };
  vscodeFeatures: {
    aiSettings: { found: boolean; settings: Record<string, any> };
    mcpServers: { found: boolean; servers: any[]; configFiles: string[] };
    memoryServers: { found: boolean; servers: any[]; configFiles: string[] };
    aiExtensions: { found: boolean; extensions: string[] };
    aiTasks: { found: boolean; tasks: string[] };
    aiDebugging: { found: boolean; configurations: string[] };
  };
  enterpriseFeatures: {
    copilotBusiness: boolean;
    advancedSecurity: boolean;
    customModels: boolean;
    enterpriseSettings: boolean;
    teamManagement: boolean;
    usageAnalytics: boolean;
  };
  currentLevel: number;
  maxLevel: number;
  confidence: 'high' | 'medium' | 'low';
  error?: string;
}

// Define tools that Copilot can use for analysis
export const analyzeTechStack = defineTool('analyze_tech_stack', {
  description: 'Analyze the technology stack of a repository',
  parameters: {
    type: 'object',
    properties: {
      repoPath: { type: 'string', description: 'Path to the repository' },
    },
    required: ['repoPath'],
  },
  handler: async (args: { repoPath: string }): Promise<TechStackInsights> => {
    try {
      const result = await analyser({
        provider: new FSProvider({ path: args.repoPath }),
      });

      const json = result.toJson();

      // Extract meaningful insights
      const insights: TechStackInsights = {
        languages: Object.keys(json.languages || {}),
        technologies: json.techs || [],
        infrastructure: (json as unknown as { infra?: string[] }).infra || [],
        confidence: 'high',
        summary: `Detected ${Object.keys(json.languages || {}).length} languages and ${(json.techs || []).length} technologies`,
      };

      return insights;
    } catch (error) {
      return {
        languages: [],
        technologies: [],
        infrastructure: [],
        confidence: 'low',
        summary: 'Analysis failed - basic file detection only',
        error: (error as Error).message,
      };
    }
  },
});

export const analyzeGitHubSecurity = defineTool('analyze_github_security', {
  description: 'Analyze GitHub security features and posture',
  parameters: {
    type: 'object',
    properties: {
      githubUrl: { type: 'string', description: 'GitHub repository URL' },
      githubToken: {
        type: 'string',
        description: 'GitHub personal access token',
      },
    },
    required: ['githubUrl'],
  },
  handler: async (args: {
    githubUrl: string;
    githubToken?: string;
  }): Promise<SecurityAnalysis> => {
    if (!args.githubToken) {
      return {
        available: false,
        reason: 'GitHub token not provided',
        features: {},
      };
    }

    try {
      const octokit = new Octokit({ auth: args.githubToken });
      const [owner, repo] = extractRepoInfo(args.githubUrl);

      // Check security features
      const [codeql, dependabot, secretScanning, securityOverview] =
        await Promise.all([
          getCodeQLStatus(octokit, owner, repo),
          getDependabotStatus(octokit, owner, repo),
          getSecretScanningStatus(octokit, owner, repo),
          getSecurityOverview(octokit, owner, repo),
        ]);

      return {
        available: true,
        features: {
          codeql,
          dependabot,
          secretScanning,
          securityOverview,
        },
      };
    } catch (error) {
      return {
        available: false,
        reason: (error as Error).message,
        features: {},
      };
    }
  },
});

export const detectArtifacts = defineTool('detect_artifacts', {
  description: 'Detect AI-related artifacts and documentation',
  parameters: {
    type: 'object',
    properties: {
      repoPath: { type: 'string', description: 'Path to the repository' },
    },
    required: ['repoPath'],
  },
  handler: async (args: { repoPath: string }): Promise<ArtifactDetection> => {
    const fs = require('fs').promises;
    const path = require('path');

    const artifacts: ArtifactDetection = {
      copilotInstructions: false,
      adrFiles: [],
      documentationFiles: [],
      configFiles: [],
      testFiles: [],
    };

    try {
      const files = await fs.readdir(args.repoPath, { recursive: true });

      for (const file of files as string[]) {
        const filePath = path.join(args.repoPath, file);
        try {
          const stat = await fs.stat(filePath);

          if (stat.isFile()) {
            if (
              file.includes('copilot-instructions') ||
              file.includes('.copilot')
            ) {
              artifacts.copilotInstructions = true;
            }
            if (
              file.endsWith('.md') &&
              (file.includes('adr') || file.includes('decision'))
            ) {
              artifacts.adrFiles.push(file);
            }
            if (
              file.endsWith('.md') &&
              (file.includes('readme') || file.includes('doc'))
            ) {
              artifacts.documentationFiles.push(file);
            }
            if (
              file.endsWith('.json') ||
              file.endsWith('.yml') ||
              file.endsWith('.yaml')
            ) {
              artifacts.configFiles.push(file);
            }
            if (file.includes('test') || file.includes('spec')) {
              artifacts.testFiles.push(file);
            }
          }
        } catch (statError) {
          // Skip files that can't be accessed
          continue;
        }
      }

      return artifacts;
    } catch (error) {
      return {
        ...artifacts,
        error: (error as Error).message,
      };
    }
  },
});

export const classifyRepository = defineTool('classify_repository', {
  description: 'Classify repository type, complexity, domain, and team size',
  parameters: {
    type: 'object',
    properties: {
      repoPath: { type: 'string', description: 'Path to the repository' },
    },
    required: ['repoPath'],
  },
  handler: async (args: {
    repoPath: string;
  }): Promise<RepositoryClassificationResult> => {
    try {
      const classifier = new RepositoryClassifier();
      const classification = await classifier.classify(args.repoPath);

      return {
        type: classification.type,
        complexity: classification.complexity,
        domain: classification.domain,
        teamSize: classification.teamSize,
        confidence: classification.confidence,
        patterns: classification.patterns,
        framework: classification.framework,
        buildSystem: classification.buildSystem,
        deployment: classification.deployment,
      };
    } catch (error) {
      return {
        type: 'unknown',
        complexity: 'unknown',
        domain: 'unknown',
        teamSize: 'unknown',
        confidence: 'low',
        patterns: [],
        framework: [],
        buildSystem: [],
        deployment: [],
        error: (error as Error).message,
      };
    }
  },
});

export const scanCopilotFeatures = defineTool('scan_copilot_features', {
  description: 'Scan GitHub Copilot features and configurations',
  parameters: {
    type: 'object',
    properties: {
      repoPath: { type: 'string', description: 'Path to the repository' },
    },
    required: ['repoPath'],
  },
  handler: async (args: {
    repoPath: string;
  }): Promise<CopilotFeatureResult> => {
    try {
      const scanner = new CopilotFeatureScanner();
      const analysis = await scanner.scan(args.repoPath);

      return {
        githubFeatures: {
          copilotInstructions: {
            found: analysis.githubFeatures.copilotInstructions.found,
            files: analysis.githubFeatures.copilotInstructions.files,
          },
          copilotSkills: {
            found: analysis.githubFeatures.copilotSkills.found,
            files: analysis.githubFeatures.copilotSkills.files,
            skills: analysis.githubFeatures.copilotSkills.skills,
          },
          aiWorkflows: {
            found: analysis.githubFeatures.aiWorkflows.found,
            files: analysis.githubFeatures.aiWorkflows.files,
            workflows: analysis.githubFeatures.aiWorkflows.workflows,
          },
          aiTemplates: {
            found: analysis.githubFeatures.aiTemplates.found,
            files: analysis.githubFeatures.aiTemplates.files,
            types: analysis.githubFeatures.aiTemplates.types,
          },
          codeowners: {
            found: analysis.githubFeatures.codeowners.found,
          },
          prTemplates: {
            found: analysis.githubFeatures.prTemplates.found,
            files: analysis.githubFeatures.prTemplates.files,
            aiEnhanced: analysis.githubFeatures.prTemplates.aiEnhanced,
          },
        },
        vscodeFeatures: {
          aiSettings: {
            found: analysis.vscodeFeatures.aiSettings.found,
            settings: analysis.vscodeFeatures.aiSettings.settings,
          },
          mcpServers: {
            found: analysis.vscodeFeatures.mcpServers.found,
            servers: analysis.vscodeFeatures.mcpServers.servers,
            configFiles: analysis.vscodeFeatures.mcpServers.configFiles,
          },
          memoryServers: {
            found: analysis.vscodeFeatures.memoryServers.found,
            servers: analysis.vscodeFeatures.memoryServers.servers,
            configFiles: analysis.vscodeFeatures.memoryServers.configFiles,
          },
          aiExtensions: {
            found: analysis.vscodeFeatures.aiExtensions.found,
            extensions: analysis.vscodeFeatures.aiExtensions.extensions,
          },
          aiTasks: {
            found: analysis.vscodeFeatures.aiTasks.found,
            tasks: analysis.vscodeFeatures.aiTasks.tasks,
          },
          aiDebugging: {
            found: analysis.vscodeFeatures.aiDebugging.found,
            configurations: analysis.vscodeFeatures.aiDebugging.configurations,
          },
        },
        enterpriseFeatures: analysis.enterpriseFeatures,
        currentLevel: analysis.currentLevel,
        maxLevel: analysis.maxLevel,
        confidence: analysis.confidence,
      };
    } catch (error) {
      return {
        githubFeatures: {
          copilotInstructions: { found: false, files: [] },
          copilotSkills: { found: false, files: [], skills: [] },
          aiWorkflows: { found: false, files: [], workflows: [] },
          aiTemplates: { found: false, files: [], types: [] },
          codeowners: { found: false },
          prTemplates: { found: false, files: [], aiEnhanced: false },
        },
        vscodeFeatures: {
          aiSettings: { found: false, settings: {} },
          mcpServers: { found: false, servers: [], configFiles: [] },
          memoryServers: { found: false, servers: [], configFiles: [] },
          aiExtensions: { found: false, extensions: [] },
          aiTasks: { found: false, tasks: [] },
          aiDebugging: { found: false, configurations: [] },
        },
        enterpriseFeatures: {
          copilotBusiness: false,
          advancedSecurity: false,
          customModels: false,
          enterpriseSettings: false,
          teamManagement: false,
          usageAnalytics: false,
        },
        currentLevel: 1,
        maxLevel: 8,
        confidence: 'low',
        error: (error as Error).message,
      };
    }
  },
});

export class AssessmentEngine {
  private client: CopilotClient;

  constructor() {
    this.client = new CopilotClient();
  }

  async runAssessment(
    repoPath: string,
    githubUrl?: string,
    _githubToken?: string
  ): Promise<{
    analysis: string;
    errors: any[];
    dataQuality: any;
    errorReport: any;
  }> {
    const errors: any[] = [];

    try {
      await this.client.start();

      const session = await this.client.createSession({
        model: 'gpt-4.1',
        tools: [
          analyzeTechStack,
          analyzeGitHubSecurity,
          detectArtifacts,
          classifyRepository,
          scanCopilotFeatures,
        ],
        onPermissionRequest: () =>
          Promise.resolve({ kind: 'approved' as const }),
      });

      // Collect analysis data with error handling
      let techStackData: any = null;
      let securityData: any = null;
      let artifactData: any = null;

      try {
        const techResult = await session.sendAndWait({
          prompt: `Analyze the tech stack of repository: ${repoPath}`,
        });
        techStackData = techResult?.data;
      } catch (error) {
        errors.push(
          AssessmentErrorHandler.handleTechStackError(error as Error, repoPath)
        );
      }

      try {
        if (githubUrl) {
          const securityResult = await session.sendAndWait({
            prompt: `Analyze GitHub security features for: ${githubUrl}`,
          });
          securityData = securityResult?.data;
        }
      } catch (error) {
        errors.push(
          AssessmentErrorHandler.handleSecurityError(error as Error, githubUrl)
        );
      }

      try {
        const artifactResult = await session.sendAndWait({
          prompt: `Detect AI-related artifacts in repository: ${repoPath}`,
        });
        artifactData = artifactResult?.data;
      } catch (error) {
        errors.push(
          AssessmentErrorHandler.handleArtifactError(error as Error, repoPath)
        );
      }

      // Generate data quality report
      const dataQualityReport = DataQualityValidator.generateReport(
        techStackData,
        securityData,
        artifactData
      );

      // Generate error report
      const errorReport = AssessmentErrorHandler.generateReport(errors);

      // Enhanced prompt with data quality and error information
      const enhancedPrompt = `Analyze this repository for AI enablement readiness. 

Repository: ${repoPath}
GitHub URL: ${githubUrl || 'Not provided'}

${DataQualityValidator.formatForADR(dataQualityReport)}

${errorReport.errors.length > 0 ? AssessmentErrorHandler.formatForADR(errorReport) : ''}

Please use the available tools to:
1. Analyze the tech stack 
2. Check GitHub security features (if GitHub URL provided)
3. Detect relevant artifacts
4. Classify repository type, complexity, domain, and team size
5. Scan GitHub Copilot features and configurations

Then provide:
- Repository classification (type, complexity, domain, team size)
- Copilot feature analysis (current level, available features, gaps)
- Readiness scores (0-100) for repo, team, and org dimensions
- Current maturity layer assessment (1-8)
- Evidence-based recommendations
- Risk assessment
- Specific next steps considering data limitations

Focus on concrete detected signals rather than assumptions. Be explicit about confidence levels and data limitations.`;

      const response = await session.sendAndWait({ prompt: enhancedPrompt });

      await this.client.stop();

      return {
        analysis: response?.data.content || '',
        errors,
        dataQuality: dataQualityReport,
        errorReport,
      };
    } catch (error) {
      const assessmentError = AssessmentErrorHandler.handleCopilotError(
        error as Error
      );
      const errorReport = AssessmentErrorHandler.generateReport([
        assessmentError,
      ]);

      return {
        analysis: `# Assessment Error

${AssessmentErrorHandler.formatForADR(errorReport)}

The assessment could not be completed due to the error(s) above. Please address the issues and try again.`,
        errors: [assessmentError],
        dataQuality: null,
        errorReport,
      };
    }
  }

  async generateADR(analysis: string): Promise<string> {
    await this.client.start();

    const session = await this.client.createSession({
      model: 'gpt-4.1',
      onPermissionRequest: () => Promise.resolve({ kind: 'approved' as const }),
    });

    const adrPrompt = `Generate a consultant-quality Architecture Decision Record based on this analysis:

${analysis}

Create an ADR that includes:
- Current state assessment
- Evidence summary
- Readiness scores with confidence levels
- Risk assessment
- Phased implementation recommendations (30/60/90 days)
- Success metrics
- Next steps

Make it professional, actionable, and evidence-based.`;

    const response = await session.sendAndWait({ prompt: adrPrompt });

    await this.client.stop();
    return response?.data.content || '';
  }
}

// Helper functions
function extractRepoInfo(githubUrl: string): [string, string] {
  const match = githubUrl.match(/github\.com[:/](.+?)(\.git)?$/);
  if (!match) throw new Error('Invalid GitHub URL format');
  return [match[1].split('/')[0], match[1].split('/')[1]];
}

async function getCodeQLStatus(octokit: Octokit, owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.codeScanning.listAlertsForRepo({
      owner,
      repo,
      state: 'open',
    });
    return { enabled: true, openAlerts: data.length };
  } catch (error) {
    return { enabled: false, reason: (error as Error).message };
  }
}

async function getDependabotStatus(
  octokit: Octokit,
  owner: string,
  repo: string
) {
  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    return {
      enabled: data.security_and_analysis?.dependabot_security_updates || false,
    };
  } catch (error) {
    return { enabled: false, reason: (error as Error).message };
  }
}

async function getSecretScanningStatus(
  octokit: Octokit,
  owner: string,
  repo: string
) {
  try {
    const { data } = await octokit.rest.secretScanning.listAlertsForRepo({
      owner,
      repo,
      state: 'open',
    });
    return { enabled: true, openAlerts: data.length };
  } catch (error) {
    return { enabled: false, reason: (error as Error).message };
  }
}

async function getSecurityOverview(
  octokit: Octokit,
  owner: string,
  repo: string
) {
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return {
      isPrivate: data.private,
      hasAdvancedSecurity:
        data.security_and_analysis?.advanced_security || false,
      vulnerabilityAlerts:
        data.security_and_analysis?.dependabot_security_updates || false,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
