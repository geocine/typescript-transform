import * as ts from 'typescript';

export function isElementDecorator(node: ts.Decorator, typeChecker: ts.TypeChecker): boolean {
  if (!ts.isCallExpression(node.expression)) {
    return false;
  }
  const callExpr = node.expression;

  let identifier: ts.Node;

  if (ts.isIdentifier(callExpr.expression)) {
    identifier = callExpr.expression;
  } else {
    return false;
  }
  return isElementSymbol(identifier, typeChecker);
}

function isElementSymbol(identifier: ts.Node, typeChecker: ts.TypeChecker) {
  // Only handle identifiers, not expressions
  if (!ts.isIdentifier(identifier)) return false;

  const symbol = typeChecker.getSymbolAtLocation(identifier);

  if (!symbol || !symbol.declarations || !symbol.declarations.length) {
    return false;
  }

  const declaration = symbol.declarations[0];

  if (!declaration || !ts.isImportSpecifier(declaration)) {
    return false;
  }

  const name = (declaration.propertyName || declaration.name).text;
  return name === 'CustomElement';
}

export function isElementImport(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): boolean {
  const text = sourceFile.text.substring(node.getStart(sourceFile), node.getEnd())
  return text.indexOf('custom-elements-ts') > -1
}