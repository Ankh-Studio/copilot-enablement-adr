import { Octokit } from '@octokit/rest';

interface SecurityAnalysis {
  available: boolean;
  reason?: string;
  hasSecurityFeatures?: boolean;
  codeql?: CodeQLAnalysis;
  dependabot?: DependabotAnalysis;
  secretScanning?: SecretScanningAnalysis;
  securityOverview?: SecurityOverview;
}

interface CodeQLAnalysis {
  enabled: boolean;
  openAlerts: number;
  lastAnalysis: string;
  reason?: string;
}

interface DependabotAnalysis {
  enabled: boolean;
  openAlerts: number;
  dependencyReview: boolean;
  reason?: string;
}

interface SecretScanningAnalysis {
  enabled: boolean;
  openAlerts: number;
  pushProtection: boolean;
  reason?: string;
}

interface SecurityOverview {
  isPrivate: boolean;
  hasSecurityFeatures: boolean;
  vulnerabilityAlerts: boolean;
  error?: string;
}

interface ScannerOptions {
  githubUrl: string;
  githubToken: string;
}

class SecurityScanner {
  private githubUrl: string;
  private octokit: Octokit;

  constructor(options: ScannerOptions) {
    this.githubUrl = options.githubUrl;
    this.octokit = new Octokit({ auth: options.githubToken });
  }

  async analyze(): Promise<SecurityAnalysis> {
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
        hasSecurityFeatures: !!codeql.enabled || !!dependabot.enabled || !!secretScanning.enabled,
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

  private extractRepoInfo(githubUrl: string): [string, string] {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (!match) throw new Error('Invalid GitHub URL format');
    return [match[1], match[2]];
  }

  private async getCodeQLStatus(owner: string, repo: string): Promise<CodeQLAnalysis> {
    try {
      const { data } = await this.octokit.rest.codeScanning.listAlertsForRepo({
        owner,
        repo,
        state: 'open',
      });

      return {
        enabled: true,
        openAlerts: data.length,
        lastAnalysis: new Date().toISOString(),
      };
    } catch (error) {
      return { 
        enabled: false, 
        reason: (error as Error).message,
        openAlerts: 0,
        lastAnalysis: ''
      };
    }
  }

  private async getDependabotStatus(_owner: string, _repo: string): Promise<DependabotAnalysis> {
    try {
      // Note: Dependabot alerts API may not be available in this version
      // Using a placeholder implementation
      return {
        enabled: false,
        reason:
          'Dependabot alerts API not available in current Octokit version',
        dependencyReview: false,
        openAlerts: 0
      };
    } catch (error) {
      return { 
        enabled: false, 
        reason: (error as Error).message,
        openAlerts: 0,
        dependencyReview: false
      };
    }
  }

  private async getSecretScanningStatus(owner: string, repo: string): Promise<SecretScanningAnalysis> {
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
        pushProtection: true,
      };
    } catch (error) {
      return { 
        enabled: false, 
        reason: (error as Error).message,
        openAlerts: 0,
        pushProtection: false
      };
    }
  }

  private async getSecurityOverview(owner: string, repo: string): Promise<SecurityOverview> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        isPrivate: data.private,
        hasSecurityFeatures: !!(data.security_and_analysis?.advanced_security),
        vulnerabilityAlerts: !!(data.security_and_analysis?.dependabot_security_updates),
      };
    } catch (error) {
      return { 
        error: (error as Error).message,
        isPrivate: false,
        hasSecurityFeatures: false,
        vulnerabilityAlerts: false
      };
    }
  }

  async getSecurityPosture(): Promise<string> {
    const analysis = await this.analyze();
    
    if (!analysis.available) {
      return 'Security analysis unavailable - insufficient permissions or repository not found';
    }

    const enabledFeatures = [];
    const disabledFeatures = [];

    if (analysis.codeql?.enabled) enabledFeatures.push('CodeQL');
    else disabledFeatures.push('CodeQL');

    if (analysis.dependabot?.enabled) enabledFeatures.push('Dependabot');
    else disabledFeatures.push('Dependabot');

    if (analysis.secretScanning?.enabled) enabledFeatures.push('Secret Scanning');
    else disabledFeatures.push('Secret Scanning');

    if (analysis.securityOverview?.hasSecurityFeatures) enabledFeatures.push('Advanced Security');
    else disabledFeatures.push('Advanced Security');

    const score = (enabledFeatures.length / 4) * 100;
    
    return `Security Posture: ${score}/100. Enabled: ${enabledFeatures.join(', ')}. Missing: ${disabledFeatures.join(', ')}`;
  }
}

export { SecurityScanner, SecurityAnalysis };
export default SecurityScanner;
