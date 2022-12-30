import { createUUID } from '~/utils/uuid'
import type { UserID } from './types'

export async function createUserID(docID: string, fromLocalStorage = true) {
  const localStorageKey = `userID-${docID}`
  if (fromLocalStorage) {
    const storedKey = localStorage.getItem(localStorageKey)
    if (storedKey !== null) {
      return storedKey as UserID
    }
  }
  const userID = prompt('What is your User ID?', createUUID().slice(-10, -1)) ?? createUUID().slice(-10, -1)
  localStorage.setItem(localStorageKey, userID)
  return userID as UserID
}
