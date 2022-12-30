export function readFormData(ev: SubmitEvent) {
  const form = ev.currentTarget
  if (!(form instanceof HTMLFormElement)) {
    throw new Error(`Unexpected error, target not HTMLFormElement.`)
  }
  ev.preventDefault()
  return new FormData(form)
}
