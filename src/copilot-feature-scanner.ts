/**
 * Copilot Feature Scanner
 *
 * Comprehensive scanner for GitHub Copilot features including:
 * - GitHub folder analysis (.github/)
 * - VS Code configuration analysis (.vscode/)
 * - Enterprise Copilot features
 * - MCP servers and memory servers
 * - AI-related files and configurations
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface CopilotFeatureAnalysis {
  githubFeatures: GitHubFeatureAnalysis;
  vscodeFeatures: VSCodeFeatureAnalysis;
  enterpriseFeatures: EnterpriseFeatureAnalysis;
  aiFiles: AIFeatureFiles;
  currentLevel: number;
  maxLevel: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface GitHubFeatureAnalysis {
  copilotInstructions: {
    found: boolean;
    files: string[];
    content?: string;
  };
  copilotSkills: {
    found: boolean;
    files: string[];
    skills: string[];
  };
  aiWorkflows: {
    found: boolean;
    files: string[];
    workflows: string[];
  };
  aiTemplates: {
    found: boolean;
    files: string[];
    types: string[];
  };
  codeowners: {
    found: boolean;
    content?: string;
  };
  prTemplates: {
    found: boolean;
    files: string[];
    aiEnhanced: boolean;
  };
}

export interface VSCodeFeatureAnalysis {
  aiSettings: {
    found: boolean;
    settings: Record<string, any>;
  };
  mcpServers: {
    found: boolean;
    servers: MCPServer[];
    configFiles: string[];
  };
  memoryServers: {
    found: boolean;
    servers: MemoryServer[];
    configFiles: string[];
  };
  aiExtensions: {
    found: boolean;
    extensions: string[];
  };
  aiTasks: {
    found: boolean;
    tasks: string[];
  };
  aiDebugging: {
    found: boolean;
    configurations: string[];
  };
}

export interface EnterpriseFeatureAnalysis {
  copilotBusiness: boolean;
  advancedSecurity: boolean;
  customModels: boolean;
  enterpriseSettings: boolean;
  teamManagement: boolean;
  usageAnalytics: boolean;
}

export interface AIFeatureFiles {
  instructions: string[];
  skills: string[];
  prompts: string[];
  configs: string[];
  workflows: string[];
  templates: string[];
}

export interface MCPServer {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MemoryServer {
  name: string;
  type: string;
  endpoint?: string;
  config?: Record<string, any>;
}

export class CopilotFeatureScanner {
  async scan(repoPath: string): Promise<CopilotFeatureAnalysis> {
    const githubFeatures = await this.scanGitHubFolder(repoPath);
    const vscodeFeatures = await this.scanVSCodeFolder(repoPath);
    const enterpriseFeatures = await this.scanEnterpriseFeatures(repoPath);
    const aiFiles = await this.scanAIFeatureFiles(repoPath);

    const currentLevel = this.calculateCurrentLevel(
      githubFeatures,
      vscodeFeatures,
      enterpriseFeatures
    );
    const confidence = this.calculateConfidence(
      githubFeatures,
      vscodeFeatures,
      enterpriseFeatures
    );

    return {
      githubFeatures,
      vscodeFeatures,
      enterpriseFeatures,
      aiFiles,
      currentLevel,
      maxLevel: 8,
      confidence,
    };
  }

  private async scanGitHubFolder(
    repoPath: string
  ): Promise<GitHubFeatureAnalysis> {
    const githubPath = path.join(repoPath, '.github');

    try {
      await fs.access(githubPath);
    } catch (error) {
      // No .github folder
      return {
        copilotInstructions: { found: false, files: [] },
        copilotSkills: { found: false, files: [], skills: [] },
        aiWorkflows: { found: false, files: [], workflows: [] },
        aiTemplates: { found: false, files: [], types: [] },
        codeowners: { found: false },
        prTemplates: { found: false, files: [], aiEnhanced: false },
      };
    }

    const files = await this.getFileStructure(githubPath);

    return {
      copilotInstructions: await this.scanCopilotInstructions(
        githubPath,
        files
      ),
      copilotSkills: await this.scanCopilotSkills(githubPath, files),
      aiWorkflows: await this.scanAIWorkflows(githubPath, files),
      aiTemplates: await this.scanAITemplates(githubPath, files),
      codeowners: await this.scanCodeowners(githubPath, files),
      prTemplates: await this.scanPRTemplates(githubPath, files),
    };
  }

  private async scanVSCodeFolder(
    repoPath: string
  ): Promise<VSCodeFeatureAnalysis> {
    const vscodePath = path.join(repoPath, '.vscode');

    try {
      await fs.access(vscodePath);
    } catch (error) {
      // No .vscode folder
      return {
        aiSettings: { found: false, settings: {} },
        mcpServers: { found: false, servers: [], configFiles: [] },
        memoryServers: { found: false, servers: [], configFiles: [] },
        aiExtensions: { found: false, extensions: [] },
        aiTasks: { found: false, tasks: [] },
        aiDebugging: { found: false, configurations: [] },
      };
    }

    const files = await this.getFileStructure(vscodePath);

    return {
      aiSettings: await this.scanAISettings(vscodePath, files),
      mcpServers: await this.scanMCPServers(vscodePath, files),
      memoryServers: await this.scanMemoryServers(vscodePath, files),
      aiExtensions: await this.scanAIExtensions(vscodePath, files),
      aiTasks: await this.scanAITasks(vscodePath, files),
      aiDebugging: await this.scanAIDebugging(vscodePath, files),
    };
  }

  private async scanEnterpriseFeatures(
    repoPath: string
  ): Promise<EnterpriseFeatureAnalysis> {
    // This would typically require API access to GitHub Enterprise
    // For now, we'll infer from configuration files and patterns
    const files = await this.getFileStructure(repoPath);

    return {
      copilotBusiness: this.hasCopilotBusiness(files),
      advancedSecurity: this.hasAdvancedSecurity(files),
      customModels: this.hasCustomModels(files),
      enterpriseSettings: this.hasEnterpriseSettings(files),
      teamManagement: this.hasTeamManagement(files),
      usageAnalytics: this.hasUsageAnalytics(files),
    };
  }

  private async scanAIFeatureFiles(repoPath: string): Promise<AIFeatureFiles> {
    const files = await this.getFileStructure(repoPath);

    return {
      instructions: files.filter(
        f =>
          f.includes('copilot-instructions') ||
          f.includes('.copilot') ||
          f.includes('ai-instructions')
      ),
      skills: files.filter(
        f => f.includes('skill') || f.includes('.copilot/skills')
      ),
      prompts: files.filter(
        f => f.includes('prompt') || f.includes('ai-prompt')
      ),
      configs: files.filter(
        f => f.includes('ai-config') || f.includes('copilot-config')
      ),
      workflows: files.filter(f => f.includes('workflow') && f.includes('ai')),
      templates: files.filter(f => f.includes('template') && f.includes('ai')),
    };
  }

  private async scanCopilotInstructions(
    githubPath: string,
    files: string[]
  ): Promise<{ found: boolean; files: string[]; content?: string }> {
    const instructionFiles = files.filter(
      f => f.includes('copilot-instructions') || f === 'copilot-instructions.md'
    );

    if (instructionFiles.length === 0) {
      return { found: false, files: [] };
    }

    let content: string | undefined;
    try {
      const mainFile = path.join(githubPath, instructionFiles[0]);
      content = await fs.readFile(mainFile, 'utf-8');
    } catch (error) {
      // Could not read content
    }

    return {
      found: true,
      files: instructionFiles,
      content,
    };
  }

  private async scanCopilotSkills(
    githubPath: string,
    files: string[]
  ): Promise<{ found: boolean; files: string[]; skills: string[] }> {
    const skillFiles = files.filter(
      f => f.includes('.copilot/skills') || f.includes('skills')
    );

    const skills: string[] = [];
    for (const skillFile of skillFiles) {
      try {
        const skillPath = path.join(githubPath, skillFile);
        const content = await fs.readFile(skillPath, 'utf-8');
        // Extract skill names from content
        const skillMatches = content.match(/skill:\s*(\w+)/gi);
        if (skillMatches) {
          skills.push(...skillMatches.map(m => m.replace(/skill:\s*/i, '')));
        }
      } catch (error) {
        // Could not read skill file
      }
    }

    return {
      found: skillFiles.length > 0,
      files: skillFiles,
      skills: Array.from(new Set(skills)), // Remove duplicates
    };
  }

  private async scanAIWorkflows(
    githubPath: string,
    files: string[]
  ): Promise<{ found: boolean; files: string[]; workflows: string[] }> {
    const workflowFiles = files.filter(
      f =>
        f.includes('workflows') && (f.includes('ai') || f.includes('copilot'))
    );

    const workflows: string[] = [];
    for (const workflowFile of workflowFiles) {
      try {
        const workflowPath = path.join(githubPath, workflowFile);
        const content = await fs.readFile(workflowPath, 'utf-8');
        // Extract workflow names
        const nameMatches = content.match(/name:\s*['"]([^'"]+)['"]/gi);
        if (nameMatches) {
          workflows.push(
            ...nameMatches.map(m => m.replace(/name:\s*['"]|['"]/gi, ''))
          );
        }
      } catch (error) {
        // Could not read workflow file
      }
    }

    return {
      found: workflowFiles.length > 0,
      files: workflowFiles,
      workflows: Array.from(new Set(workflows)),
    };
  }

  private async scanAITemplates(
    _githubPath: string,
    files: string[]
  ): Promise<{ found: boolean; files: string[]; types: string[] }> {
    const templateFiles = files.filter(
      f =>
        (f.includes('ISSUE_TEMPLATE') || f.includes('PULL_REQUEST_TEMPLATE')) &&
        (f.includes('ai') || f.includes('copilot'))
    );

    const types: string[] = [];
    for (const templateFile of templateFiles) {
      if (templateFile.includes('ISSUE_TEMPLATE')) {
        types.push('issue');
      }
      if (templateFile.includes('PULL_REQUEST_TEMPLATE')) {
        types.push('pr');
      }
    }

    return {
      found: templateFiles.length > 0,
      files: templateFiles,
      types: Array.from(new Set(types)),
    };
  }

  private async scanCodeowners(
    githubPath: string,
    files: string[]
  ): Promise<{ found: boolean; content?: string }> {
    const codeownersFile = files.find(f => f === 'CODEOWNERS');

    if (!codeownersFile) {
      return { found: false };
    }

    let content: string | undefined;
    try {
      const codeownersPath = path.join(githubPath, codeownersFile);
      content = await fs.readFile(codeownersPath, 'utf-8');
    } catch (error) {
      // Could not read CODEOWNERS
    }

    return { found: true, content };
  }

  private async scanPRTemplates(
    githubPath: string,
    files: string[]
  ): Promise<{ found: boolean; files: string[]; aiEnhanced: boolean }> {
    const prTemplateFiles = files.filter(
      f => f.includes('PULL_REQUEST_TEMPLATE') || f.includes('pr_template')
    );

    let aiEnhanced = false;
    for (const prTemplateFile of prTemplateFiles) {
      try {
        const templatePath = path.join(githubPath, prTemplateFile);
        const content = await fs.readFile(templatePath, 'utf-8');
        if (
          content.includes('ai') ||
          content.includes('copilot') ||
          content.includes('AI')
        ) {
          aiEnhanced = true;
        }
      } catch (error) {
        // Could not read template
      }
    }

    return {
      found: prTemplateFiles.length > 0,
      files: prTemplateFiles,
      aiEnhanced,
    };
  }

  private async scanAISettings(
    vscodePath: string,
    files: string[]
  ): Promise<{ found: boolean; settings: Record<string, any> }> {
    const settingsFile = files.find(f => f === 'settings.json');

    if (!settingsFile) {
      return { found: false, settings: {} };
    }

    let settings: Record<string, any> = {};
    try {
      const settingsPath = path.join(vscodePath, settingsFile);
      const content = await fs.readFile(settingsPath, 'utf-8');
      settings = JSON.parse(content);
    } catch (error) {
      // Could not parse settings
    }

    // Filter for AI-related settings
    const aiSettings: Record<string, any> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (
        key.includes('copilot') ||
        key.includes('ai') ||
        key.includes('github')
      ) {
        aiSettings[key] = value;
      }
    }

    return {
      found: Object.keys(aiSettings).length > 0,
      settings: aiSettings,
    };
  }

  private async scanMCPServers(
    vscodePath: string,
    files: string[]
  ): Promise<{ found: boolean; servers: MCPServer[]; configFiles: string[] }> {
    const mcpConfigFiles = files.filter(
      f => f.includes('mcp') || f.includes('mcp-servers')
    );

    const servers: MCPServer[] = [];
    for (const configFile of mcpConfigFiles) {
      try {
        const configPath = path.join(vscodePath, configFile);
        const content = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(content);

        if (config.servers) {
          servers.push(...config.servers);
        }
      } catch (error) {
        // Could not parse MCP config
      }
    }

    return {
      found: servers.length > 0,
      servers,
      configFiles: mcpConfigFiles,
    };
  }

  private async scanMemoryServers(
    vscodePath: string,
    files: string[]
  ): Promise<{
    found: boolean;
    servers: MemoryServer[];
    configFiles: string[];
  }> {
    const memoryConfigFiles = files.filter(
      f => f.includes('memory') || f.includes('context')
    );

    const servers: MemoryServer[] = [];
    for (const configFile of memoryConfigFiles) {
      try {
        const configPath = path.join(vscodePath, configFile);
        const content = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(content);

        if (config.memoryServers || config.servers) {
          const serverList = config.memoryServers || config.servers;
          servers.push(
            ...serverList.map((s: any) => ({
              name: s.name || 'unknown',
              type: s.type || 'memory',
              endpoint: s.endpoint,
              config: s.config,
            }))
          );
        }
      } catch (error) {
        // Could not parse memory config
      }
    }

    return {
      found: servers.length > 0,
      servers,
      configFiles: memoryConfigFiles,
    };
  }

  private async scanAIExtensions(
    vscodePath: string,
    files: string[]
  ): Promise<{ found: boolean; extensions: string[] }> {
    const extensionsFile = files.find(f => f === 'extensions.json');

    if (!extensionsFile) {
      return { found: false, extensions: [] };
    }

    let extensions: string[] = [];
    try {
      const extensionsPath = path.join(vscodePath, extensionsFile);
      const content = await fs.readFile(extensionsPath, 'utf-8');
      const config = JSON.parse(content);

      if (config.recommendations) {
        extensions = config.recommendations.filter(
          (ext: string) =>
            ext.includes('copilot') ||
            ext.includes('ai') ||
            ext.includes('github')
        );
      }
    } catch (error) {
      // Could not parse extensions
    }

    return {
      found: extensions.length > 0,
      extensions,
    };
  }

  private async scanAITasks(
    vscodePath: string,
    files: string[]
  ): Promise<{ found: boolean; tasks: string[] }> {
    const tasksFile = files.find(f => f === 'tasks.json');

    if (!tasksFile) {
      return { found: false, tasks: [] };
    }

    let tasks: string[] = [];
    try {
      const tasksPath = path.join(vscodePath, tasksFile);
      const content = await fs.readFile(tasksPath, 'utf-8');
      const config = JSON.parse(content);

      if (config.tasks) {
        tasks = config.tasks
          .filter(
            (task: any) =>
              task.label.includes('ai') ||
              task.label.includes('copilot') ||
              task.command.includes('ai')
          )
          .map((task: any) => task.label);
      }
    } catch (error) {
      // Could not parse tasks
    }

    return {
      found: tasks.length > 0,
      tasks,
    };
  }

  private async scanAIDebugging(
    vscodePath: string,
    files: string[]
  ): Promise<{ found: boolean; configurations: string[] }> {
    const launchFile = files.find(f => f === 'launch.json');

    if (!launchFile) {
      return { found: false, configurations: [] };
    }

    let configurations: string[] = [];
    try {
      const launchPath = path.join(vscodePath, launchFile);
      const content = await fs.readFile(launchPath, 'utf-8');
      const config = JSON.parse(content);

      if (config.configurations) {
        configurations = config.configurations
          .filter(
            (cfg: any) =>
              cfg.name.includes('ai') ||
              cfg.name.includes('copilot') ||
              cfg.type.includes('ai')
          )
          .map((cfg: any) => cfg.name);
      }
    } catch (error) {
      // Could not parse launch config
    }

    return {
      found: configurations.length > 0,
      configurations,
    };
  }

  private hasCopilotBusiness(files: string[]): boolean {
    return files.some(
      f => f.includes('copilot-business') || f.includes('enterprise-copilot')
    );
  }

  private hasAdvancedSecurity(files: string[]): boolean {
    return files.some(
      f =>
        f.includes('codeql') ||
        f.includes('security') ||
        f.includes('dependabot')
    );
  }

  private hasCustomModels(files: string[]): boolean {
    return files.some(
      f => f.includes('custom-model') || f.includes('fine-tune')
    );
  }

  private hasEnterpriseSettings(files: string[]): boolean {
    return files.some(
      f => f.includes('enterprise') || f.includes('org-settings')
    );
  }

  private hasTeamManagement(files: string[]): boolean {
    return files.some(f => f.includes('team') || f.includes('organization'));
  }

  private hasUsageAnalytics(files: string[]): boolean {
    return files.some(
      f =>
        f.includes('analytics') || f.includes('usage') || f.includes('metrics')
    );
  }

  private calculateCurrentLevel(
    githubFeatures: GitHubFeatureAnalysis,
    vscodeFeatures: VSCodeFeatureAnalysis,
    enterpriseFeatures: EnterpriseFeatureAnalysis
  ): number {
    let level = 1; // Base level

    // Level 2: Build/Test Determinism
    if (githubFeatures.aiWorkflows.found || vscodeFeatures.aiTasks.found) {
      level = Math.max(level, 2);
    }

    // Level 3: Documentation Spec Maturity
    if (githubFeatures.copilotInstructions.found) {
      level = Math.max(level, 3);
    }

    // Level 4: Repo-Aware AI Guidance
    if (
      githubFeatures.copilotInstructions.found &&
      githubFeatures.prTemplates.aiEnhanced
    ) {
      level = Math.max(level, 4);
    }

    // Level 5: Evaluation/Verification Loops
    if (githubFeatures.aiWorkflows.found && githubFeatures.codeowners.found) {
      level = Math.max(level, 5);
    }

    // Level 6: Tool Augmentation
    if (vscodeFeatures.mcpServers.found || vscodeFeatures.memoryServers.found) {
      level = Math.max(level, 6);
    }

    // Level 7: Memory/Artifact Continuity
    if (
      vscodeFeatures.memoryServers.found &&
      githubFeatures.copilotSkills.found
    ) {
      level = Math.max(level, 7);
    }

    // Level 8: Safe Orchestration
    if (
      enterpriseFeatures.copilotBusiness &&
      vscodeFeatures.mcpServers.found &&
      githubFeatures.aiWorkflows.found
    ) {
      level = Math.max(level, 8);
    }

    return level;
  }

  private calculateConfidence(
    githubFeatures: GitHubFeatureAnalysis,
    vscodeFeatures: VSCodeFeatureAnalysis,
    enterpriseFeatures: EnterpriseFeatureAnalysis
  ): 'high' | 'medium' | 'low' {
    const signalCount = [
      githubFeatures.copilotInstructions.found,
      githubFeatures.copilotSkills.found,
      githubFeatures.aiWorkflows.found,
      vscodeFeatures.mcpServers.found,
      vscodeFeatures.memoryServers.found,
      vscodeFeatures.aiExtensions.found,
      enterpriseFeatures.copilotBusiness,
      enterpriseFeatures.advancedSecurity,
    ].filter(Boolean).length;

    if (signalCount >= 5) return 'high';
    if (signalCount >= 3) return 'medium';
    return 'low';
  }

  private async getFileStructure(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    async function scanDirectory(
      dir: string,
      relativePath: string = ''
    ): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativeFilePath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            if (files.length < 200) {
              // Limit to prevent performance issues
              await scanDirectory(fullPath, relativeFilePath);
            }
          } else {
            files.push(relativeFilePath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    await scanDirectory(dirPath);
    return files;
  }
}
