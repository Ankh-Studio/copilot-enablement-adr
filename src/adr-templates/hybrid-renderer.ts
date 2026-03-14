/**
 * Hybrid Template Renderer
 *
 * Demonstrates how to support both custom and Handlebars rendering
 * Choose the right approach for your use case
 */

export interface RenderEngine {
  name: string;
  render(template: string, context: any): string;
  compile?(template: string): (context: any) => string;
}

/**
 * Our current lightweight renderer
 */
export class LightweightRenderer implements RenderEngine {
  name = 'lightweight';

  render(template: string, context: any): string {
    let result = template;

    // Simple variable substitution
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(context, path.trim());
      return value !== undefined ? String(value) : match;
    });

    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

/**
 * Handlebars renderer (if you need advanced features)
 */
export class HandlebarsRenderer implements RenderEngine {
  name = 'handlebars';
  private handlebars: any;
  private compiled = new Map<string, Function>();

  constructor() {
    try {
      this.handlebars = require('handlebars');
    } catch (error) {
      throw new Error(
        'Handlebars not installed. Install with: npm install handlebars @types/handlebars'
      );
    }
  }

  render(template: string, context: any): string {
    if (!this.compiled.has(template)) {
      this.compiled.set(template, this.handlebars.compile(template));
    }

    const compiled = this.compiled.get(template)!;
    return compiled(context);
  }

  compile(template: string): (context: any) => string {
    return this.handlebars.compile(template);
  }
}

/**
 * Factory to choose the right renderer
 */
export class RendererFactory {
  private static engines: Map<string, RenderEngine> = new Map([
    ['lightweight', new LightweightRenderer()],
    // ['handlebars', new HandlebarsRenderer()], // Uncomment when needed
  ]);

  static getRenderer(
    type: 'lightweight' | 'handlebars' = 'lightweight'
  ): RenderEngine {
    const renderer = this.engines.get(type);
    if (!renderer) {
      throw new Error(
        `Renderer '${type}' not available. Available: ${Array.from(this.engines.keys()).join(', ')}`
      );
    }
    return renderer;
  }

  static registerRenderer(name: string, renderer: RenderEngine): void {
    this.engines.set(name, renderer);
  }

  static listRenderers(): string[] {
    return Array.from(this.engines.keys());
  }
}

/**
 * Performance comparison
 */
export function compareRenderers(
  template: string,
  context: any,
  iterations = 1000
): void {
  console.log('🏁 Template Engine Performance Comparison');
  console.log('='.repeat(50));

  const engines = RendererFactory.listRenderers();

  engines.forEach(engineType => {
    const renderer = RendererFactory.getRenderer(engineType as any);

    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      renderer.render(template, context);
    }
    const duration = Date.now() - start;

    console.log(
      `${engineType}: ${duration}ms (${(duration / iterations).toFixed(3)}ms per render)`
    );
  });
}

/**
 * Usage examples
 */
export function demonstrateRenderers(): void {
  const template =
    'Repository: {{assessment.repository}} has {{assessment.readinessScores.overall}}/100 readiness';
  const context = {
    assessment: {
      repository: 'copilot-enablement-adr',
      readinessScores: { overall: 72 },
    },
  };

  console.log('📋 Renderer Comparison Demo');
  console.log('='.repeat(30));

  // Lightweight renderer (our current approach)
  const lightweight = RendererFactory.getRenderer('lightweight');
  console.log('Lightweight:', lightweight.render(template, context));

  // Handlebars renderer (if available)
  try {
    const handlebars = RendererFactory.getRenderer('handlebars');
    console.log('Handlebars:', handlebars.render(template, context));
  } catch (error) {
    console.log('Handlebars: Not available (install handlebars to enable)');
  }
}
