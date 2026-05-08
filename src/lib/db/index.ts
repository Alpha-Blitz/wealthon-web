export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export function ok<T>(data: T): Result<T> {
  return { data, error: null }
}

export function err<T>(message: string): Result<T> {
  return { data: null, error: message }
}
