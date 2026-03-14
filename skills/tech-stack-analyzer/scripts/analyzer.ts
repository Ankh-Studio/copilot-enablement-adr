import { analyser, FSProvider, flatten } from '@specfy/stack-analyser';
import '@specfy/stack-analyser/dist/autoload';

interface TechStackAnalysis {
  detected: any;
  flat: any;
  summary: string;
  confidence: 'high' | 'medium' | 'low';
}

interface AnalyzerOptions {
  repoPath?: string;
  confidence?: 'high' | 'medium' | 'low';
}

class TechStackAnalyzer {
  private repoPath: string;

  constructor(options: AnalyzerOptions = {}) {
    this.repoPath = options.repoPath || process.cwd();
  }

  async analyze(): Promise<TechStackAnalysis> {
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
        confidence: this.assessConfidence(json),
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

  private summarizeTechStack(stackData: any): string {
    if (!stackData || !stackData.techs) return 'No tech stack detected';

    const languages = Object.entries(stackData.languages || {})
      .map(([lang, count]) => `${lang} (${count})`)
      .join(', ');

    const techs = [...new Set(stackData.techs || [])].slice(0, 10).join(', ');

    return `Languages: ${languages}. Technologies: ${techs}`;
  }

  private assessConfidence(stackData: any): 'high' | 'medium' | 'low' {
    if (!stackData || !stackData.techs) return 'low';
    
    const techCount = stackData.techs?.length || 0;
    const langCount = Object.keys(stackData.languages || {}).length;
    
    if (techCount > 10 && langCount > 2) return 'high';
    if (techCount > 5 && langCount > 1) return 'medium';
    return 'low';
  }

  async getTechnologyCategories(): Promise<Record<string, string[]>> {
    const analysis = await this.analyze();
    if (!analysis.detected) return {};

    const categories: Record<string, string[]> = {
      languages: Object.keys(analysis.detected.languages || {}),
      frameworks: [],
      databases: [],
      infrastructure: [],
      buildTools: [],
      testing: [],
    };

    // Categorize technologies based on common patterns
    const techs = analysis.detected.techs || [];
    techs.forEach((tech: string) => {
      const lower = tech.toLowerCase();
      if (lower.includes('react') || lower.includes('vue') || lower.includes('angular')) {
        categories.frameworks.push(tech);
      } else if (lower.includes('postgres') || lower.includes('mongo') || lower.includes('mysql')) {
        categories.databases.push(tech);
      } else if (lower.includes('docker') || lower.includes('k8s') || lower.includes('terraform')) {
        categories.infrastructure.push(tech);
      } else if (lower.includes('webpack') || lower.includes('vite') || lower.includes('babel')) {
        categories.buildTools.push(tech);
      } else if (lower.includes('jest') || lower.includes('mocha') || lower.includes('cypress')) {
        categories.testing.push(tech);
      }
    });

    return categories;
  }
}

export { TechStackAnalyzer, TechStackAnalysis };
export default TechStackAnalyzer;
