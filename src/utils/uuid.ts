import { v4 } from 'uuid'
import { BrandedString } from '../db/types';

export function createUUID<T extends BrandedString<string>>(): T {
  return v4() as T
}
