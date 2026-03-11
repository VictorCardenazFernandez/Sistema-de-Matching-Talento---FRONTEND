// auth.service.js — Auth0 flow
// El token lo provee Auth0 via @auth0/auth0-react (useAuth0 hook)
// Este archivo solo expone helpers para llamadas al backend

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function buildHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
