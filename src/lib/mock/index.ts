export const USE_MOCK =
  process.env.NODE_ENV === 'development' && process.env.USE_MOCK === 'true'

export * from './data'
