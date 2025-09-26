module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react-refresh',
    '@typescript-eslint',
    'react',
    'jsx-a11y',
    'unicode-escape-prevention'
  ],
  rules: {
    // React specific rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    
    // Unicode escape prevention rules
    'no-useless-escape': 'error',
    'no-control-regex': 'error',
    
    // String and quote formatting
    'quotes': ['error', 'single', { 
      'avoidEscape': true,
      'allowTemplateLiterals': true 
    }],
    'jsx-quotes': ['error', 'prefer-double'],
    
    // Prevent common unicode escape patterns
    'no-irregular-whitespace': ['error', {
      'skipStrings': false,
      'skipComments': false,
      'skipRegExps': false,
      'skipTemplates': false
    }],
    
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_' 
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // Code quality rules
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    'no-template-curly-in-string': 'error',
    
    // Custom unicode escape prevention rules
    'unicode-escape-prevention/no-escaped-newlines': 'error',
    'unicode-escape-prevention/no-escaped-quotes-in-jsx': 'error',
    'unicode-escape-prevention/prefer-template-literals': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['*.tsx', '*.ts'],
      rules: {
        // Additional TypeScript/React specific rules
        'unicode-escape-prevention/validate-jsx-attributes': 'error',
        'unicode-escape-prevention/validate-import-statements': 'error',
      },
    },
  ],
};

// Custom ESLint plugin for unicode escape prevention
const unicodeEscapePreventionPlugin = {
  rules: {
    'no-escaped-newlines': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent escaped newlines in strings',
          category: 'Possible Errors',
        },
        fixable: 'code',
        schema: [],
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string' && node.raw.includes('\\n')) {
              context.report({
                node,
                message: 'Avoid escaped newlines. Use template literals or proper line breaks.',
                fix(fixer) {
                  const fixed = node.raw.replace(/\\n/g, '\n');
                  return fixer.replaceText(node, `\`${fixed.slice(1, -1)}\``);
                },
              });
            }
          },
        };
      },
    },
    
    'no-escaped-quotes-in-jsx': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent escaped quotes in JSX attributes',
          category: 'Possible Errors',
        },
        fixable: 'code',
        schema: [],
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.value && node.value.type === 'Literal') {
              const value = node.value.raw;
              if (value.includes('\\"') || value.includes("\\'")) {
                context.report({
                  node: node.value,
                  message: 'Avoid escaped quotes in JSX attributes. Use proper quote nesting.',
                  fix(fixer) {
                    let fixed = value;
                    if (value.startsWith('"') && value.includes('\\"')) {
                      fixed = `'${value.slice(1, -1).replace(/\\"/g, '"')}'`;
                    } else if (value.startsWith("'") && value.includes("\\'")) {
                      fixed = `"${value.slice(1, -1).replace(/\\'/g, "'")}\"`;
                    }
                    return fixer.replaceText(node.value, fixed);
                  },
                });
              }
            }
          },
        };
      },
    },
    
    'prefer-template-literals': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prefer template literals for complex strings',
          category: 'Best Practices',
        },
        fixable: 'code',
        schema: [],
      },
      create(context) {
        return {
          BinaryExpression(node) {
            if (node.operator === '+' && 
                (node.left.type === 'Literal' || node.right.type === 'Literal')) {
              const hasStringLiteral = 
                (node.left.type === 'Literal' && typeof node.left.value === 'string') ||
                (node.right.type === 'Literal' && typeof node.right.value === 'string');
              
              if (hasStringLiteral) {
                context.report({
                  node,
                  message: 'Consider using template literals instead of string concatenation.',
                });
              }
            }
          },
        };
      },
    },
    
    'validate-jsx-attributes': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Validate JSX attribute formatting',
          category: 'Possible Errors',
        },
        schema: [],
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.name === 'className' && node.value) {
              const sourceCode = context.getSourceCode();
              const text = sourceCode.getText(node.value);
              
              if (text.includes('=\\"') || text.includes('=\\\'')) {
                context.report({
                  node: node.value,
                  message: 'Invalid className attribute formatting. Avoid escaped quotes.',
                });
              }
            }
          },
        };
      },
    },
    
    'validate-import-statements': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Validate import statement formatting',
          category: 'Possible Errors',
        },
        schema: [],
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText(node);
            
            if (text.includes('\\n') || text.includes('\\"')) {
              context.report({
                node,
                message: 'Import statement contains escaped characters. Use proper formatting.',
              });
            }
          },
        };
      },
    },
  },
};

// Register the custom plugin
if (typeof module !== 'undefined' && module.exports) {
  module.exports.plugins = {
    'unicode-escape-prevention': unicodeEscapePreventionPlugin,
  };
}