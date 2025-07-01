# Release Process

This document outlines the release process for React Telegram packages.

## Automated Releases (Recommended)

We use [Changesets](https://github.com/changesets/changesets) for version management and releases.

### Creating a Changeset

When you make changes that should be released:

```bash
bun run changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the version bump type (major, minor, patch)
3. Write a summary of the changes

### Release Process

1. **Create changesets** for your changes during development
2. **Merge PRs** with changesets to main branch
3. **Automated PR** will be created by the Release workflow
4. **Review and merge** the automated version bump PR
5. **Packages are published** automatically to npm

## Manual Release (Emergency)

If you need to manually release:

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Run tests
bun test

# 3. Build packages
bun run build

# 4. Create changeset and version
bun run changeset
bun run version

# 5. Commit version changes
git add .
git commit -m "chore: version packages"

# 6. Publish to npm
bun run release

# 7. Push changes and tags
git push origin main --follow-tags
```

## Pre-release Versions

For beta/alpha releases:

```bash
# Create a beta changeset
bun run changeset pre enter beta

# Make changes and create changesets as normal

# When ready to release
bun run version
bun run release

# Exit pre-release mode
bun run changeset pre exit
```

## GitHub Actions

### CI Workflow
- Runs on every push and PR
- Tests, lints, and builds packages
- Validates examples

### Release Workflow
- Runs on push to main
- Creates version bump PRs
- Publishes to npm when version PRs are merged

### Security Workflow
- Weekly security audits
- Dependency vulnerability scanning

## NPM Token Setup

1. Create an npm account at [npmjs.com](https://www.npmjs.com)
2. Generate an access token with publish permissions
3. Add as `NPM_TOKEN` secret in GitHub repository settings

## Troubleshooting

### Build Failures
- Check TypeScript errors: `bun run type-check`
- Clean build artifacts: `bun run clean`
- Reinstall dependencies: `rm -rf node_modules && bun install`

### Publishing Failures
- Verify npm authentication: `npm whoami`
- Check package names are available
- Ensure version hasn't been published already

### Changeset Issues
- Reset changeset state: `rm -rf .changeset/pre.json`
- Manually fix versions in package.json files
- Force version update: `bun run changeset version --no-git-tag`