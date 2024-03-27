import Vue from 'vue'
export const statusColorDirective = (el: HTMLElement, { value }: any) => {
    // this will be called for both `mounted` and `updated`
    let valueTrueClass = 'text-green'
    let valueFalseClass = 'text-red'
    el.classList.add(value === true ? valueTrueClass : valueFalseClass);
    el.classList.remove(value === false ? valueTrueClass : valueFalseClass);
  }
