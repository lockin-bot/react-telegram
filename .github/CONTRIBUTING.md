# Contributing to React Telegram

Thank you for your interest in contributing to React Telegram! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run tests:
   ```bash
   bun test
   ```

## Project Structure

This is a monorepo managed with Bun workspaces:

- `packages/core` - Core React reconciler
- `packages/mtcute-adapter` - MTCute Telegram adapter
- `packages/examples` - Example implementations

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clear, concise commit messages
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Create a Changeset

Before submitting a PR, create a changeset describing your changes:

```bash
bun run changeset
```

This will prompt you to:
- Select which packages changed
- Choose the type of change (major/minor/patch)
- Write a summary of changes

### 4. Submit a Pull Request

- Push your branch to your fork
- Open a PR against the `main` branch
- Fill out the PR template
- Wait for CI checks to pass

## Code Style

We use Prettier for code formatting:

```bash
bun run format
```

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests for a specific package
cd packages/core && bun test
```

### Writing Tests

- Place test files next to the code they test
- Use `.test.ts` or `.test.tsx` extension
- Follow existing test patterns

## Type Checking

Ensure your code passes TypeScript checks:

```bash
bun run type-check
```

## CI/CD Pipeline

Our GitHub Actions workflows run:
- Tests on multiple Node versions
- Type checking
- Build verification
- Security audits

## Release Process

Releases are automated through GitHub Actions:

1. Merge changesets to main
2. Automated PR is created for version bumps
3. Merge the version PR
4. Packages are automatically published to npm

## Questions?

Feel free to:
- Open an issue for bugs or feature requests
- Start a discussion for questions
- Join our community chat (if available)

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.