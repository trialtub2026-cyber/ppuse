/**
 * Runtime Unicode Escape Prevention Utilities
 * Provides real-time validation and prevention of unicode escape errors
 */

export interface UnicodeEscapeError {
  type: 'escaped_newline' | 'escaped_quote' | 'escaped_tab' | 'escaped_return';
  position: number;
  character: string;
  suggestion: string;
}

/**
 * Validates string content for unicode escapes at runtime
 */
export function validateStringContent(content: string): UnicodeEscapeError[] {
  const errors: UnicodeEscapeError[] = [];
  
  // Check for escaped newlines
  let match;
  const newlineRegex = /\\n/g;
  while ((match = newlineRegex.exec(content)) !== null) {
    errors.push({
      type: 'escaped_newline',
      position: match.index,
      character: '\\n',
      suggestion: 'Use template literals or actual line breaks'
    });
  }
  
  // Check for escaped quotes
  const quoteRegex = /\\"/g;
  while ((match = quoteRegex.exec(content)) !== null) {
    errors.push({
      type: 'escaped_quote',
      position: match.index,
      character: '\\"',
      suggestion: 'Use proper quote nesting or template literals'
    });
  }
  
  // Check for escaped tabs
  const tabRegex = /\\t/g;
  while ((match = tabRegex.exec(content)) !== null) {
    errors.push({
      type: 'escaped_tab',
      position: match.index,
      character: '\\t',
      suggestion: 'Use actual spaces or proper indentation'
    });
  }
  
  // Check for escaped returns
  const returnRegex = /\\r/g;
  while ((match = returnRegex.exec(content)) !== null) {
    errors.push({
      type: 'escaped_return',
      position: match.index,
      character: '\\r',
      suggestion: 'Remove carriage returns or use proper line endings'
    });
  }
  
  return errors;
}

/**
 * Sanitizes string content by removing unicode escapes
 */
export function sanitizeString(content: string): string {
  return content
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\t/g, '  ')
    .replace(/\\r/g, '');
}

/**
 * Validates JSX attribute values for unicode escapes
 */
export function validateJSXAttribute(attributeName: string, value: string): boolean {
  if (attributeName === 'className' && value.includes('\\"')) {
    console.warn(`⚠️ Unicode escape detected in ${attributeName}: ${value}`);
    return false;
  }
  
  const errors = validateStringContent(value);
  if (errors.length > 0) {
    console.warn(`⚠️ Unicode escapes detected in ${attributeName}:`, errors);
    return false;
  }
  
  return true;
}

/**
 * Development-time validator for component props
 */
export function validateComponentProps(componentName: string, props: Record<string, any>): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const errors = validateStringContent(value);
      if (errors.length > 0) {
        console.warn(
          `🚫 Unicode escape errors in ${componentName}.${key}:`,
          errors.map(e => `${e.character} at position ${e.position}`)
        );
      }
    }
  });
}

/**
 * HOC to validate component props for unicode escapes
 */
export function withUnicodeEscapeValidation<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  const WrappedComponent = (props: T) => {
    if (process.env.NODE_ENV === 'development') {
      validateComponentProps(componentName || Component.name || 'Component', props);
    }
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withUnicodeEscapeValidation(${componentName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook to validate string state for unicode escapes
 */
export function useUnicodeEscapeValidation(value: string, fieldName?: string) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const errors = validateStringContent(value);
      if (errors.length > 0) {
        console.warn(
          `🚫 Unicode escape errors in ${fieldName || 'field'}:`,
          errors
        );
      }
    }
  }, [value, fieldName]);
}

/**
 * Validates template literal content
 */
export function validateTemplateLiteral(strings: TemplateStringsArray, ...values: any[]): string {
  const result = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] || '');
  }, '');
  
  if (process.env.NODE_ENV === 'development') {
    const errors = validateStringContent(result);
    if (errors.length > 0) {
      console.warn('🚫 Unicode escape errors in template literal:', errors);
    }
  }
  
  return result;
}

/**
 * Safe string builder that prevents unicode escapes
 */
export class SafeStringBuilder {
  private content: string = '';
  
  append(text: string): this {
    const sanitized = sanitizeString(text);
    this.content += sanitized;
    return this;
  }
  
  appendLine(text: string = ''): this {
    return this.append(text + '\n');
  }
  
  appendTemplate(template: string, values: Record<string, string>): this {
    let result = template;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), sanitizeString(value));
    });
    return this.append(result);
  }
  
  toString(): string {
    return this.content;
  }
  
  clear(): this {
    this.content = '';
    return this;
  }
  
  validate(): UnicodeEscapeError[] {
    return validateStringContent(this.content);
  }
}

/**
 * Development helper to check for unicode escapes in the entire document
 */
export function scanDocumentForUnicodeEscapes(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const scripts = document.querySelectorAll('script');
  scripts.forEach((script, index) => {
    if (script.textContent) {
      const errors = validateStringContent(script.textContent);
      if (errors.length > 0) {
        console.warn(`🚫 Unicode escapes found in script ${index}:`, errors);
      }
    }
  });
}

/**
 * Validates imported module content
 */
export function validateModuleContent(moduleContent: string, moduleName: string): boolean {
  const errors = validateStringContent(moduleContent);
  if (errors.length > 0) {
    console.error(`🚫 Unicode escape errors in module ${moduleName}:`, errors);
    return false;
  }
  return true;
}

// React import for HOC and hooks
import React from 'react';