import { Accessor, createEffect } from "solid-js";

export function autofocus(element: HTMLElement, accessor?: Accessor<boolean>) {
  createEffect(() => {
    if (!accessor || accessor()) {
      element.focus()
    }
  })
}
