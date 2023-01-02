import { Show, children, createComputed, createSignal, onCleanup } from 'solid-js'
import type { ParentProps } from 'solid-js'

export function ShowExit(props: ParentProps<{ when: boolean, exitingClass?: string }>) {
  const exitingClass = () => props.exitingClass ?? 'exiting'
  const element = children(() => props.children)
  const [shouldRender, setShouldRender] = createSignal(props.when)
  function onAnimationEnd() {
    setShouldRender(props.when)
  }

  createComputed(() => {
    if (props.when) {
      setShouldRender(true)
    }
  })

  createComputed(() => {
    const el = element()
    if (el === undefined || el === null) {
      return
    }
    if (!(el instanceof HTMLElement)) {
      console.warn(`Not able to transition`, el)
      setShouldRender(props.when)
      return
    }
    if (props.when) {
      el.classList.remove(exitingClass())
    } else {
      el.classList.add(exitingClass())
      if (el.getAnimations({ subtree: true }).length > 0) {
        el.addEventListener('animationend', onAnimationEnd)
        onCleanup(() => {
          el.removeEventListener('animationend', onAnimationEnd)
        })
      } else {
        onAnimationEnd()
      }
    }
  })

  return (
    <Show when={shouldRender()}>
      {element}
    </Show>
  )
}
