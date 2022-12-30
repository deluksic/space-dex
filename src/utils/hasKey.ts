type KeysOfUnion<T> = T extends T ? keyof T: never
export function hasKey<T extends Record<string, unknown>, K extends KeysOfUnion<T>>(value: T, key: K) {
  return value[key] !== undefined && key in value
}
