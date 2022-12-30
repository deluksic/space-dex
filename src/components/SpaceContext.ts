import { createContext, useContext } from 'solid-js'
import type { SetStoreFunction } from 'solid-js/store'
import type { Space } from '~/db/types'
import type { YMap } from 'yjs/dist/src/internals'

export const SpaceContext = createContext<readonly [Space, SetStoreFunction<Space>, YMap<unknown>]>()
export function useSpace() {
  const value = useContext(SpaceContext)
  if (!value) {
    throw new Error(`Please wrap useSpace in a SpaceContext.Provider`)
  }
  return value
}
