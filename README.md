# Typescript Transform

This repository contains all my experiments on typescript transform. I have added an initial class transformation example

**source:**
```js
import { CustomElement } from 'custom-elements-ts';
@CustomElement()
export class CounterElement {
  
} 

export class StepperElement {}
```

**transformed:**

```js
import { CustomElement, CustomHTMLElement } from 'custom-elements-ts';
@CustomElement()
export class CounterElement  extends CustomHTMLElement {
  
} 

// not transformed since it has not been decorated with @CustomElement
export class StepperElement {}
```