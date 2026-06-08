# Changelog

## 3.1.0 - 2026-06-08

### Added

- Added an AI settings page for OpenAI-compatible API key, base URL, provider presets, model selection, and connection testing.
- Added repeatable Playwright screenshot capture for the full user journey shown in the README.
- Added GitHub-standard security and contribution documentation.

### Changed

- Rewrote the README as a product story with complete feature screenshots.
- Updated CI to run on pull requests and pushes to `main` with npm-based dependency installation.
- Moved AI provider credentials out of CI and into local user settings.
- Optimized production builds by disabling source maps and enabling CSS minification.
- Replaced the bundled introduction video with an external link to keep the repository lightweight.
- Upgraded frontend tooling and dependency overrides so `npm audit --audit-level=high` passes with zero vulnerabilities.

### Fixed

- Preserved the selected OpenAI-compatible model when creating providers from saved settings.
- Replaced fallback-based AI connection checks with direct OpenAI-compatible `/chat/completions` probes.
- Added timeouts and safer error messages for API connection testing.
- Removed runtime CDN injection from recipe sharing.
