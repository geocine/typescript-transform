// TODO: figuire out how to use this on rollup.config.js
import * as ts from 'typescript';
import extendClass from './extend-class';
import addImports from './add-imports';

export function transformer(program: ts.Program): Array<ts.TransformerFactory<ts.SourceFile>> {
  const tsSourceTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = [
    (context: ts.TransformationContext) => (file: ts.SourceFile) => extendClass(program, context, file),
    (context: ts.TransformationContext) => (file: ts.SourceFile) => addImports(context, file)
  ]
  return tsSourceTransformers;
}

