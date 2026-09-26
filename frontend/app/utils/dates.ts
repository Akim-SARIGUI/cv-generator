/** Convertit une date HTML (yyyy-mm-dd) en ISO accepté par l’API. */
export function toApiDate(value?: string | null) {
  if (!value) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`
  }
  return value
}

export function toInputDate(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}
