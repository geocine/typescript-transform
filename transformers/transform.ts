// TODO: figuire out how to use this on rollup.config.js
import * as ts from 'typescript';

export default function transformer(program: ts.Program): Array<ts.TransformerFactory<ts.SourceFile>> {
  const tsSourceTransformers: Array<ts.TransformerFactory<ts.SourceFile>> = 
    trans.map(tran => require(`./${tran}`).default(program))
  return tsSourceTransformers;
}

const trans = [
  'extend-class',
  'add-imports'
]