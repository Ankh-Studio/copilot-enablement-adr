import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { analyser, FSProvider } from '@specfy/stack-analyser';
import { Octokit } from '@octokit/rest';
import '@specfy/stack-analyser/dist/autoload';

interface AssessmentOptions {
  repoPath?: string;
  githubUrl?: string;
  githubToken?: string;
}

// Define tools that Copilot can use for analysis
const analyzeTechStack = defineTool("analyze_tech_stack", {
  description: "Analyze the technology stack of a repository",
  parameters: {
    type: "object",
    properties: {
      repoPath: { type: "string", description: "Path to the repository" }
    },
    required: ["repoPath"],
  },
  handler: async (args: { repoPath: string }) => {
    try {
      const result = await analyser({
        provider: new FSProvider({ path: args.repoPath }),
      });

      const json = result.toJson();

      // Extract meaningful insights
      const insights = {
        languages: Object.keys(json.languages || {}),
        technologies: json.techs || [],
        infrastructure: (json as unknown as { infra?: string[] }).infra || [],
        confidence: 'high' as const,
        summary: `Detected ${Object.keys(json.languages || {}).length} languages and ${(json.techs || []).length} technologies`
      };

      return insights;
    } catch (error) {
      return {
        languages: [],
        technologies: [],
        infrastructure: [],
        confidence: 'low' as const,
        summary: 'Analysis failed - basic file detection only',
        error: (error as Error).message
      };
    }
  },
});

const analyzeGitHubSecurity = defineTool("analyze_github_security", {
  description: "Analyze GitHub security features and posture",
  parameters: {
    type: "object",
    properties: {
      githubUrl: { type: "string", description: "GitHub repository URL" },
      githubToken: { type: "string", description: "GitHub personal access token" }
    },
    required: ["githubUrl"],
  },
  handler: async (args: { githubUrl: string; githubToken?: string }) => {
    if (!args.githubToken) {
      return {
        available: false,
        reason: "GitHub token not provided",
        features: {}
      };
    }

    try {
      const octokit = new Octokit({ auth: args.githubToken });
      const [owner, repo] = extractRepoInfo(args.githubUrl);

      // Check security features
      const [codeql, dependabot, secretScanning, securityOverview] = await Promise.all([
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
          securityOverview
        }
      };
    } catch (error) {
      return {
        available: false,
        reason: (error as Error).message,
        features: {}
      };
    }
  },
});

const detectArtifacts = defineTool("detect_artifacts", {
  description: "Detect AI-related artifacts and documentation",
  parameters: {
    type: "object",
    properties: {
      repoPath: { type: "string", description: "Path to the repository" }
    },
    required: ["repoPath"],
  },
  handler: async (args: { repoPath: string }) => {
    const fs = require('fs').promises;
    const path = require('path');

    const artifacts = {
      copilotInstructions: false,
      adrFiles: [] as string[],
      documentationFiles: [] as string[],
      configFiles: [] as string[],
      testFiles: [] as string[]
    };

    try {
      const files = await fs.readdir(args.repoPath, { recursive: true });
      
      for (const file of files as string[]) {
        const filePath = path.join(args.repoPath, file);
        try {
          const stat = await fs.stat(filePath);
          
          if (stat.isFile()) {
            if (file.includes('copilot-instructions') || file.includes('.copilot')) {
              artifacts.copilotInstructions = true;
            }
            if (file.endsWith('.md') && (file.includes('adr') || file.includes('decision'))) {
              artifacts.adrFiles.push(file);
            }
            if (file.endsWith('.md') && (file.includes('readme') || file.includes('doc'))) {
              artifacts.documentationFiles.push(file);
            }
            if (file.endsWith('.json') || file.endsWith('.yml') || file.endsWith('.yaml')) {
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
        error: (error as Error).message
      };
    }
  },
});

export default class CopilotPoweredAssessment {
  private repoPath: string;
  private githubUrl?: string;
  private client: CopilotClient;

  constructor(options: AssessmentOptions = {}) {
    this.repoPath = options.repoPath || process.cwd();
    this.githubUrl = options.githubUrl;
    this.client = new CopilotClient();
  }

  async analyze(): Promise<string> {
    await this.client.start();

    const session = await this.client.createSession({
      model: "gpt-4.1",
      tools: [analyzeTechStack, analyzeGitHubSecurity, detectArtifacts],
      onPermissionRequest: () => Promise.resolve({ kind: "approved" as const }),
    });

    // Use Copilot to orchestrate the analysis
    const prompt = `Analyze this repository for AI enablement readiness. 

Repository: ${this.repoPath}
GitHub URL: ${this.githubUrl || 'Not provided'}

Please use the available tools to:
1. Analyze the tech stack 
2. Check GitHub security features (if GitHub URL provided)
3. Detect relevant artifacts

Then provide:
- Readiness scores (0-100) for repo, team, and org dimensions
- Current maturity layer assessment
- Evidence-based recommendations
- Risk assessment

Focus on concrete detected signals rather than assumptions.`;

    const response = await session.sendAndWait({ prompt });
    
    await this.client.stop();
    return response?.data.content || '';
  }

  async generateADR(analysis: string): Promise<string> {
    await this.client.start();

    const session = await this.client.createSession({
      model: "gpt-4.1",
      onPermissionRequest: () => Promise.resolve({ kind: "approved" as const }),
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
      owner, repo, state: 'open',
    });
    return { enabled: true, openAlerts: data.length };
  } catch (error) {
    return { enabled: false, reason: (error as Error).message };
  }
}

async function getDependabotStatus(octokit: Octokit, owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.get({
      owner, repo,
    });
    return {
      enabled: data.security_and_analysis?.dependabot_security_updates || false
    };
  } catch (error) {
    return { enabled: false, reason: (error as Error).message };
  }
}

async function getSecretScanningStatus(octokit: Octokit, owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.secretScanning.listAlertsForRepo({
      owner, repo, state: 'open',
    });
    return { enabled: true, openAlerts: data.length };
  } catch (error) {
    return { enabled: false, reason: (error as Error).message };
  }
}

async function getSecurityOverview(octokit: Octokit, owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return {
      isPrivate: data.private,
      hasAdvancedSecurity: data.security_and_analysis?.advanced_security || false,
      vulnerabilityAlerts: data.security_and_analysis?.dependabot_security_updates || false,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
