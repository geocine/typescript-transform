import * as fs from 'fs';
import * as ts from 'typescript';


const fileNames = fs.readdirSync('./src').map(file => `./src/${file}`);
const tsConfigPath = 'tsconfig.json';
const projectFolder = '.';
const tsConfigJson = ts.parseConfigFileTextToJson(tsConfigPath, fs.readFileSync(tsConfigPath).toString())
const compilerOptions = ts.convertCompilerOptionsFromJson(tsConfigJson.config.compilerOptions, projectFolder, tsConfigPath)

const program = ts.createProgram(fileNames, compilerOptions.options);


// Simple transform add extends CustomElement.
const changeTransform = (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
  const transformer: ts.Transformer<ts.SourceFile> = (sf: ts.SourceFile) => {
    const visitor: ts.Visitor = (node) => {
      if (!ts.isClassDeclaration(node)) {
        return ts.visitEachChild(node, visitor, context);
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
  return transformer;
};

program.emit(undefined, undefined, undefined, undefined, { before: [changeTransform] });

console.log('Build Successful!');