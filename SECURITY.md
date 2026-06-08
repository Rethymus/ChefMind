# Security Policy

## Supported Versions

ChefMind currently supports the latest release on the `main` branch.

## Reporting a Vulnerability

Please report security issues through GitHub Issues if the information is not sensitive. If the report contains private data, credentials, or an exploit path that should not be public, contact the maintainer privately before disclosure.

Include:

- Affected version or commit SHA
- Steps to reproduce
- Impact and affected component
- Any relevant logs with secrets removed

## Secret Handling

ChefMind is designed as a local-first application. OpenAI-compatible API keys are configured by the user in the app settings and are not required in CI or frontend build secrets.

Never commit:

- `.env` files
- API keys or access tokens
- Local database snapshots with private user data
- Generated release artifacts

## Dependency Hygiene

Before releasing, run:

```bash
npm ci
npm audit --audit-level=high
npm run type-check
npm run build
```
