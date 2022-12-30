import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { WebrtcProvider } from 'y-webrtc'
import { createEffect, createSignal, onCleanup } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { reconcileYMap } from './reconcileY'
import type { JSMap } from './reconcileY'

export async function createSyncedStore<T extends JSMap>(
  syncID: string,
  password: string,
  online = () => true
) {
  const ydoc = new Y.Doc({ guid: syncID })
  const ymap = ydoc.getMap(syncID)
  const [store, _setStore] = createStore({} as T)
  let sync = true
  function reconcileYMapInTransaction() {
    sync = false
    ydoc.transact(() => {
      reconcileYMap(ymap, store)
    })
    sync = true
  }
  // @ts-expect-error unable to infer ...args
  const setStore: typeof _setStore = (...args) => {
    // @ts-expect-error unable to infer ...args
    _setStore(...args)
    reconcileYMapInTransaction()
  }
  ymap.observeDeep(() => {
    if (sync) {
      // structuredClone super important to disconnect references
      // since solid mangles them
      _setStore(reconcile(structuredClone(ymap.toJSON()) as any))
    }
  })

  // IndexedDB
  const idb = new IndexeddbPersistence(syncID, ydoc)
  onCleanup(() => {
    idb.destroy()
  })

  // WebRTC
  const webrtc = new WebrtcProvider(
    syncID, ydoc,
    // @ts-expect-error wrong types
    {
      password,
      peerOpts: {
        config: {
          iceServers: [
            {
              urls: [
                'stun:relay.metered.ca:80',
                'turn:relay.metered.ca:80',
                'turn:relay.metered.ca:443',
                'turn:relay.metered.ca:443?transport=tcp',
              ],
              username: import.meta.env.VITE_TURN_SERVER_USERNAME,
              credential: import.meta.env.VITE_TURN_SERVER_PASSWORD,
            },
          ],
        } satisfies RTCConfiguration,
      },
    },
  )
  onCleanup(() => {
    webrtc.destroy()
  })
  createEffect(() => {
    if (online()) {
      if (!webrtc.connected) {
        console.log('Connected!')
        webrtc.connect()
      }
    } else {
      console.log('Disconnected!')
      webrtc.disconnect()
    }
  })

  // Wait for first-time sync
  await new Promise<void>(resolve => {
    idb.once('synced', () => {
      // idb sync is valid only if map is non-empty
      if ([...ymap.keys()].length > 0) {
        console.log('idb')
        resolve()
      }
    })
    webrtc.once('synced', () => {
      console.log('webrtc', [...ymap.keys()])
      resolve()
    })
  })

  return [store, setStore, ymap] as const
}

export function createUndoRedo(
  typeScope: Y.AbstractType<any> | Y.AbstractType<any>[]
) {
  // Undo Manager
  const undoManager = new Y.UndoManager(typeScope, {
    captureTimeout: 0,
  })
  const [hasUndo, setHasUndo] = createSignal(false)
  const [hasRedo, setHasRedo] = createSignal(false)
  function updateUndoStates() {
    setHasUndo(undoManager.canUndo())
    setHasRedo(undoManager.canRedo())
  }
  createEffect(() => {
    undoManager.on('stack-cleared', updateUndoStates)
    undoManager.on('stack-item-added', updateUndoStates)
    undoManager.on('stack-item-popped', updateUndoStates)
    undoManager.on('stack-item-updated', updateUndoStates)
  })
  onCleanup(() => {
    undoManager.destroy()
  })
  function undo() {
    undoManager.undo()
  }
  function redo() {
    undoManager.redo()
  }
  return [undo, redo, hasUndo, hasRedo] as const
}
