const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const rootArg = process.argv[2] || 'src';
const rootDir = path.resolve(process.cwd(), rootArg);

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const EXCLUDED_DIRS = new Set(['node_modules', 'dist', 'coverage']);

function shouldProcess(filePath) {
  return CODE_EXTENSIONS.has(path.extname(filePath)) && !filePath.endsWith('.d.ts');
}

function getScriptKind(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.tsx') return ts.ScriptKind.TSX;
  if (ext === '.jsx') return ts.ScriptKind.JSX;
  if (ext === '.js') return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function isConsoleCallExpression(node) {
  if (!ts.isCallExpression(node)) {
    return false;
  }

  const expression = node.expression;

  if (ts.isPropertyAccessExpression(expression)) {
    return ts.isIdentifier(expression.expression) && expression.expression.text === 'console';
  }

  if (ts.isElementAccessExpression(expression)) {
    return ts.isIdentifier(expression.expression) && expression.expression.text === 'console';
  }

  return false;
}

function stripCommentsAndConsole(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath)
  );

  const transformer = (context) => {
    const visit = (node) => {
      if (ts.isDebuggerStatement(node)) {
        return undefined;
      }

      if (ts.isExpressionStatement(node) && isConsoleCallExpression(node.expression)) {
        return undefined;
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (node) => ts.visitNode(node, visit);
  };

  const transformed = ts.transform(sourceFile, [transformer]).transformed[0];

  const printer = ts.createPrinter({
    removeComments: true,
    newLine: ts.NewLineKind.LineFeed,
  });

  const output = printer.printFile(transformed);

  if (output !== sourceText) {
    fs.writeFileSync(filePath, output);
    return true;
  }

  return false;
}

function walk(currentDir, files = []) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        walk(fullPath, files);
      }
      continue;
    }

    if (shouldProcess(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

if (!fs.existsSync(rootDir)) {
  console.error(`Path not found: ${rootArg}`);
  process.exit(1);
}

const files = walk(rootDir);
let changedCount = 0;

for (const filePath of files) {
  if (stripCommentsAndConsole(filePath)) {
    changedCount += 1;
  }
}

console.log(`Cleaned ${changedCount}/${files.length} files in ${rootArg}`);
