import { compareDates } from '~/utils/compareDate'
import { createUUID } from '../utils/uuid'
import { hasKey } from '~/utils/hasKey'
import { timestampNow } from './timestamp'
import { v4 as uuid4 } from 'uuid'
import type { Space, UserID } from './types'

export const CURRENT_DOC_VERSION = '0.1.0'

export function createSpace(name: string): Space {
  const space: Space = {
    version: CURRENT_DOC_VERSION,
    id: createUUID(),
    name: name.trim(),
    createdTimestamp: timestampNow(),
    cards: {},
  }
  return space
}

export function myCards(space: Space, userID: UserID) {
  return Object.entries(space.cards)
    .filter(([_, card]) =>
      !card.archived &&
      card.createdBy === userID
    )
    .map(([_, card]) => card)
    .sort((a, b) => compareDates(
      new Date(a.createdTimestamp),
      new Date(b.createdTimestamp)
    ))
}

export function pendingCards(space: Space, userID: UserID) {
  return Object.entries(space.cards)
    .filter(([_, card]) =>
      !card.archived &&
      card.createdBy !== userID &&
      !hasKey(card.responses, userID)
    )
    .map(([_, card]) => card)
    .sort((a, b) => compareDates(
      new Date(a.createdTimestamp),
      new Date(b.createdTimestamp)
    ))
}

export function hasUserCreatedACard(space: Space, userID: UserID) {
  for(const card of Object.values(space.cards)) {
    if(card.createdBy === userID) {
      return true
    }
  }
  return false
}

export function createPassword(): string {
  return uuid4().split('-').at(-1)!
}
