/**
 * Code Quality Validation Utility
 * Prevents unicode escape errors and ensures clean code formatting
 */

export interface CodeQualityIssue {
  line: number;
  column: number;
  type: 'unicode_escape' | 'escaped_quote' | 'escaped_newline' | 'formatting';
  message: string;
  suggestion: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  issues: CodeQualityIssue[];
  fixedContent?: string;
}

/**
 * Detects unicode escape sequences in code
 */
export function detectUnicodeEscapes(content: string): CodeQualityIssue[] {
  const issues: CodeQualityIssue[] = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    // Check for escaped newlines
    const escapedNewlineMatches = line.matchAll(/\\n/g);
    for (const match of escapedNewlineMatches) {
      if (match.index !== undefined) {
        issues.push({
          line: lineIndex + 1,
          column: match.index + 1,
          type: 'escaped_newline',
          message: 'Found escaped newline (\\n) - should use actual line breaks',
          suggestion: 'Replace \\n with actual line breaks or use template literals',
          severity: 'error'
        });
      }
    }

    // Check for escaped quotes
    const escapedQuoteMatches = line.matchAll(/\\"/g);
    for (const match of escapedQuoteMatches) {
      if (match.index !== undefined) {
        issues.push({
          line: lineIndex + 1,
          column: match.index + 1,
          type: 'escaped_quote',
          message: 'Found escaped quote (\\") - should use proper quote usage',
          suggestion: 'Use proper quote nesting or template literals',
          severity: 'error'
        });
      }
    }

    // Check for other unicode escapes
    const unicodeEscapeMatches = line.matchAll(/\\[tnr]/g);
    for (const match of unicodeEscapeMatches) {
      if (match.index !== undefined) {
        issues.push({
          line: lineIndex + 1,
          column: match.index + 1,
          type: 'unicode_escape',
          message: `Found unicode escape (${match[0]}) - should use proper formatting`,
          suggestion: 'Replace with proper formatting or template literals',
          severity: 'error'
        });
      }
    }
  });

  return issues;
}

/**
 * Auto-fixes common unicode escape issues
 */
export function autoFixUnicodeEscapes(content: string): string {
  let fixedContent = content;

  // Fix escaped newlines in string literals
  fixedContent = fixedContent.replace(/\\n/g, '\n');
  
  // Fix escaped quotes
  fixedContent = fixedContent.replace(/\\"/g, '"');
  fixedContent = fixedContent.replace(/\\'/g, "'");
  
  // Fix escaped tabs
  fixedContent = fixedContent.replace(/\\t/g, '  ');
  
  // Fix escaped carriage returns
  fixedContent = fixedContent.replace(/\\r/g, '');

  return fixedContent;
}

/**
 * Validates file content for code quality issues
 */
export function validateFileContent(content: string, filePath: string): ValidationResult {
  const issues: CodeQualityIssue[] = [];
  
  // Check for unicode escapes
  const unicodeIssues = detectUnicodeEscapes(content);
  issues.push(...unicodeIssues);
  
  // Check for React/TypeScript specific issues
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const reactIssues = validateReactTypeScriptCode(content);
    issues.push(...reactIssues);
  }
  
  const isValid = issues.filter(issue => issue.severity === 'error').length === 0;
  
  return {
    isValid,
    issues,
    fixedContent: isValid ? undefined : autoFixUnicodeEscapes(content)
  };
}

/**
 * Validates React/TypeScript specific code quality
 */
function validateReactTypeScriptCode(content: string): CodeQualityIssue[] {
  const issues: CodeQualityIssue[] = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    // Check for improper className formatting
    const classNameMatches = line.matchAll(/className=\\"/g);
    for (const match of classNameMatches) {
      if (match.index !== undefined) {
        issues.push({
          line: lineIndex + 1,
          column: match.index + 1,
          type: 'formatting',
          message: 'Improper className formatting with escaped quotes',
          suggestion: 'Use proper quote nesting: className="..."',
          severity: 'error'
        });
      }
    }

    // Check for improper JSX attribute formatting
    const jsxAttrMatches = line.matchAll(/=\\"/g);
    for (const match of jsxAttrMatches) {
      if (match.index !== undefined) {
        issues.push({
          line: lineIndex + 1,
          column: match.index + 1,
          type: 'formatting',
          message: 'Improper JSX attribute formatting with escaped quotes',
          suggestion: 'Use proper quote nesting in JSX attributes',
          severity: 'error'
        });
      }
    }
  });

  return issues;
}

/**
 * Formats code according to quality standards
 */
export function formatCode(content: string): string {
  let formatted = content;
  
  // Auto-fix unicode escapes
  formatted = autoFixUnicodeEscapes(formatted);
  
  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');
  
  // Remove trailing whitespace
  formatted = formatted.replace(/[ \t]+$/gm, '');
  
  // Ensure file ends with newline
  if (!formatted.endsWith('\n')) {
    formatted += '\n';
  }
  
  return formatted;
}

/**
 * Generates a quality report for a file
 */
export function generateQualityReport(filePath: string, content: string): string {
  const validation = validateFileContent(content, filePath);
  
  if (validation.isValid) {
    return `✅ ${filePath}: No code quality issues found`;
  }
  
  let report = `❌ ${filePath}: Found ${validation.issues.length} code quality issues:\n\n`;
  
  validation.issues.forEach((issue, index) => {
    report += `${index + 1}. Line ${issue.line}, Column ${issue.column} [${issue.severity.toUpperCase()}]\n`;
    report += `   Type: ${issue.type}\n`;
    report += `   Message: ${issue.message}\n`;
    report += `   Suggestion: ${issue.suggestion}\n\n`;
  });
  
  if (validation.fixedContent) {
    report += `🔧 Auto-fix available. Run the fix command to apply corrections.\n`;
  }
  
  return report;
}

/**
 * Checks if content has any unicode escape errors
 */
export function hasUnicodeEscapeErrors(content: string): boolean {
  const unicodeEscapePattern = /\\[ntr"']/g;
  return unicodeEscapePattern.test(content);
}

/**
 * Provides clean code formatting guidelines
 */
export const FORMATTING_GUIDELINES = {
  strings: {
    good: [
      'const message = "Hello World";',
      'const template = `Hello ${name}`;',
      'const multiline = `\n  Line 1\n  Line 2\n`;'
    ],
    bad: [
      'const message = \\"Hello World\\";',
      'const template = "Hello \\n World";',
      'const multiline = "Line 1\\nLine 2";'
    ]
  },
  jsx: {
    good: [
      '<div className="p-6">',
      '<Button onClick={() => handleClick()}>',
      '<span title="Tooltip text">'
    ],
    bad: [
      '<div className=\\"p-6\\">',
      '<Button onClick={() => handleClick()}>',
      '<span title=\\"Tooltip text\\">'
    ]
  },
  imports: {
    good: [
      "import React from 'react';",
      "import { Button } from '@/components/ui/button';"
    ],
    bad: [
      "import React from 'react';\\n",
      "import { Button } from '@/components/ui/button';\\n"
    ]
  }
};