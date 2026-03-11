import { API_URL, buildHeaders } from './auth.service'

export async function getVacancies(token) {
  const res = await fetch(`${API_URL}/vacancy/all`, { headers: buildHeaders(token) })
  if (!res.ok) throw new Error('Error fetching vacancies')
  return res.json()
}

export async function getVacancyById(id, token) {
  const res = await fetch(`${API_URL}/vacancy/${id}`, { headers: buildHeaders(token) })
  if (!res.ok) throw new Error('Error fetching vacancy')
  return res.json()
}

export async function applyToVacancy(vacancyId, token) {
  const res = await fetch(`${API_URL}/apply/${vacancyId}`, {
    method: 'POST',
    headers: buildHeaders(token),
  })
  if (!res.ok) throw new Error('Error applying to vacancy')
  return res.json()
}

export async function getMyApplications(token) {
  const res = await fetch(`${API_URL}/apply/myvacancies`, {
    headers: buildHeaders(token),
  })
  if (!res.ok) throw new Error('Error fetching applications')
  return res.json()
}

export async function createVacancy(data, token) {
  const res = await fetch(`${API_URL}/vacancy/create`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error creating vacancy')
  return res.json()
}
