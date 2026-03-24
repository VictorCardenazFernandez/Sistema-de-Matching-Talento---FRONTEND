export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function buildHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
