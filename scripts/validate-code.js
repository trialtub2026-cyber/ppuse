#!/usr/bin/env node

/**
 * Pre-commit Code Validation Script
 * Prevents unicode escape errors and ensures code quality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

/**
 * Logs colored messages to console
 */
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Detects unicode escape sequences in content
 */
function detectUnicodeEscapes(content) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, lineIndex) => {
    // Check for escaped newlines
    const escapedNewlines = [...line.matchAll(/\\n/g)];
    escapedNewlines.forEach(match => {
      issues.push({
        line: lineIndex + 1,
        column: match.index + 1,
        type: 'escaped_newline',
        message: 'Found escaped newline (\\n)',
        severity: 'error'
      });
    });
    
    // Check for escaped quotes
    const escapedQuotes = [...line.matchAll(/\\"/g)];
    escapedQuotes.forEach(match => {
      issues.push({
        line: lineIndex + 1,
        column: match.index + 1,
        type: 'escaped_quote',
        message: 'Found escaped quote (\\")',
        severity: 'error'
      });
    });
    
    // Check for other unicode escapes
    const unicodeEscapes = [...line.matchAll(/\\[tnr]/g)];
    unicodeEscapes.forEach(match => {
      issues.push({
        line: lineIndex + 1,
        column: match.index + 1,
        type: 'unicode_escape',
        message: `Found unicode escape (${match[0]})`,
        severity: 'error'
      });
    });
  });
  
  return issues;
}

/**
 * Auto-fixes unicode escape issues
 */
function autoFixContent(content) {
  let fixed = content;
  
  // Fix escaped newlines
  fixed = fixed.replace(/\\n/g, '\n');
  
  // Fix escaped quotes
  fixed = fixed.replace(/\\"/g, '"');
  fixed = fixed.replace(/\\'/g, "'");
  
  // Fix other escapes
  fixed = fixed.replace(/\\t/g, '  ');
  fixed = fixed.replace(/\\r/g, '');
  
  return fixed;
}

/**
 * Validates a single file
 */
function validateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = detectUnicodeEscapes(content);
    
    return {
      filePath,
      isValid: issues.length === 0,
      issues,
      content,
      fixedContent: issues.length > 0 ? autoFixContent(content) : null
    };
  } catch (error) {
    return {
      filePath,
      isValid: false,
      issues: [{
        line: 1,
        column: 1,
        type: 'file_error',
        message: `Error reading file: ${error.message}`,
        severity: 'error'
      }],
      content: '',
      fixedContent: null
    };
  }
}

/**
 * Gets list of staged files for commit
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    log('Warning: Could not get staged files. Checking all TypeScript/React files.', 'yellow');
    return [];
  }
}

/**
 * Gets all TypeScript/React files in src directory
 */
function getAllSourceFiles() {
  const srcDir = path.join(process.cwd(), 'src');
  const files = [];
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }
  
  scanDirectory(srcDir);
  return files;
}

/**
 * Filters files that should be validated
 */
function shouldValidateFile(filePath) {
  return filePath.match(/\.(ts|tsx|js|jsx)$/) && 
         !filePath.includes('node_modules') &&
         !filePath.includes('.d.ts');
}

/**
 * Main validation function
 */
function validateCode(options = {}) {
  const { fix = false, staged = false, verbose = false } = options;
  
  log('\n🔍 Starting code validation...', 'cyan');
  
  // Get files to validate
  let filesToCheck = [];
  if (staged) {
    filesToCheck = getStagedFiles().filter(shouldValidateFile);
  } else {
    filesToCheck = getAllSourceFiles().filter(shouldValidateFile);
  }
  
  if (filesToCheck.length === 0) {
    log('✅ No files to validate.', 'green');
    return { success: true, fixedFiles: [] };
  }
  
  log(`📁 Checking ${filesToCheck.length} files...`, 'blue');
  
  const results = [];
  const invalidFiles = [];
  const fixedFiles = [];
  
  // Validate each file
  filesToCheck.forEach(filePath => {
    const result = validateFile(filePath);
    results.push(result);
    
    if (!result.isValid) {
      invalidFiles.push(result);
      
      if (verbose) {
        log(`\n❌ ${filePath}:`, 'red');
        result.issues.forEach(issue => {
          log(`   Line ${issue.line}, Col ${issue.column}: ${issue.message}`, 'yellow');
        });
      }
      
      // Auto-fix if requested
      if (fix && result.fixedContent && result.fixedContent !== result.content) {
        try {
          fs.writeFileSync(filePath, result.fixedContent, 'utf8');
          fixedFiles.push(filePath);
          log(`🔧 Fixed: ${filePath}`, 'green');
        } catch (error) {
          log(`❌ Failed to fix ${filePath}: ${error.message}`, 'red');
        }
      }
    } else if (verbose) {
      log(`✅ ${filePath}`, 'green');
    }
  });
  
  // Generate summary
  const validFiles = results.length - invalidFiles.length;
  const totalIssues = invalidFiles.reduce((sum, file) => sum + file.issues.length, 0);
  
  log('\n📊 Validation Summary:', 'bold');
  log(`   Total files: ${results.length}`, 'white');
  log(`   Valid files: ${validFiles}`, validFiles === results.length ? 'green' : 'yellow');
  log(`   Invalid files: ${invalidFiles.length}`, invalidFiles.length === 0 ? 'green' : 'red');
  log(`   Total issues: ${totalIssues}`, totalIssues === 0 ? 'green' : 'red');
  
  if (fix && fixedFiles.length > 0) {
    log(`   Fixed files: ${fixedFiles.length}`, 'green');
  }
  
  const success = invalidFiles.length === 0;
  
  if (success) {
    log('\n🎉 All files passed validation!', 'green');
  } else {
    log('\n⚠️  Some files have issues that need attention.', 'yellow');
    
    if (!fix) {
      log('\n💡 Run with --fix to automatically resolve unicode escape issues:', 'cyan');
      log('   npm run fix:unicode-escapes', 'cyan');
    }
    
    log('\n📖 See docs/DEVELOPMENT_GUIDELINES.md for more information.', 'blue');
  }
  
  return { success, fixedFiles, invalidFiles: invalidFiles.map(f => f.filePath) };
}

/**
 * Pre-commit hook validation
 */
function preCommitHook() {
  log('\n🚀 Running pre-commit validation...', 'magenta');
  
  const result = validateCode({ staged: true, verbose: true });
  
  if (!result.success) {
    log('\n🚫 COMMIT BLOCKED: Files contain unicode escape errors!', 'red');
    log('\n🔧 To fix these issues:', 'yellow');
    log('   1. Run: npm run fix:unicode-escapes', 'yellow');
    log('   2. Review the changes', 'yellow');
    log('   3. Add the fixed files to staging', 'yellow');
    log('   4. Commit again', 'yellow');
    
    process.exit(1);
  }
  
  log('\n✅ Pre-commit validation passed!', 'green');
}

/**
 * Command line interface
 */
function main() {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    staged: args.includes('--staged'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    preCommit: args.includes('--pre-commit')
  };
  
  if (args.includes('--help') || args.includes('-h')) {
    log('\n📚 Code Validation Script', 'bold');
    log('\nUsage:', 'white');
    log('  node scripts/validate-code.js [options]', 'cyan');
    log('\nOptions:', 'white');
    log('  --fix         Auto-fix unicode escape issues', 'cyan');
    log('  --staged      Only check staged files (for git hooks)', 'cyan');
    log('  --verbose, -v Show detailed output', 'cyan');
    log('  --pre-commit  Run as pre-commit hook (blocks commit on errors)', 'cyan');
    log('  --help, -h    Show this help message', 'cyan');
    log('\nExamples:', 'white');
    log('  node scripts/validate-code.js --verbose', 'cyan');
    log('  node scripts/validate-code.js --fix --staged', 'cyan');
    log('  node scripts/validate-code.js --pre-commit', 'cyan');
    return;
  }
  
  if (options.preCommit) {
    preCommitHook();
  } else {
    const result = validateCode(options);
    process.exit(result.success ? 0 : 1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateCode,
  detectUnicodeEscapes,
  autoFixContent,
  validateFile
};