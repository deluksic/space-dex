import type { Card } from './types'

export function yesCount(card: Card) {
  return Object.values(card.responses)
    .filter(response => response === 'yes')
    .length
}

export function noCount(card: Card) {
  return Object.values(card.responses)
    .filter(response => response === 'no')
    .length
}
