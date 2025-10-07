# Contributing to Zillow API Real Estate Analysis Platform

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Java 11 or higher
- Maven 3.6+ (optional)
- Git

### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Install dependencies
4. Run tests to ensure everything works

```bash
git clone https://github.com/your-username/zillow-api-platform.git
cd zillow-api-platform
./mvnw clean compile  # or use Maven if installed
```

## 📝 How to Contribute

### Reporting Issues
- Use the issue templates provided
- Include steps to reproduce
- Provide system information (OS, Java version, etc.)
- Add relevant logs or error messages

### Submitting Pull Requests
1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Update documentation if needed
5. Submit a pull request with a clear description

### Code Style Guidelines
- Follow Java naming conventions
- Use meaningful variable and method names
- Add comments for complex logic
- Keep methods focused and small
- Use proper error handling

## 🏗️ Project Structure

```
├── src/main/java/          # Main source code
├── src/test/java/          # Test code
├── docs/                   # Documentation
├── lib/                    # Dependencies
└── output/                 # Generated data (gitignored)
```

## 🧪 Testing

### Running Tests
```bash
# Compile and run tests
./mvnw test

# Or manually
javac -cp "lib/*" src/test/java/*.java
java -cp ".:lib/*" TestRunner
```

### Test Guidelines
- Write unit tests for new features
- Test edge cases and error conditions
- Maintain test coverage above 80%
- Use descriptive test names

## 📚 Documentation

### Code Documentation
- Use JavaDoc for public APIs
- Include examples in documentation
- Keep README.md updated
- Document configuration options

### API Documentation
- Update API.md when endpoints change
- Include request/response examples
- Document error codes and messages

## 🔒 Security

### API Keys
- Never commit API keys to the repository
- Use environment variables for sensitive data
- Follow the security guidelines in SECURITY.md

### Dependencies
- Keep dependencies updated
- Use only trusted libraries
- Report security vulnerabilities

## 🏷️ Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### Release Checklist
- [ ] Update version numbers
- [ ] Update CHANGELOG.md
- [ ] Run full test suite
- [ ] Update documentation
- [ ] Create release notes

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's code of conduct

### Communication
- Use GitHub issues for bug reports
- Use discussions for questions and ideas
- Keep conversations focused and productive

## 📋 Development Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(api): add property search functionality`
- `fix(ui): resolve visualization display issue`
- `docs(readme): update installation instructions`

## 🆘 Getting Help

- Check existing issues and discussions
- Review documentation in `/docs`
- Ask questions in GitHub discussions
- Contact maintainers for urgent issues

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to this project!
