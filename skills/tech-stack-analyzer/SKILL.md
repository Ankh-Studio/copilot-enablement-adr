---
name: tech-stack-analyzer
description: Analyzes repository technology stack using @specfy/stack-analyser to detect 700+ technologies, languages, frameworks, and infrastructure components. Use when you need comprehensive tech stack detection and analysis.
license: MIT
metadata:
  author: Ankh Studio
  version: "1.0"
  capabilities: tech-stack-detection filesystem-analysis
---

# Tech Stack Analyzer

Analyzes a repository's technology stack using deterministic detection methods.

## Usage

```bash
copilot run tech-stack-analyzer --repo ./my-project
```

## Inputs

- Repository path (default: current directory)
- Optional analysis depth and confidence thresholds

## Outputs

- **Primary**: JSON object with detected technologies
- **Secondary**: Human-readable tech stack summary
- **Metadata**: Confidence levels and detection methods

## Analysis Process

1. **Primary Detection**: Uses @specfy/stack-analyser for deterministic detection
2. **Technology Categorization**: Groups detected tech by type (languages, frameworks, infrastructure)
3. **Confidence Assessment**: Evaluates detection confidence based on file patterns
4. **Summary Generation**: Creates human-readable summary of key findings

## Output Structure

```json
{
  "detected": {
    "languages": {"javascript": 45, "typescript": 32},
    "techs": ["react", "node", "express", "mongodb"],
    "stack": ["frontend", "backend", "database"]
  },
  "summary": "Languages: JavaScript (45), TypeScript (32). Technologies: react, node, express, mongodb",
  "confidence": "high"
}
```

## Implementation Notes

- Analyzes package.json, requirements.txt, and other dependency files
- Detects build tools, frameworks, and infrastructure as code
- Provides confidence levels based on detection strength
- Handles ambiguous findings with fallback analysis

## References

See `references/tech-detection-guide.md` for detailed detection methodology.
