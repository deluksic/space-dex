import { A } from '@solidjs/router'
import { CardComponent, CreateCard, MyCardComponent } from '~/components/Card'
import { For, Show, Suspense, createResource, createSignal } from 'solid-js'
import { SpaceContext, useSpace } from '~/components/SpaceContext'
import { UserIDContext, useUserID } from '~/components/UserIDContext'
import { autofocus } from '~/utils/autofocus'
import { createSyncedStore, createUndoRedo } from '~/utils/createSyncedStore'
import { createUserID } from '~/db/user'
import { hasUserCreatedACard, myCards, pendingCards } from '~/db/space'
import { isServer } from 'solid-js/web'
import { projectVersion } from '~/utils/projectVersion'
import { useLocation, useParams } from 'solid-start'
import ui from './[id].module.css'
import type { Space, UserID } from '~/db/types'

const autofocusFix = autofocus

function SpaceName() {
  const [editingSpaceName, setEditingSpaceName] = createSignal(false)
  const [space, setSpace] = useSpace()
  return (
    <Show when={!editingSpaceName()} fallback={
      <input
        ref={autofocusFix}
        class={ui.spaceName}
        value={space.name}
        onInput={ev => setSpace('name', ev.currentTarget.value)}
        onChange={() => setEditingSpaceName(false)}
        onBlur={() => setEditingSpaceName(false)}
      />
    }>
      <h1 class={ui.spaceName} title='Space name' onDblClick={() => setEditingSpaceName(true)}>{space.name}</h1>
    </Show>
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
      <span>Create <A href='/'>New Space</A></span>
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

function CardControls(props: { adding: boolean, setAdding: (a: boolean) => void }) {
  const [_, __, ymap] = useSpace()
  const [undo, redo, hasUndo, hasRedo] = createUndoRedo(ymap)
  return (
    <section class={ui.cardControls}>
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

async function invite() {
  const { navigator } = window
  await navigator.clipboard.writeText(document.URL)
  alert(`Sharing link copied to clipboard!\n\n${document.URL}`)
}

function NetworkControls(props: { online: boolean, setOnline: (value: boolean) => void }) {
  return (
    <div class={ui.networkControls}>
      <button onClick={invite}>Invite</button>
      {' '}
      <label>
        <input
          type='checkbox'
          checked={props.online}
          onChange={ev => props.setOnline(ev.currentTarget.checked)}
        /> Online
      </label>
    </div>
  )
}

export default function SpaceComponent() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (isServer) {
    return null
  }
  const params = useParams()
  const location = useLocation()
  const password = () => new URLSearchParams(location.hash.split('#')[1]).get('pw')!

  const [adding, setAdding] = createSignal(false)
  const [online, setOnline] = createSignal(true)

  const [userID, { refetch: refetchUserID }] = createResource<UserID, string>(
    () => params.id,
    (docID, { refetching }) => createUserID(docID, !(refetching as boolean))
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
              <MyCards refetchUserID={refetchUserID} />
              <div class={ui.main}>
                <div class={ui.mainTopBar}>
                  <SpaceName />
                  <NetworkControls online={online()} setOnline={setOnline} />
                </div>
                <Deck adding={adding()} setAdding={setAdding} />
                <CardControls adding={adding()} setAdding={setAdding} />
                <span class={ui.projectVersion}>version {projectVersion()}</span>
              </div>
            </main>
          </SpaceContext.Provider>
        </UserIDContext.Provider>
      </Show>
    </Suspense>
  )
}
