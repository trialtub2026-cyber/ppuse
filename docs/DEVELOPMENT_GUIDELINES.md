# Development Guidelines

## Unicode Escape Prevention & Code Quality Standards

This document outlines the development guidelines to prevent unicode escape errors and maintain high code quality standards in our React/TypeScript application.

## 🚫 Unicode Escape Prevention Rules

### Critical Rules - NEVER DO THIS:

#### ❌ Escaped Newlines
```typescript
// BAD - Never use escaped newlines
const badCode = "import React from 'react';\nimport { Button } from '@/components/ui/button';\n";

// GOOD - Use proper formatting
const goodCode = `
import React from 'react';
import { Button } from '@/components/ui/button';
`;
```

#### ❌ Escaped Quotes in JSX
```tsx
// BAD - Never escape quotes in JSX
<div className=\"p-6\">
  <Button onClick={() => console.log(\"Hello\")}>
    Click me
  </Button>
</div>

// GOOD - Use proper quote nesting
<div className="p-6">
  <Button onClick={() => console.log("Hello")}>
    Click me
  </Button>
</div>
```

#### ❌ Escaped Characters in Strings
```typescript
// BAD - Escaped characters in regular strings
const message = "Hello\nWorld";
const quote = "He said \"Hello\"";

// GOOD - Use template literals or proper escaping
const message = `Hello
World`;
const quote = `He said "Hello"`;
// OR
const quote = 'He said "Hello"';
```

## ✅ Code Formatting Standards

### 1. String Formatting

#### Template Literals (Preferred)
```typescript
// Use template literals for multi-line strings
const component = `
  <div className="p-6">
    <h1>Title</h1>
    <p>Content</p>
  </div>
`;

// Use template literals for interpolation
const greeting = `Hello ${name}, welcome!`;
```

#### Quote Nesting
```typescript
// Single quotes for strings containing double quotes
const htmlString = '<div class="container">Content</div>';

// Double quotes for strings containing single quotes
const message = "Don't forget to save";

// Template literals for complex cases
const complex = `He said "Don't worry" and left`;
```

### 2. React/JSX Standards

#### Component Structure
```tsx
import React from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  onClick: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onClick }) => {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Button onClick={onClick}>
        Click me
      </Button>
    </div>
  );
};

export default MyComponent;
```

#### JSX Attributes
```tsx
// GOOD - Proper attribute formatting
<Button
  variant="primary"
  size="lg"
  onClick={() => handleClick()}
  className="w-full"
>
  Submit
</Button>

// GOOD - Event handlers
<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text"
/>
```

### 3. Import/Export Standards

```typescript
// GOOD - Clean imports
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// GOOD - Named exports
export { MyComponent };
export default MyComponent;
```

## 🔧 Pre-Commit Validation Checklist

Before committing any code, ensure:

### Automated Checks
- [ ] No unicode escape sequences (`\n`, `\"`, `\'`, `\t`, `\r`)
- [ ] Proper JSX attribute formatting
- [ ] Clean string formatting
- [ ] No escaped quotes in className attributes
- [ ] Proper import statement formatting

### Manual Review
- [ ] Code is readable and well-formatted
- [ ] No hardcoded strings that should be constants
- [ ] Proper TypeScript types are used
- [ ] Component props are properly typed
- [ ] Error handling is implemented
- [ ] Toast notifications use `sonner` consistently

## 🛠️ Tools and Utilities

### Code Quality Validator
```bash
# Validate files for unicode escapes
npm run validate:code

# Auto-fix unicode escape issues
npm run fix:unicode-escapes

# Run full code quality check
npm run quality:check
```

### ESLint Integration
Our ESLint configuration includes rules to prevent unicode escape errors:

```json
{
  "rules": {
    "no-useless-escape": "error",
    "quotes": ["error", "single", { "avoidEscape": true }],
    "jsx-quotes": ["error", "prefer-double"]
  }
}
```

## 🚨 Common Pitfalls and Solutions

### 1. Copy-Paste from External Sources
**Problem**: Copying code from external sources often introduces unicode escapes.

**Solution**: Always validate and clean copied code before committing.

```typescript
// After copying code, run through our validator
import { validateFileContent, autoFixUnicodeEscapes } from '@/utils/codeQuality';

const cleanedCode = autoFixUnicodeEscapes(copiedCode);
```

### 2. String Concatenation
**Problem**: Building strings with concatenation can lead to escape issues.

**Solution**: Use template literals instead.

```typescript
// BAD
const html = "<div class=\"" + className + "\">" + content + "</div>";

// GOOD
const html = `<div class="${className}">${content}</div>`;
```

### 3. JSON Stringification
**Problem**: JSON.stringify can introduce escape sequences.

**Solution**: Handle JSON properly and validate output.

```typescript
// Be careful with JSON stringification
const jsonString = JSON.stringify(data, null, 2);
// Validate the result doesn't contain problematic escapes
```

## 📋 File-Specific Guidelines

### React Components (.tsx)
- Use functional components with TypeScript
- Proper prop typing with interfaces
- Clean JSX formatting without escaped quotes
- Consistent event handler patterns

### Utility Files (.ts)
- Export functions with proper TypeScript types
- Use template literals for multi-line strings
- Proper error handling and validation

### Service Files
- Consistent API call patterns
- Proper error handling with toast notifications
- Clean async/await usage

## 🔍 Validation Commands

### Development Workflow
```bash
# Before starting work
npm run validate:setup

# During development
npm run validate:watch

# Before committing
npm run validate:pre-commit

# Fix issues automatically
npm run fix:all
```

### CI/CD Integration
```bash
# In CI pipeline
npm run validate:ci
npm run build:check
npm run test:quality
```

## 📚 Best Practices Summary

1. **Never use unicode escape sequences** in source code
2. **Use template literals** for complex strings
3. **Proper quote nesting** in JSX and TypeScript
4. **Validate before committing** using our tools
5. **Auto-fix when possible** using provided utilities
6. **Review code carefully** for escape sequences
7. **Use consistent formatting** across all files
8. **Follow TypeScript best practices** for type safety

## 🆘 Getting Help

If you encounter unicode escape issues:

1. Run the auto-fix utility: `npm run fix:unicode-escapes`
2. Check the validation report: `npm run validate:detailed`
3. Review this guide for proper formatting
4. Ask for code review if unsure

## 📖 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Best Practices](https://react.dev/learn)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

---

**Remember**: Clean code is maintainable code. Following these guidelines ensures our codebase remains high-quality and free from unicode escape errors.