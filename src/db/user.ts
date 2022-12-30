import { createUUID } from '~/utils/uuid'
import type { UserID } from './types'

export async function createUserID(docID: string, fromLocalStorage = true) {
  const localStorageKey = `userID-${docID}`
  const storedUserID = localStorage.getItem(localStorageKey) as UserID | null
  if (fromLocalStorage) {
    if (storedUserID !== null) {
      return storedUserID
    }
  }
  const userID = prompt('What is your User ID?', createUUID().slice(-8, -1)) ?? storedUserID ?? createUUID().slice(-8, -1)
  localStorage.setItem(localStorageKey, userID)
  return userID as UserID
}
