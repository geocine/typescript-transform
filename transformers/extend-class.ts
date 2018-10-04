import * as ts from 'typescript';
import { isElementDecorator } from './utils';

// Simple transform add extends CustomElement
export default function extendClass(program: ts.Program, context: ts.TransformationContext, sf: ts.SourceFile) {
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