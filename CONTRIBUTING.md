# Contributing to AgentOps Hub

Thank you for your interest in contributing to AgentOps Hub! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/agentops-hub.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with clear messages: `git commit -m "Add feature: description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env  # Configure your environment variables
python migrate_new_features.py
python seed.py
python -m uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### Database
```bash
docker-compose up -d
```

## Code Standards

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints for function parameters and return values
- Write docstrings for classes and functions
- Keep functions focused and single-purpose
- Use async/await for I/O operations

### TypeScript (Frontend)
- Follow the existing code style
- Use TypeScript strict mode
- Define proper types/interfaces
- Use functional components with hooks
- Keep components small and reusable

## Testing

### Backend
```bash
cd backend
python testing.py
```

All tests must pass before submitting a PR.

### Frontend
Run the application and manually test your changes across different scenarios.

## Pull Request Guidelines

- **Title**: Use clear, descriptive titles (e.g., "Add web search tool", "Fix authentication bug")
- **Description**: Explain what changes you made and why
- **Tests**: Include test results or evidence that your changes work
- **Screenshots**: For UI changes, include before/after screenshots
- **Breaking Changes**: Clearly mark any breaking changes

## Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```
feat: Add conversation memory feature

- Added Conversation and Message models
- Implemented conversation API endpoints
- Updated agent runs to support conversation context
- Added frontend conversation UI

Closes #123
```

## Reporting Issues

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python/Node version, etc.)
- Error messages or logs
- Screenshots if applicable

## Feature Requests

For feature requests, please:
- Check if the feature already exists or is planned
- Describe the feature and its use case
- Explain why it would be valuable
- Provide examples if possible

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints

## Questions?

Feel free to open an issue for questions or discussion about contributing.

---

Thank you for contributing to AgentOps Hub! 🚀
