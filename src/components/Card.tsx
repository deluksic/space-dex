import { For, Show } from 'solid-js'
import { assertYesNoResponse } from '~/db/types'
import { autofocus } from '~/utils/autofocus'
import { createUUID } from '~/utils/uuid'
import { hasUserCreatedACard, pendingCards } from '~/db/space'
import { noCount, yesCount } from '~/db/card'
import { readFormData } from '~/utils/readFormData'
import { timestampNow } from '~/db/timestamp'
import { useSpace } from './SpaceContext'
import { useUserID } from './UserIDContext'
import ui from './Card.module.css'
import type { Accessor } from 'solid-js'
import type { Card, CardID } from '~/db/types'

const autofocusFix = autofocus

export function CardComponent(card: Card, i: Accessor<number>) {
  const userID = useUserID()
  const [_, setSpace] = useSpace()
  function onRespond(ev: SubmitEvent) {
    const { submitter } = ev
    if (!(submitter instanceof HTMLButtonElement)) {
      throw new Error(`Unexpected error, expected submitter to be HTMLButtonElement.`)
    }
    ev.preventDefault()
    if (assertYesNoResponse(submitter.value)) {
      setSpace('cards', card.id, 'responses', userID(), submitter.value)
    }
  }
  return (
    <div class={ui.card} style={{ ['--index']: i() }}>
      <h3 class={ui.title}>{card.title}</h3>
      <form class={ui.response} onSubmit={onRespond}>
        <button type='submit' name='response' value='no'>No</button>
        <button type='submit' name='response' value='yes'>Yes</button>
      </form>
    </div>
  )
}

export function MyCardComponent(card: Card) {
  const [_, setSpace] = useSpace()
  function archive() {
    setSpace('cards', card.id, 'archived', true)
  }
  return (
    <div class={ui.mycard}>
      <h3 class={ui.title}>{card.title}</h3>
      yes: {yesCount(card)} | no: {noCount(card)}
      {' '}
      <Show when={!card.archived} fallback={<span>Archived</span>}>
        <button onClick={archive}>Archive</button>
      </Show>
    </div>
  )
}

type CreateCardProps = {
  onSubmit: () => void
  onCancel: () => void
}

export function CreateCard(props: CreateCardProps) {
  const userID = useUserID()
  const [_, setSpace] = useSpace()
  function createCard(ev: SubmitEvent) {
    const formData = readFormData(ev)
    const { submitter } = ev
    if (!(submitter instanceof HTMLButtonElement)) {
      throw new Error(`Unexpected error, expected submitter to be HTMLButtonElement.`)
    }
    const title = formData.get('title')
    if (typeof title !== 'string') {
      throw new Error(`Title missing in form data.`)
    }
    const card: Card = {
      id: createUUID<CardID>(),
      title,
      createdBy: userID(),
      createdTimestamp: timestampNow(),
      responses: {},
      archived: false,
    }
    setSpace('cards', card.id, card)
    props.onSubmit()
  }
  return (
    <div class={ui.createCard}>
      <form onSubmit={createCard}>
        <input
          ref={autofocusFix}
          name='title'
          class={ui.titleInput}
          required
        />
        <section class={ui.response}>
          <button type='reset' onClick={ev => {
            ev.preventDefault()
            props.onCancel()
          }}>Cancel</button>
          <button type='submit'>Create</button>
        </section>
      </form>
    </div>
  )
}

export function Deck(props: { adding: boolean, setAdding: (a: boolean) => void }) {
  const userID = useUserID()
  const [space] = useSpace()
  return (
    <section class={ui.deck}>
      <For each={pendingCards(space, userID()!).slice(0, 4)} fallback={
        <Show when={!props.adding}>
          <Show when={hasUserCreatedACard(space, userID())} fallback={
            <h2 class={ui.centralMessage}>Use the + button to create your first card!</h2>
          }>
            <h2 class={ui.centralMessage}>All Caught Up!</h2>
          </Show>
        </Show>
      }>
        {CardComponent}
      </For>
      <Show when={props.adding}>
        <CreateCard
          onSubmit={() => props.setAdding(false)}
          onCancel={() => props.setAdding(false)}
        />
      </Show>
    </section>
  )
}
