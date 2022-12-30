import { createContext, useContext } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { UserID } from '~/db/types'

export const UserIDContext = createContext<Accessor<UserID>>()
export function useUserID() {
  const value = useContext(UserIDContext)
  if (!value) {
    throw new Error(`Please wrap useUserID in a UserIDContext.Provider`)
  }
  return value
}
