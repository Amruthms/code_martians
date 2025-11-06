# Contributing to AI-Powered Construction Safety System

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/code_martians.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit with descriptive messages
7. Push to your fork
8. Create a Pull Request

## Code Standards

### Frontend (React/TypeScript)
- Use TypeScript for all new components
- Follow existing component structure
- Use Tailwind CSS for styling
- Ensure responsive design (mobile-first)
- Add proper TypeScript types
- Use functional components with hooks

### Backend (Python/FastAPI)
- Follow PEP 8 style guide
- Add type hints to all functions
- Write docstrings for public APIs
- Use Pydantic for validation
- Keep endpoints RESTful

### Vision (Python/OpenCV)
- Document algorithm changes
- Test with various lighting conditions
- Optimize for performance
- Add configuration options to config.yaml

## Testing

### Frontend
```bash
cd frontend
npm run test
npm run type-check
```

### Backend
```bash
cd backend
pytest
```

### Vision
```bash
cd vision
python -m pytest tests/
```

## Commit Messages

Use conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Example: `feat: add proximity alert configuration`

## Pull Request Guidelines

1. **Title**: Clear and descriptive
2. **Description**: 
   - What problem does it solve?
   - How does it solve it?
   - Any breaking changes?
3. **Testing**: Describe how you tested
4. **Screenshots**: For UI changes
5. **Documentation**: Update relevant docs

## Code Review Process

- All PRs require at least one approval
- Address review comments
- Keep PRs focused and reasonably sized
- Ensure CI passes before requesting review

## Development Workflow

1. **Plan**: Discuss major changes in issues first
2. **Develop**: Write clean, tested code
3. **Document**: Update README and docs
4. **Test**: Verify functionality
5. **Review**: Request peer review
6. **Deploy**: Merge and deploy

## Questions?

Open an issue or contact the maintainers.

Thank you for contributing! 🙏
