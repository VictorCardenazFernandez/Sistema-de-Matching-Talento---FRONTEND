import { API_URL, buildHeaders } from './auth.service'

export async function getMyCompany(token) {
  const res = await fetch(`${API_URL}/company/me`, { headers: buildHeaders(token) })
  if (!res.ok) throw new Error('COMPANY_NOT_FOUND')
  return res.json()
}

export async function updateMyCompany(data, token, exists) {
  const url = exists ? `${API_URL}/company/edit` : `${API_URL}/company/create`
  const method = exists ? 'PUT' : 'POST'
  const res = await fetch(url, {
    method,
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al guardar empresa')
  return res.json()
}

export async function getMyVacancies(token) {
  const res = await fetch(`${API_URL}/vacancy/vac/company/me`, { headers: buildHeaders(token) })
  if (!res.ok) throw new Error('Error obteniendo vacantes')
  return res.json()
}

export async function createVacancy(data, token) {
  const res = await fetch(`${API_URL}/vacancy/create`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error creando vacante')
  return res.json()
}

export async function deleteVacancy(id, token) {
  const res = await fetch(`${API_URL}/vacancy/del/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  })
  if (!res.ok) throw new Error('Error eliminando vacante')
  return res.json()
}

export async function getApplicants(vacancyId, token) {
  const res = await fetch(`${API_URL}/apply/applicants/vacancies/${vacancyId}`, {
    headers: buildHeaders(token),
  })
  if (!res.ok) throw new Error('Error obteniendo postulantes')
  return res.json()
}