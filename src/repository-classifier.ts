/**
 * Repository Classification Engine
 *
 * Analyzes repository structure and patterns to classify:
 * - Repository type (Frontend/Backend/Full-stack/Monorepo)
 * - Complexity (Simple/Medium/Complex/Enterprise)
 * - Domain (E-commerce/Infrastructure/Documentation/etc.)
 * - Team size estimation
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface RepositoryClassification {
  type: RepositoryType;
  complexity: RepositoryComplexity;
  domain: RepositoryDomain;
  teamSize: TeamSizeEstimate;
  confidence: 'high' | 'medium' | 'low';
  patterns: string[];
  framework: string[];
  buildSystem: string[];
  deployment: string[];
}

export type RepositoryType =
  | 'frontend'
  | 'backend'
  | 'full-stack'
  | 'monorepo'
  | 'infrastructure'
  | 'documentation'
  | 'mobile'
  | 'desktop';

export type RepositoryComplexity =
  | 'simple'
  | 'medium'
  | 'complex'
  | 'enterprise';

export type RepositoryDomain =
  | 'e-commerce'
  | 'infrastructure'
  | 'documentation'
  | 'saas'
  | 'enterprise'
  | 'startup'
  | 'open-source'
  | 'internal-tools'
  | 'data-platform'
  | 'api-platform';

export type TeamSizeEstimate =
  | '1-3'
  | '4-8'
  | '8-12'
  | '12-20'
  | '20-50'
  | '50+';

export class RepositoryClassifier {
  async classify(repoPath: string): Promise<RepositoryClassification> {
    const analysis = await this.analyzeRepository(repoPath);

    return {
      type: this.classifyType(analysis),
      complexity: this.classifyComplexity(analysis),
      domain: this.classifyDomain(analysis),
      teamSize: this.estimateTeamSize(analysis),
      confidence: this.calculateConfidence(analysis),
      patterns: analysis.patterns,
      framework: analysis.frameworks,
      buildSystem: analysis.buildSystems,
      deployment: analysis.deployment,
    };
  }

  private async analyzeRepository(
    repoPath: string
  ): Promise<RepositoryAnalysis> {
    const fileStructure = await this.getFileStructure(repoPath);
    const packageFiles = await this.findPackageFiles(repoPath);
    const configFiles = await this.findConfigFiles(repoPath);

    return {
      fileStructure,
      packageFiles,
      configFiles,
      frameworks: this.detectFrameworks(packageFiles, fileStructure),
      buildSystems: this.detectBuildSystems(configFiles, packageFiles),
      deployment: this.detectDeployment(configFiles, fileStructure),
      patterns: this.detectPatterns(fileStructure, configFiles),
    };
  }

  private classifyType(analysis: RepositoryAnalysis): RepositoryType {
    const { frameworks, fileStructure } = analysis;

    // Frontend indicators
    const frontendIndicators = [
      'react',
      'vue',
      'angular',
      'svelte',
      'next',
      'nuxt',
      'webpack',
      'vite',
      'parcel',
      'rollup',
    ];

    // Backend indicators
    const backendIndicators = [
      'spring',
      'express',
      'fastify',
      'koa',
      'django',
      'flask',
      'rails',
      'laravel',
      'nest',
      'aspnet',
      'golang',
    ];

    // Mobile indicators
    const mobileIndicators = [
      'react-native',
      'flutter',
      'swift',
      'kotlin',
      'cordova',
      'ionic',
    ];

    const hasFrontend = frameworks.some(f =>
      frontendIndicators.includes(f.toLowerCase())
    );
    const hasBackend = frameworks.some(f =>
      backendIndicators.includes(f.toLowerCase())
    );
    const hasMobile = frameworks.some(f =>
      mobileIndicators.includes(f.toLowerCase())
    );

    // Check for monorepo structure
    const hasPackages = fileStructure.some(f => f.includes('packages/'));
    const hasApps = fileStructure.some(f => f.includes('apps/'));
    const hasWorkspaces = analysis.packageFiles.some(p =>
      p.includes('workspace')
    );

    if (hasPackages || hasApps || hasWorkspaces) {
      return 'monorepo';
    }

    if (hasFrontend && hasBackend) {
      return 'full-stack';
    }

    if (hasMobile) {
      return 'mobile';
    }

    if (hasFrontend) {
      return 'frontend';
    }

    if (hasBackend) {
      return 'backend';
    }

    // Default classifications based on patterns
    if (analysis.patterns.includes('infrastructure')) {
      return 'infrastructure';
    }

    if (analysis.patterns.includes('documentation')) {
      return 'documentation';
    }

    return 'backend'; // Default fallback
  }

  private classifyComplexity(
    analysis: RepositoryAnalysis
  ): RepositoryComplexity {
    const { fileStructure, frameworks, buildSystems, deployment } = analysis;

    let complexityScore = 0;

    // File structure complexity
    const depthLevels = fileStructure
      .map(f => f.split('/').length)
      .sort((a, b) => b - a)[0];
    if (depthLevels > 5) complexityScore += 2;
    else if (depthLevels > 3) complexityScore += 1;

    // Framework complexity
    if (frameworks.length > 3) complexityScore += 2;
    else if (frameworks.length > 1) complexityScore += 1;

    // Build system complexity
    if (buildSystems.length > 2) complexityScore += 2;
    else if (buildSystems.length > 1) complexityScore += 1;

    // Deployment complexity
    if (deployment.length > 2) complexityScore += 2;
    else if (deployment.length > 0) complexityScore += 1;

    // Enterprise patterns
    const enterprisePatterns = [
      'microservices',
      'kubernetes',
      'enterprise',
      'monolith',
    ];
    if (
      analysis.patterns.some(p => enterprisePatterns.includes(p.toLowerCase()))
    ) {
      complexityScore += 2;
    }

    if (complexityScore >= 6) return 'enterprise';
    if (complexityScore >= 4) return 'complex';
    if (complexityScore >= 2) return 'medium';
    return 'simple';
  }

  private classifyDomain(analysis: RepositoryAnalysis): RepositoryDomain {
    const { frameworks, patterns, fileStructure } = analysis;

    // E-commerce indicators
    const ecommerceIndicators = [
      'shopify',
      'magento',
      'woocommerce',
      'bigcommerce',
      'stripe',
      'payment',
      'checkout',
      'cart',
      'product',
      'order',
    ];

    // SaaS indicators
    const saasIndicators = [
      'subscription',
      'billing',
      'tenant',
      'multi-tenant',
      'auth',
      'user-management',
      'dashboard',
      'analytics',
    ];

    // Infrastructure indicators
    const infraIndicators = [
      'terraform',
      'kubernetes',
      'docker',
      'ansible',
      'puppet',
      'ci-cd',
      'devops',
      'infrastructure',
      'deployment',
    ];

    const allText = [...frameworks, ...patterns, ...fileStructure]
      .join(' ')
      .toLowerCase();

    if (ecommerceIndicators.some(indicator => allText.includes(indicator))) {
      return 'e-commerce';
    }

    if (saasIndicators.some(indicator => allText.includes(indicator))) {
      return 'saas';
    }

    if (infraIndicators.some(indicator => allText.includes(indicator))) {
      return 'infrastructure';
    }

    if (allText.includes('api') || allText.includes('service')) {
      return 'api-platform';
    }

    if (allText.includes('data') || allText.includes('analytics')) {
      return 'data-platform';
    }

    if (patterns.includes('enterprise')) {
      return 'enterprise';
    }

    if (patterns.includes('open-source')) {
      return 'open-source';
    }

    return 'internal-tools'; // Default fallback
  }

  private estimateTeamSize(analysis: RepositoryAnalysis): TeamSizeEstimate {
    const { fileStructure, frameworks, buildSystems, deployment } = analysis;

    let teamSizeScore = 0;

    // Project size indicators
    const fileCount = fileStructure.length;
    if (fileCount > 1000) teamSizeScore += 3;
    else if (fileCount > 500) teamSizeScore += 2;
    else if (fileCount > 100) teamSizeScore += 1;

    // Technology stack complexity
    if (frameworks.length > 3) teamSizeScore += 2;
    else if (frameworks.length > 1) teamSizeScore += 1;

    // Build and deployment complexity
    if (buildSystems.length > 1) teamSizeScore += 1;
    if (deployment.length > 1) teamSizeScore += 1;

    // Enterprise patterns suggest larger teams
    if (analysis.patterns.includes('enterprise')) teamSizeScore += 2;

    if (teamSizeScore >= 6) return '50+';
    if (teamSizeScore >= 5) return '20-50';
    if (teamSizeScore >= 4) return '12-20';
    if (teamSizeScore >= 3) return '8-12';
    if (teamSizeScore >= 2) return '4-8';
    return '1-3';
  }

  private calculateConfidence(
    analysis: RepositoryAnalysis
  ): 'high' | 'medium' | 'low' {
    const signalCount =
      analysis.frameworks.length +
      analysis.buildSystems.length +
      analysis.deployment.length +
      analysis.patterns.length;

    if (signalCount >= 8) return 'high';
    if (signalCount >= 4) return 'medium';
    return 'low';
  }

  private async getFileStructure(repoPath: string): Promise<string[]> {
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

          // Skip node_modules and other large directories
          if (
            entry.name === 'node_modules' ||
            entry.name === '.git' ||
            entry.name === 'dist'
          ) {
            continue;
          }

          if (entry.isDirectory()) {
            if (files.length < 1000) {
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

    await scanDirectory(repoPath);
    return files;
  }

  private async findPackageFiles(repoPath: string): Promise<string[]> {
    const packageFiles: string[] = [];

    try {
      const files = await fs.readdir(repoPath);

      for (const file of files) {
        if (
          file === 'package.json' ||
          file === 'pom.xml' ||
          file === 'build.gradle' ||
          file === 'Cargo.toml' ||
          file === 'requirements.txt' ||
          file === 'Gemfile'
        ) {
          packageFiles.push(file);
        }
      }
    } catch (error) {
      // Directory read error
    }

    return packageFiles;
  }

  private async findConfigFiles(repoPath: string): Promise<string[]> {
    const configFiles: string[] = [];
    const configDirs = ['.github', '.vscode', 'config', 'configs'];

    for (const configDir of configDirs) {
      try {
        const configPath = path.join(repoPath, configDir);
        const stat = await fs.stat(configPath);

        if (stat.isDirectory()) {
          const files = await this.getFileStructure(configPath);
          configFiles.push(...files.map(f => path.join(configDir, f)));
        }
      } catch (error) {
        // Config directory doesn't exist
      }
    }

    return configFiles;
  }

  private detectFrameworks(
    packageFiles: string[],
    fileStructure: string[]
  ): string[] {
    const frameworks: string[] = [];

    // Detect from package files
    for (const packageFile of packageFiles) {
      if (packageFile === 'package.json') {
        // Could parse package.json for dependencies
        frameworks.push('Node.js');
      } else if (packageFile === 'pom.xml') {
        frameworks.push('Java/Maven');
      } else if (packageFile === 'build.gradle') {
        frameworks.push('Java/Gradle');
      }
    }

    // Detect from file extensions in structure
    const sourceExtensions = fileStructure.map(f => path.extname(f));
    if (sourceExtensions.includes('.ts')) frameworks.push('TypeScript');
    if (sourceExtensions.includes('.jsx') || sourceExtensions.includes('.tsx'))
      frameworks.push('React');
    if (sourceExtensions.includes('.java')) frameworks.push('Java');
    if (sourceExtensions.includes('.py')) frameworks.push('Python');
    if (sourceExtensions.includes('.go')) frameworks.push('Go');

    return Array.from(new Set(frameworks)); // Remove duplicates
  }

  private detectBuildSystems(
    configFiles: string[],
    packageFiles: string[]
  ): string[] {
    const buildSystems: string[] = [];

    // Detect from config files
    for (const configFile of configFiles) {
      if (configFile.includes('webpack')) buildSystems.push('Webpack');
      if (configFile.includes('vite')) buildSystems.push('Vite');
      if (configFile.includes('rollup')) buildSystems.push('Rollup');
      if (configFile.includes('parcel')) buildSystems.push('Parcel');
      if (configFile.includes('babel')) buildSystems.push('Babel');
      if (configFile.includes('jest')) buildSystems.push('Jest');
      if (configFile.includes('github/workflows'))
        buildSystems.push('GitHub Actions');
      if (configFile.includes('docker')) buildSystems.push('Docker');
      if (configFile.includes('kubernetes')) buildSystems.push('Kubernetes');
    }

    // Detect from package files
    if (packageFiles.includes('package.json')) buildSystems.push('npm');
    if (packageFiles.includes('pom.xml')) buildSystems.push('Maven');
    if (packageFiles.includes('build.gradle')) buildSystems.push('Gradle');

    return Array.from(new Set(buildSystems));
  }

  private detectDeployment(
    configFiles: string[],
    fileStructure: string[]
  ): string[] {
    const deployment: string[] = [];

    for (const configFile of configFiles) {
      if (configFile.includes('docker')) deployment.push('Docker');
      if (configFile.includes('kubernetes') || configFile.includes('k8s'))
        deployment.push('Kubernetes');
      if (configFile.includes('terraform')) deployment.push('Terraform');
      if (configFile.includes('ansible')) deployment.push('Ansible');
      if (configFile.includes('helm')) deployment.push('Helm');
    }

    for (const file of fileStructure) {
      if (file.includes('deploy') || file.includes('release')) {
        deployment.push('Custom Deployment');
      }
    }

    return Array.from(new Set(deployment));
  }

  private detectPatterns(
    fileStructure: string[],
    configFiles: string[]
  ): string[] {
    const patterns: string[] = [];

    // Detect architectural patterns
    if (
      fileStructure.some(
        f => f.includes('src/main/java') || f.includes('src/main/resources')
      )
    ) {
      patterns.push('Java Enterprise');
    }

    if (
      fileStructure.some(f => f.includes('components') || f.includes('pages'))
    ) {
      patterns.push('Component Architecture');
    }

    if (fileStructure.some(f => f.includes('services') || f.includes('api'))) {
      patterns.push('Service Architecture');
    }

    if (
      fileStructure.some(
        f => f.includes('microservices') || f.includes('services/')
      )
    ) {
      patterns.push('Microservices');
    }

    if (
      configFiles.some(f => f.includes('kubernetes') || f.includes('docker'))
    ) {
      patterns.push('Containerized');
    }

    if (configFiles.some(f => f.includes('github/workflows'))) {
      patterns.push('CI/CD');
    }

    return Array.from(new Set(patterns));
  }
}

interface RepositoryAnalysis {
  fileStructure: string[];
  packageFiles: string[];
  configFiles: string[];
  frameworks: string[];
  buildSystems: string[];
  deployment: string[];
  patterns: string[];
}
