import { createContext, useContext } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { YMap } from "yjs/dist/src/internals";
import { Space } from "~/db/types";

export const SpaceContext = createContext<readonly [Space, SetStoreFunction<Space>, YMap<unknown>]>()
export function useSpace() {
  const value = useContext(SpaceContext)
  if (!value) {
    throw new Error(`Please wrap useSpace in a SpaceContext.Provider`)
  }
  return value
}
