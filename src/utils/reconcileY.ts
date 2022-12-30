import * as Y from 'yjs'

type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean

type Key = string | number | symbol
export type JSMap = Record<Key, unknown>

function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

export function reconcileYMap(ymap: Y.Map<unknown>, map: JSMap) {
  for (const [key, value] of Object.entries(map)) {
    if (typeof key !== 'string') {
      throw new Error()
    }
    if (isPrimitive(value)) {
      ymap.set(key, value)
      continue
    }
    if (Array.isArray(value)) {
      throw new Error(`Arrays not supported yet.`)
    }
    if (typeof value === 'object' && value !== null) {
      const prevmap = ymap.get(key)
      if (prevmap instanceof Y.Map) {
        reconcileYMap(prevmap, value as JSMap)
      } else {
        ymap.set(key, new Y.Map(Object.entries(value)))
      }
      continue
    }
    console.error(value)
    throw new Error(`Unreachable code reached using value.`)
  }
  for (const key in [...ymap.keys()]) {
    if (!(key in map)) {
      ymap.delete(key)
    }
  }
}
