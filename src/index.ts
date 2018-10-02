import { CustomElement } from '../custom-element';

@CustomElement({
  tag: 'counter-element'
})
export class CounterElement {
  
}

// This will not be transformed to `... extends CustomHTMLElement`
// since it is not decorated by CustomElement
export class StepperElement {

}