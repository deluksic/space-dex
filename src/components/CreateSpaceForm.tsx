import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { createPassword, createSpace } from '~/db/space'
import { createSignal } from 'solid-js'
import { readFormData } from '~/utils/readFormData'
import { reconcileYMap } from '~/utils/reconcileY'
import { useNavigate } from 'solid-start'
import ui from './CreateSpaceForm.module.css'

const SPACE_NAME_PLACEHOLDER = 'Untitled'

export function CreateSpaceForm() {
  const navigate = useNavigate()
  const [spaceName, setSpaceName] = createSignal('')
  function onSubmit(ev: SubmitEvent) {
    const form = ev.target
    if (form instanceof HTMLFormElement && !form.checkValidity()) {
      return false
    }
    const formData = readFormData(ev)
    const name = formData.get('name')
    if (typeof name !== 'string') {
      throw new Error(`Unexpected error, name is not found.`)
    }
    const space = createSpace(name)
    const key = createPassword()
    const ydoc = new Y.Doc()
    const ymap = ydoc.getMap(space.id)
    reconcileYMap(ymap, space)
    const idb = new IndexeddbPersistence(space.id, ydoc)
    idb.on('synced', () => {
      navigate(`/space/${space.id}#pw=${key}`)
    })
  }
  return (
    <>
      <h2 class={ui.heading}>Name your Space!</h2>
      <form
        class={ui.form}
        onSubmit={onSubmit}
      >
        <input
          name='name'
          value={spaceName()}
          required
          placeholder={SPACE_NAME_PLACEHOLDER}
          onInput={ev => setSpaceName(ev.currentTarget.value)}
          autocomplete='off'
        />
        <button type='submit'>Create!</button>
      </form>
      <span class={ui.info}>
        SpaceDex is serverless and relies on P2P network for hosting!
        Your space is stored on your computer in localStorage and E2E encrypted.
        <br />
        See <a href='https://www.inkandswitch.com/local-first' target="_blank">local-first software</a>.
        <br />
        Keep an instance of your space open to host it!
      </span>
    </>
  )
}
