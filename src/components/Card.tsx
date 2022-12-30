import { createSignal, Show } from "solid-js";
import { noCount, yesCount } from "~/db/card";
import { timestampNow } from "~/db/timestamp";
import { assertYesNoResponse, Card, CardID } from "~/db/types";
import { autofocus } from "~/utils/autofocus";
import { readFormData } from "~/utils/readFormData";
import { createUUID } from "~/utils/uuid";
import { useSpace } from "./SpaceContext";
import ui from './Card.module.css'
import { useUserID } from "./UserIDContext";

export function CardComponent(card: Card) {
  const userID = useUserID()
  const [space, setSpace] = useSpace()
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
    <div class={ui.card}>
      <h3 class={ui.title}>{card.title}</h3>
      <form class={ui.response} onSubmit={onRespond}>
        <button type='submit' name='response' value='no'>No</button>
        <button type='submit' name='response' value='yes'>Yes</button>
      </form>
    </div>
  )
}

export function MyCardComponent(card: Card) {
  const [space, setSpace] = useSpace()
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
}

export function CreateCard(props: CreateCardProps) {
  const userID = useUserID()
  const [space, setSpace] = useSpace()
  function createCard(ev: SubmitEvent) {
    const formData = readFormData(ev)
    const { submitter } = ev
    if (!(submitter instanceof HTMLButtonElement)) {
      throw new Error(`Unexpected error, expected submitter to be HTMLButtonElement.`)
    }
    if (submitter.value === 'create') {
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
    }
    props.onSubmit?.()
  }
  return (
    <div class={ui.card}>
      <form onSubmit={createCard}>
        <input
          ref={autofocus}
          name='title'
          class={ui.titleInput}
          required
        />
        <section class={ui.response}>
          <button type='submit' value='create'>Create</button>
          <button type='submit' value='cancel'>Cancel</button>
        </section>
      </form>
    </div>
  )
}