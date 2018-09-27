# Typescript Transform

This repository contains all my experiments on typescript transform. I have added an initial class transformation example

**source:**
```js
export class CounterElement {
  
} 
```

**transpiled:** (normal tsc)
```
 npm run build.tsc
```

```js
export class CounterElement {
  
}
```

**transpiled:** (using transformer build.ts)
```
 npm run build
```

```js
export class CounterElement extends CustomHTMLElement {
  
}
```