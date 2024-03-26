import Vue from 'vue'

const valueTrueClass = 'text-green'
const valueFalseClass = 'text-red'
const valueNullClass = 'text-yellow'
let getClass = function (v: boolean | null): string {
  return {
    true: valueTrueClass,
    false: valueFalseClass,
    null: valueNullClass,
  }['' + v]!;
}
let without = function(v: boolean | null): string[] {
  return [valueTrueClass, valueFalseClass, valueNullClass].filter(s => s !== getClass(v));
}

export const statusColorDirective = (el: HTMLElement, { value }: { value: boolean | null }) => {
    // this will be called for both `mounted` and `updated`
    el.classList.add(getClass(value));
    el.classList.remove(...without(value));
}
