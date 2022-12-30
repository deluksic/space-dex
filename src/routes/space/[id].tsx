import { A } from "@solidjs/router"
import { createResource, createSignal, For, Show, Suspense } from "solid-js"
import { useLocation, useParams } from "solid-start"
import { CardComponent, CreateCard, MyCardComponent } from "~/components/Card"
import { SpaceContext, useSpace } from "~/components/SpaceContext"
import { UserIDContext, useUserID } from "~/components/UserIDContext"
import { hasUserCreatedACard, myCards, pendingCards } from "~/db/space"
import type { Space, UserID } from "~/db/types"
import { createUserID } from "~/db/user"
import { autofocus } from "~/utils/autofocus"
import { createSyncedStore, createUndoRedo } from "~/utils/createSyncedStore"
import ui from './[id].module.css'

const autofocusFix = autofocus

function SpaceName() {
  const [editingSpaceName, setEditingSpaceName] = createSignal(false)
  const [space, setSpace] = useSpace()
  return (
    <div class={ui.spaceName}>
      <Show when={!editingSpaceName()} fallback={
        <input
          ref={autofocusFix}
          value={space.name}
          onInput={ev => setSpace('name', ev.currentTarget.value)}
          onChange={() => setEditingSpaceName(false)}
          onBlur={() => setEditingSpaceName(false)}
        />
      }>
        <h1 title='Space name' onDblClick={() => setEditingSpaceName(true)}>{space.name}</h1>
      </Show>
    </div>
  )
}

function MyCards(props: { refetchUserID: () => void }) {
  const userID = useUserID()
  const [space] = useSpace()
  return (
    <section class={ui.myCardsContainer}>
      <h2 class={ui.myCardsTitle}>
        My Cards
      </h2>
      <div class={ui.userId}>
        User ID: <span>{userID()!}</span> <button onClick={props.refetchUserID}>Change</button>
      </div>
      <div class={ui.myCardsList}>
        <For each={myCards(space, userID()!)}>
          {MyCardComponent}
        </For>
      </div>
      <span>by <A href='/'>SpaceDex</A></span>
    </section>
  )
}

function Deck(props: { adding: boolean, setAdding: (a: boolean) => void }) {
  const userID = useUserID()
  const [space] = useSpace()
  return (
    <section class={ui.deck}>
      <For each={pendingCards(space, userID()!)} fallback={
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
        <CreateCard onSubmit={() => props.setAdding(false)} />
      </Show>
    </section>
  )
}

function BottomControls(props: { adding: boolean, setAdding: (a: boolean) => void }) {
  const [_, __, ymap] = useSpace()
  const [undo, redo, hasUndo, hasRedo] = createUndoRedo(ymap)
  return (
    <section class={ui.bottomControls}>
      <button disabled={!hasUndo()} onClick={undo}>Undo</button>
      <button
        class={ui.addNewButton}
        disabled={props.adding}
        onClick={() => props.setAdding(true)}
      >+</button>
      <button disabled={!hasRedo()} onClick={redo}>Redo</button>
    </section>
  )
}

export default function SpaceComponent() {
  const params = useParams()
  const location = useLocation()
  const password = () => new URLSearchParams(location.hash.split('#')[1]).get('pw')!

  const [adding, setAdding] = createSignal(false)
  const [online, setOnline] = createSignal(true)

  const [userID, { refetch: refetchUserID }] = createResource<UserID, string>(
    () => params.id,
    (docID, { refetching }) => createUserID(docID, !refetching)
  )
  const [spaceStore] = createResource(
    () => createSyncedStore<Space>(
      params.id,
      password(),
      online,
    )
  )
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Show when={userID() && spaceStore()}>
        <UserIDContext.Provider value={() => userID()!}>
          <SpaceContext.Provider value={spaceStore()!}>
            <main class={ui.layout}>
              <div class={ui.controls}>
                <label>
                  <input
                    type='checkbox'
                    checked={online()}
                    onChange={ev => setOnline(ev.currentTarget.checked)}
                  /> Online
                </label>
              </div>
              <SpaceName />
              <MyCards refetchUserID={refetchUserID} />
              <Deck adding={adding()} setAdding={setAdding} />
              <BottomControls adding={adding()} setAdding={setAdding} />
            </main>
          </SpaceContext.Provider>
        </UserIDContext.Provider>
      </Show>
    </Suspense>
  )
}