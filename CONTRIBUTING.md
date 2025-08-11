# Contributing to FactBench 🤝

First off, thank you for considering contributing to FactBench! It's people like you that make FactBench such a great tool for helping consumers make informed decisions.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/FactBench.git
   cd FactBench
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/FactBench/FactBench.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   pip install beautifulsoup4 requests  # For Python scripts
   ```

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node.js version)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- Step-by-step description of the suggested enhancement
- Explanation of why this enhancement would be useful
- Possible implementation approach

### 🔧 Areas for Contribution

#### 1. New Product Categories
- Research and add new product review pages
- Follow existing patterns in `best-robotic-pool-cleaners.html`
- Ensure data accuracy and proper attribution

#### 2. UI/UX Improvements
- Enhance responsive design
- Improve accessibility (ARIA labels, keyboard navigation)
- Add new interactive components
- Optimize performance

#### 3. Data Sources
- Add new data extraction scripts
- Improve existing extraction accuracy
- Add data validation

#### 4. Documentation
- Improve README and guides
- Add code comments where helpful
- Create tutorials for common tasks

## 💻 Development Process

### 1. Setting Up Your Development Environment

```bash
# Start development server
npm run dev

# This runs:
# - TailwindCSS in watch mode
# - Local preview server
# - File watching for auto-reload
```

### 2. Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow the existing code style
   - Update tests if applicable
   - Update documentation

3. **Test your changes**:
   ```bash
   # Build the site
   npm run build
   
   # Preview the build
   npm run preview
   
   # Run linting
   npm run lint
   ```

### 3. Project Structure Guidelines

- `/src/pages/` - HTML templates for product pages
- `/src/data/` - JSON data files
- `/src/assets/` - CSS, images, and static assets
- `/scripts/` - Build and utility scripts
- `/dist/` - Generated files (don't commit these)

## 🎨 Style Guidelines

### HTML/CSS
- Use semantic HTML5 elements
- Follow BEM naming convention for custom classes
- Use TailwindCSS utilities when possible
- Maintain dark theme consistency

### JavaScript
- Use ES6+ features
- Keep Alpine.js components simple
- Minimize dependencies
- Comment complex logic

### Python
- Follow PEP 8 style guide
- Use type hints where appropriate
- Handle errors gracefully
- Document functions

### Design Principles
- **Performance**: Every feature should be fast
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile-first**: Design for mobile, enhance for desktop
- **Data integrity**: Never compromise on accuracy

## 📝 Commit Messages

Follow the conventional commits specification:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(products): add robotic vacuum cleaner category

- Added new product page template
- Extracted data from 15 top products
- Implemented comparison charts
```

## 🔄 Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**:
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changes you made and why
   - Include screenshots for UI changes
   - Ensure all checks pass

4. **PR Checklist**:
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No console errors
   - [ ] Mobile responsive
   - [ ] Build succeeds

5. **Review Process**:
   - Maintainers will review your PR
   - Address any feedback
   - Once approved, it will be merged

## 🏗️ Building and Testing

### Build Commands
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Clean build artifacts
npm run clean
```

### Testing Checklist
- [ ] All links work correctly
- [ ] Images load properly
- [ ] Mobile layout is correct
- [ ] Charts render correctly
- [ ] CTAs are clickable
- [ ] No JavaScript errors

## 🚢 Release Process

1. Ensure all tests pass
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Create a release tag
5. Deploy to production

## 📚 Resources

- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Alpine.js Documentation](https://alpinejs.dev/start-here)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## 🤔 Questions?

Feel free to:
- Open an issue for discussion
- Join our GitHub Discussions
- Email us at contribute@factbench.com

---

Thank you for contributing to FactBench! Together, we're making product research easier and more transparent for everyone. 🎯