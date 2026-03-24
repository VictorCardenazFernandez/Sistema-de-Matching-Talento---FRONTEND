import {
  API_URL,
  buildHeaders
} from './auth.service'

export async function submitCompanyRequest(data, token) {
  const res = await fetch(`${API_URL}/admin/request`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error al enviar solicitud')
  }
  return res.json()
}

export async function getMyRequest(token) {
  const res = await fetch(`${API_URL}/admin/request/me`, {
    headers: buildHeaders(token),
  })
  if (!res.ok) return null
  return res.json()
}

export async function getAllRequests(token) {
  const res = await fetch(`${API_URL}/admin/requests`, {
    headers: buildHeaders(token),
  })
  if (!res.ok) throw new Error('Error al obtener solicitudes')
  return res.json()
}

export async function resolveRequest(requestId, status, token) {
  const res = await fetch(`${API_URL}/admin/requests/${requestId}/resolve`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Error al resolver solicitud')
  return res.json()
}

export async function getGlobalStats(token) {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: buildHeaders(token),
  })
  if (!res.ok) throw new Error('Error al obtener estadísticas')
  return res.json()
}

export async function getAllUsers(token) {
  const res = await fetch(`${API_URL}/admin/users`, { headers: buildHeaders(token) })
  if (!res.ok) throw new Error('Error')
  return res.json()
}

export async function getAllVacanciesAdmin(token) {
  const res = await fetch(`${API_URL}/admin/vacancies`, { headers: buildHeaders(token) })
  if (!res.ok) throw new Error('Error')
  return res.json()
}
