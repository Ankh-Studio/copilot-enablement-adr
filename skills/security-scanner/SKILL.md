---
name: security-scanner
description: Analyzes GitHub Advanced Security features including CodeQL scanning, Dependabot alerts, and secret scanning. Use when assessing repository security posture and GH-AS adoption.
license: MIT
metadata:
  author: Ankh Studio
  version: '1.0'
  capabilities: github-api security-analysis compliance-checking
---

# Security Scanner

Analyzes GitHub Advanced Security features and overall repository security posture.

## Usage

```bash
copilot run security-scanner --repo https://github.com/owner/repo --token $GITHUB_TOKEN
```

## Inputs

- GitHub repository URL (required for full analysis)
- GitHub access token (for API access)
- Optional: Security focus areas (codeql, dependabot, secrets)

## Outputs

- **Primary**: JSON object with security analysis results
- **Secondary**: Security posture assessment
- **Metadata**: Feature availability and configuration status

## Security Analysis Components

### CodeQL Analysis

- Scanning setup and configuration status
- Open alerts and their severity
- Last analysis timestamp
- Query pack coverage

### Dependabot Analysis

- Alert status and counts
- Dependency review configuration
- Version updates coverage
- Security vulnerability tracking

### Secret Scanning Analysis

- Alert configuration and status
- Push protection settings
- Custom patterns (if configured)
- Historical alert trends

### Security Overview

- Advanced Security feature enablement
- Repository visibility and access controls
- Security policy documentation
- Compliance framework alignment

## Output Structure

```json
{
  "available": true,
  "codeql": {
    "enabled": true,
    "openAlerts": 5,
    "lastAnalysis": "2024-01-15T10:30:00Z"
  },
  "dependabot": {
    "enabled": true,
    "openAlerts": 12,
    "dependencyReview": true
  },
  "secretScanning": {
    "enabled": true,
    "openAlerts": 2,
    "pushProtection": true
  },
  "securityOverview": {
    "hasSecurityFeatures": true,
    "isPrivate": false,
    "vulnerabilityAlerts": true
  }
}
```

## Implementation Notes

- Requires GitHub token with appropriate permissions
- Handles API rate limits and authentication errors
- Provides fallback analysis when API access unavailable
- Respects repository privacy and access restrictions

## Security Considerations

- Tokens are handled securely and never logged
- API calls respect rate limiting guidelines
- No sensitive data is stored or transmitted
- Results are sanitized before output

## References

See `references/security-analysis-guide.md` for detailed security assessment methodology.
