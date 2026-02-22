/**
 * Formats data for display, converting objects to JSON strings if necessary.
 */
export const formatData = (data: any): string => {
  if (typeof data === 'string') {
    return data
  }
  return JSON.stringify(data, null, 2)
}

/**
 * Formats a date or timestamp into a local time string.
 */
export const formatTime = (date: string | number | Date = new Date()): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  return d.toLocaleTimeString('zh-CN')
}
