// TODO: figuire out how to use this on rollup.config.js
import * as ts from 'typescript';

export default function transformer(program: ts.Program): Array<ts.TransformerFactory<ts.SourceFile>> {
  const tsSourceTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = [
    (context: ts.TransformationContext) => (file: ts.SourceFile) => extendClass(program, context, file),
    (context: ts.TransformationContext) => (file: ts.SourceFile) => addImports(context, file)
  ]
  return tsSourceTransformers;
}

// Simple transform add extends CustomElement
export function extendClass(program: ts.Program, context: ts.TransformationContext, sf: ts.SourceFile) {
  const visitor: ts.Visitor = (node) => {
    // Add CustomHTMLElement to import
    if (!ts.isClassDeclaration(node)) {
      return ts.visitEachChild(node, visitor, context);
    }

    let isCustomElement = false;

    if (ts.isClassDeclaration(node)) {
      ts.visitNodes(node.decorators, (node: ts.Decorator) => {
        if (isElementDecorator(node, program.getTypeChecker())) {
          isCustomElement = true;
        }
        return node;
      });
    }
    
    // only transform if class is decorated with @CustomElement
    if(!isCustomElement){
      return node;
    }
    
    return ts.updateClassDeclaration(
        node,
        node.decorators,
        node.modifiers,
        node.name,
        node.typeParameters,
        [ts.createHeritageClause(
          ts.SyntaxKind.ExtendsKeyword,
          [ts.createExpressionWithTypeArguments(
            [],
            ts.createIdentifier('CustomHTMLElement')
          )]
        )],
        node.members
      );
  };
  return ts.visitNode(sf, visitor);
};

export function addImports(context: ts.TransformationContext, sf: ts.SourceFile) {
  const visitor: ts.Visitor = (node) => {
    if (ts.isImportDeclaration(node) && isElementImport(node, sf)) {
      const { importClause: { namedBindings } } = node
      const { elements } = namedBindings as ts.NamedImports
    
      const specifiers: Array<ts.ImportSpecifier> = [...elements]
    
      const hasCustomHTMLElementImport = elements.some(n => n.getText().indexOf('CustomHTMLElement') > -1)
    
      if (!hasCustomHTMLElementImport) {
        specifiers.push(ts.createImportSpecifier(void 0, ts.createIdentifier('CustomHTMLElement')))
      }
      
      return ts.createImportDeclaration(
        [],
        node.modifiers,
        ts.createImportClause(void 0, ts.createNamedImports(specifiers)),
        node.moduleSpecifier
      )
    }
    return ts.visitEachChild(node, visitor, context);
  };
  return ts.visitNode(sf, visitor);
};

function isElementDecorator(node: ts.Decorator, typeChecker: ts.TypeChecker): boolean {
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

function isElementImport(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): boolean {
  const text = sourceFile.text.substring(node.getStart(sourceFile), node.getEnd())
  return text.indexOf('custom-elements-ts') > -1
}