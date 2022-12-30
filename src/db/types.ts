export type BrandedString<T extends string> = string & { __type: T }

export type SpaceID = BrandedString<'SpaceID'>
export type CardID = BrandedString<'CardID'>
export type UserID = BrandedString<'UserID'>

export type Timestamp = number & { __type: 'Timestamp' }

export type Card = {
  id: CardID
  createdBy: UserID
  createdTimestamp: Timestamp
  title: string
  responses: Record<UserID, 'yes' | 'no'>
  archived: boolean
}

export type Space = {
  id: SpaceID
  name: string
  createdTimestamp: Timestamp
  cards: Record<CardID, Card>
}

export function assertYesNoResponse(response: string): response is 'yes' | 'no' {
  return ['yes', 'no'].includes(response)
}
