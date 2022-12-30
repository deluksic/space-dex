import type { Timestamp } from './types'

export function timestampNow(): Timestamp {
  return Date.now() as Timestamp
}
