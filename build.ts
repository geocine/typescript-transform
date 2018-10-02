import * as fs from 'fs';
import * as ts from 'typescript';


const fileNames = fs.readdirSync('./src').map(file => `./src/${file}`);
const tsConfigPath = 'tsconfig.json';
const projectFolder = '.';
const tsConfigJson = ts.parseConfigFileTextToJson(tsConfigPath, fs.readFileSync(tsConfigPath).toString())
const compilerOptions = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, projectFolder, tsConfigPath)

const program = ts.createProgram(fileNames, compilerOptions.options);

// Simple transform add extends CustomElement
function changeTransform(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
  const transformer: ts.Transformer<ts.SourceFile> = (sf: ts.SourceFile) => {
    const visitor: ts.Visitor = (node) => {
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

      const importDeclaration = ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(undefined, ts.createNamedImports([
          ts.createImportSpecifier(undefined, ts.createIdentifier('CustomHTMLElement'))
        ])),
        ts.createLiteral('custom-element-ts')
      )
      
      return [
        importDeclaration,
        ts.updateClassDeclaration(
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
        )
      ];
    };
    return ts.visitNode(sf, visitor);
  };
  return transformer;
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
  return text.indexOf('../custom-element') > -1
}

program.emit(undefined, undefined, undefined, undefined, { before: [changeTransform] });

console.log('Build Successful!');