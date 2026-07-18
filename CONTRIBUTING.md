# Contributing

Thanks for improving ChefMind. Keep changes small, user-facing, and easy to verify.

## Local Setup

```bash
npm ci
npm run dev
```

The app starts in Mock mode until a user configures a BYOK connection from Settings. For local screenshots:

```bash
npm run dev -- --host 127.0.0.1 --port 1420
```

## Quality Gate

Run these checks before opening a pull request:

```bash
npm audit --audit-level=high
npm run type-check
npm run build
npm run screenshots
```

## Pull Request Expectations

- Do not commit secrets, local databases, generated bundles, or release artifacts.
- Keep README screenshots current when UI flows change.
- Prefer local dependencies over runtime CDN scripts.
- Use the settings page for OpenAI-compatible API configuration instead of build-time secrets.
- Explain user-visible changes and verification commands in the PR description.

## Release Notes

User-visible changes should be added to `CHANGELOG.md` under `Unreleased`.
