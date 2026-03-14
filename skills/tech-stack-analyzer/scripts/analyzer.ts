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

      // Extract techs and languages from the nested structure
      let extractedTechs: string[] = [];
      let extractedLanguages: Record<string, number> = {};

      // Look for techs and languages in child nodes
      const extractFromNode = (node: any) => {
        if (node.techs && Array.isArray(node.techs)) {
          extractedTechs = [...extractedTechs, ...node.techs];
        }
        if (node.languages && typeof node.languages === 'object') {
          extractedLanguages = { ...extractedLanguages, ...node.languages };
        }
        if (node.childs && Array.isArray(node.childs)) {
          node.childs.forEach(extractFromNode);
        }
      };

      extractFromNode(json);

      // Create a flattened structure for our use
      const flattenedData = {
        techs: extractedTechs,
        languages: extractedLanguages,
      };

      return {
        detected: flattenedData,
        flat,
        summary: this.summarizeTechStack(flattenedData),
        confidence: this.assessConfidence(flattenedData),
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
    if (!stackData || !stackData.techs) {
      const hasLanguages =
        stackData?.languages && Object.keys(stackData.languages).length > 0;
      if (hasLanguages) {
        const languages = Object.entries(stackData.languages || {})
          .map(([lang, count]) => `${lang} (${count})`)
          .join(', ');
        return `Languages: ${languages}. Technologies: minimal or none detected`;
      }
      return 'No significant tech stack detected';
    }

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

    // More realistic confidence thresholds
    if (techCount >= 5 && langCount >= 1) return 'high';
    if (techCount >= 2 && langCount >= 1) return 'medium';
    if (techCount >= 1 || langCount >= 1) return 'low';
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

      // Framework patterns
      if (
        lower.includes('react') ||
        lower.includes('vue') ||
        lower.includes('angular') ||
        lower.includes('svelte') ||
        lower.includes('next') ||
        lower.includes('nuxt') ||
        lower.includes('express') ||
        lower.includes('koa') ||
        lower.includes('fastify')
      ) {
        categories.frameworks.push(tech);
      }
      // Database patterns
      else if (
        lower.includes('postgres') ||
        lower.includes('mongo') ||
        lower.includes('mysql') ||
        lower.includes('sqlite') ||
        lower.includes('redis') ||
        lower.includes('cassandra') ||
        lower.includes('mongoose') ||
        lower.includes('pg') ||
        lower.includes('prisma')
      ) {
        categories.databases.push(tech);
      }
      // Infrastructure patterns
      else if (
        lower.includes('docker') ||
        lower.includes('k8s') ||
        lower.includes('kubernetes') ||
        lower.includes('terraform') ||
        lower.includes('helm') ||
        lower.includes('aws') ||
        lower.includes('azure') ||
        lower.includes('gcp')
      ) {
        categories.infrastructure.push(tech);
      }
      // Build tools patterns
      else if (
        lower.includes('webpack') ||
        lower.includes('vite') ||
        lower.includes('babel') ||
        lower.includes('rollup') ||
        lower.includes('parcel') ||
        lower.includes('esbuild') ||
        lower.includes('turbopack') ||
        lower.includes('swc')
      ) {
        categories.buildTools.push(tech);
      }
      // Testing patterns
      else if (
        lower.includes('jest') ||
        lower.includes('mocha') ||
        lower.includes('cypress') ||
        lower.includes('vitest') ||
        lower.includes('playwright') ||
        lower.includes('testing-library') ||
        lower.includes('jasmine') ||
        lower.includes('karma') ||
        lower.includes('supertest')
      ) {
        categories.testing.push(tech);
      }
      // Consider npm/nodejs as build tools in this context
      else if (lower.includes('npm') || lower.includes('nodejs')) {
        categories.buildTools.push(tech);
      }
      // Consider eslint/prettier as build tools (dev tools)
      else if (lower.includes('eslint') || lower.includes('prettier')) {
        categories.buildTools.push(tech);
      }
    });

    return categories;
  }
}

export { TechStackAnalyzer, TechStackAnalysis };
export default TechStackAnalyzer;
