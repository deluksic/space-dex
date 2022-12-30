import { createEffect } from 'solid-js'
import type { Accessor } from 'solid-js'

export function autofocus(element: HTMLElement, accessor?: Accessor<boolean>) {
  createEffect(() => {
    if (!accessor || accessor()) {
      element.focus()
    }
  })
}
