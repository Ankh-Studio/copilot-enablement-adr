/**
 * Tech Stack Analyzer Skill Evaluation Test Cases
 *
 * Comprehensive test suite following agent skills testing best practices:
 * - Deterministic checks for file structure and API usage
 * - LLM-as-judge for qualitative evaluation
 * - Negative testing for inappropriate triggering
 * - Multi-trial evaluation for statistical reliability
 */

import { SkillTestCase } from '../framework/eval-harness';

export const techStackAnalyzerTestCases: SkillTestCase[] = [
  {
    id: 'tsa-positive-react-typescript',
    name: 'React/TypeScript Repository Analysis',
    description:
      'Should correctly analyze React/TypeScript repository with high confidence',
    type: 'positive',
    input: {
      prompt:
        'Analyze this React/TypeScript repository and provide a comprehensive tech stack assessment',
      context: {
        repoPath: '/test/react-typescript-app',
        expectedTechnologies: ['react', 'typescript', 'vite', 'vitest'],
      },
      environment: 'populated',
    },
    expected: {
      shouldTrigger: true,
      outputSchema: {
        detected: {
          languages: 'object',
          techs: 'array',
        },
        confidence: 'string',
        summary: 'string',
        categories: {
          frameworks: 'array',
          buildTools: 'array',
          testing: 'array',
        },
      },
      filesCreated: [],
      apisUsed: ['@specfy/stack-analyser'],
      confidence: 'high',
    },
    trials: 3,
  },

  {
    id: 'tsa-positive-node-backend',
    name: 'Node.js Backend Analysis',
    description:
      'Should correctly analyze Node.js backend with Express and MongoDB',
    type: 'positive',
    input: {
      prompt: 'What technologies are used in this Node.js backend project?',
      context: {
        repoPath: '/test/node-api-server',
        expectedTechnologies: ['express', 'mongodb', 'jest'],
      },
      environment: 'populated',
    },
    expected: {
      shouldTrigger: true,
      outputSchema: {
        detected: {
          languages: 'object',
          techs: 'array',
        },
        confidence: 'string',
        summary: 'string',
      },
      filesCreated: [],
      apisUsed: ['@specfy/stack-analyser'],
      confidence: 'medium',
    },
    trials: 3,
  },

  {
    id: 'tsa-edge-empty-repo',
    name: 'Empty Repository Handling',
    description: 'Should gracefully handle empty or minimal repositories',
    type: 'edge',
    input: {
      prompt: 'Analyze the technology stack in this repository',
      context: {
        repoPath: '/test/empty-repo',
      },
      environment: 'clean',
    },
    expected: {
      shouldTrigger: true,
      outputSchema: {
        detected: {
          languages: 'object',
          techs: 'array',
        },
        confidence: 'string',
        summary: 'string',
      },
      filesCreated: [],
      apisUsed: ['@specfy/stack-analyser'],
      confidence: 'low',
    },
    trials: 3,
  },

  {
    id: 'tsa-negative-non-code-repo',
    name: 'Non-Code Repository',
    description:
      'Should not trigger for non-code repositories (documentation only)',
    type: 'negative',
    input: {
      prompt: 'Review this documentation repository',
      context: {
        repoPath: '/test/docs-only',
        files: ['README.md', 'docs/guide.md', 'CONTRIBUTING.md'],
      },
      environment: 'populated',
    },
    expected: {
      shouldTrigger: false,
      outputSchema: null,
      filesCreated: [],
      apisUsed: [],
    },
    trials: 3,
  },

  {
    id: 'tsa-negative-irrelevant-task',
    name: 'Irrelevant Task Request',
    description: 'Should not trigger for non-tech-analysis tasks',
    type: 'negative',
    input: {
      prompt: 'Write a README file for this project',
      context: {
        repoPath: '/test/some-project',
      },
      environment: 'populated',
    },
    expected: {
      shouldTrigger: false,
      outputSchema: null,
      filesCreated: [],
      apisUsed: [],
    },
    trials: 3,
  },

  {
    id: 'tsa-edge-corrupted-files',
    name: 'Corrupted Package Files',
    description: 'Should handle corrupted package.json gracefully',
    type: 'edge',
    input: {
      prompt: 'Analyze the tech stack despite corrupted configuration files',
      context: {
        repoPath: '/test/corrupted-config',
      },
      environment: 'corrupted',
    },
    expected: {
      shouldTrigger: true,
      outputSchema: {
        detected: {
          languages: 'object',
          techs: 'array',
        },
        confidence: 'string',
        summary: 'string',
      },
      filesCreated: [],
      apisUsed: ['@specfy/stack-analyser'],
      confidence: 'low',
    },
    trials: 3,
  },

  {
    id: 'tsa-positive-monorepo',
    name: 'Monorepo Analysis',
    description: 'Should correctly analyze monorepo with multiple packages',
    type: 'positive',
    input: {
      prompt:
        'Analyze this monorepo structure and identify all technologies used',
      context: {
        repoPath: '/test/monorepo',
        packages: ['frontend', 'backend', 'shared'],
      },
      environment: 'populated',
    },
    expected: {
      shouldTrigger: true,
      outputSchema: {
        detected: {
          languages: 'object',
          techs: 'array',
        },
        confidence: 'string',
        summary: 'string',
        categories: {
          frameworks: 'array',
          buildTools: 'array',
          testing: 'array',
        },
      },
      filesCreated: [],
      apisUsed: ['@specfy/stack-analyser'],
      confidence: 'high',
    },
    trials: 3,
  },

  {
    id: 'tsa-edge-permission-denied',
    name: 'Permission Denied Access',
    description: 'Should handle permission denied errors gracefully',
    type: 'edge',
    input: {
      prompt: 'Analyze the tech stack in this restricted directory',
      context: {
        repoPath: '/root/restricted-access',
      },
      environment: 'clean',
    },
    expected: {
      shouldTrigger: true,
      outputSchema: {
        detected: null,
        confidence: 'string',
        summary: 'string',
      },
      filesCreated: [],
      apisUsed: [],
      confidence: 'low',
    },
    trials: 3,
  },
];

// Test environment setup utilities
export const testEnvironmentSetup = {
  /**
   * Setup React/TypeScript test environment
   */
  async setupReactTypeScriptEnv(sandboxDir: string): Promise<void> {
    const { promises: fs } = require('fs');
    const path = require('path');

    const files = {
      'package.json': JSON.stringify(
        {
          name: 'react-typescript-app',
          version: '1.0.0',
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            '@tanstack/react-query': '^4.0.0',
          },
          devDependencies: {
            typescript: '^5.0.0',
            vite: '^4.4.0',
            vitest: '^0.34.0',
            '@testing-library/react': '^13.4.0',
          },
        },
        null,
        2
      ),

      'tsconfig.json': JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
          },
          include: ['src'],
          references: [{ path: './tsconfig.node.json' }],
        },
        null,
        2
      ),

      'vite.config.ts': `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})`,

      'src/App.tsx': `
import React from 'react'

function App() {
  return (
    <div className="App">
      <h1>Vite + React</h1>
    </div>
  )
}

export default App`,

      'src/main.tsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,

      'src/App.test.tsx': `
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders learn react link', () => {
  render(<App />)
  const linkElement = screen.getByText(/Vite \+ React/i)
  expect(linkElement).toBeInTheDocument()
})`,
    };

    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(sandboxDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
    }
  },

  /**
   * Setup Node.js backend test environment
   */
  async setupNodeBackendEnv(sandboxDir: string): Promise<void> {
    const { promises: fs } = require('fs');
    const path = require('path');

    const files = {
      'package.json': JSON.stringify(
        {
          name: 'node-api-server',
          version: '1.0.0',
          dependencies: {
            express: '^4.18.0',
            mongoose: '^7.0.0',
            jsonwebtoken: '^9.0.0',
            cors: '^2.8.5',
          },
          devDependencies: {
            jest: '^29.0.0',
            supertest: '^6.3.0',
            nodemon: '^3.0.0',
            '@types/node': '^20.0.0',
          },
        },
        null,
        2
      ),

      'src/server.ts': `
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,

      'src/server.test.ts': `
import request from 'supertest';
import app from './server';

describe('API Endpoints', () => {
  test('GET /api/health', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });
});`,
    };

    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(sandboxDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
    }
  },

  /**
   * Setup corrupted environment for negative testing
   */
  async setupCorruptedEnv(sandboxDir: string): Promise<void> {
    const { promises: fs } = require('fs');
    const path = require('path');

    const corruptedFiles = {
      'package.json': '{ invalid json content',
      'tsconfig.json': 'not valid json at all {{{',
      'README.md': '',
      'src/broken.ts': 'this is not valid typescript syntax {{{',
    };

    for (const [filePath, content] of Object.entries(corruptedFiles)) {
      const fullPath = path.join(sandboxDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
    }
  },
};
