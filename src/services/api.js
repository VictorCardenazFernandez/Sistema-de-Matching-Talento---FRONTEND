import {
  API_URL,
  buildHeaders
} from './auth.service'

export async function updateProfile(data, token) {
  const res = await fetch(`${API_URL}/api/users/profile`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error updating profile')
  return res.json()
}

export async function uploadResume(file, token) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/api/files/resume`, {
    method: 'POST',
    headers: { Authorization: token ? `Bearer ${token}` : '' },
    body: formData,
  })
  if (!res.ok) throw new Error('Error uploading resume')
  return res.json()
}

export async function getMyCv(token) {
  const res = await fetch(`${API_URL}/file/candidate/my-cv`, {
    headers: buildHeaders(token)
  })
  if (!res.ok) throw new Error('CV no encontrado')
  return res.json()
}
