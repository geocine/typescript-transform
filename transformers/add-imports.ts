import * as ts from 'typescript';
import { isElementImport } from './utils';

function addImports(context: ts.TransformationContext, sf: ts.SourceFile) {
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
}

export default (_program) => (context: ts.TransformationContext) => (file: ts.SourceFile) => addImports(context, file);