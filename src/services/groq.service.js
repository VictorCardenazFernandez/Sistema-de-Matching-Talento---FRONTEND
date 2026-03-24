import {
  API_URL,
  buildHeaders
} from './auth.service'

export async function getRecommendedVacancies(token) {
  const res = await fetch(`${API_URL}/ai/recommend/vacancies`, {
    headers: buildHeaders(token)
  })
  if (!res.ok) throw new Error('Error al obtener recomendaciones')
  return res.json()
}

export async function getRecommendedCandidates(vacancyId, token) {
  const res = await fetch(`${API_URL}/ai/recommend/candidates/${vacancyId}`, {
    headers: buildHeaders(token)
  })
  if (!res.ok) throw new Error('Error al obtener recomendaciones')
  return res.json()
}