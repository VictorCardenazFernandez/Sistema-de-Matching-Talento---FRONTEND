import { useState, useEffect, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { API_URL, buildHeaders } from '../services/auth.service'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

export default function Profile() {
  const { user: auth0User, getAccessTokenSilently } = useAuth0()
  const { role } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '',
    city: '', country: '', linkedin_url: '',
    portfolio_url: '', resume_url: '', skills: '',
    experience_years: 0,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [cvUrl, setCvUrl] = useState(null)

  useEffect(() => {
    if (role === 'company' || role === 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [role])

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const token = await getAccessTokenSilently()

      const res = await fetch(`${API_URL}/candidate/me`, { headers: buildHeaders(token) })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setForm({
          first_name:       data.profile?.first_name       || '',
          last_name:        data.profile?.last_name        || '',
          phone:            data.profile?.phone            || '',
          city:             data.profile?.city             || '',
          country:          data.profile?.country          || '',
          linkedin_url:     data.profile?.linkedin_url     || '',
          portfolio_url:    data.profile?.portfolio_url    || '',
          resume_url:       data.profile?.resume_url       || '',
          skills:           data.profile?.skills           || '',
          experience_years: data.profile?.experience_years || 0,
        })
      }

      const cvRes = await fetch(`${API_URL}/file/candidate/my-cv`, { headers: buildHeaders(token) })
      if (cvRes.ok) {
        const cvData = await cvRes.json()
        setCvUrl(cvData.signedUrl)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleChange = (e) => {
    const val = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: val }))
    setSaved(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      const res = await fetch(`${API_URL}/candidate/me/edit`, {
        method: 'PUT',
        headers: buildHeaders(token),
        body: JSON.stringify({ ...form, experience_years: parseInt(form.experience_years) || 0 }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  const handleResume = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingResume(true)
    try {
      const token = await getAccessTokenSilently()
      const formData = new FormData()
      formData.append('cv', file)
      const res = await fetch(`${API_URL}/file/candidate/upload-cv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) throw new Error('Error al subir CV')
      setResumeUploaded(true)
      const cvRes = await fetch(`${API_URL}/file/candidate/my-cv`, { headers: buildHeaders(token) })
      if (cvRes.ok) {
        const cvData = await cvRes.json()
        setCvUrl(cvData.signedUrl)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingResume(false)
    }
  }

  const displayName = form.first_name
    ? `${form.first_name} ${form.last_name}`.trim()
    : auth0User?.name || auth0User?.email || 'Usuario'

  if (loadingProfile) {
    return <div className="route-loading"><div className="route-loading__spinner" /></div>
  }

  return (
    <main className="profile-page">
      <div className="container">
        <div className="profile-layout">

          <aside className="profile-sidebar animate-fade-up">
            <div className="profile-avatar">
              {auth0User?.picture
                ? <img src={auth0User.picture} alt={displayName} />
                : <span>{displayName[0].toUpperCase()}</span>}
            </div>
            <h2 className="profile-name">{displayName}</h2>
            <p className="profile-email">{auth0User?.email}</p>

            {profile?.user?.role && (
              <span className="profile-role-badge">
                {profile.user.role === 'company' ? '🏢 Empresa' : '👤 Candidato'}
              </span>
            )}

            <div className="profile-resume">
              <p className="profile-resume__label">CV / Portafolio</p>

              <button
                className="profile-resume__btn"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingResume}
              >
                {uploadingResume
                  ? <><span className="loading-spinner" /> Subiendo...</>
                  : resumeUploaded || cvUrl
                    ? <>✓ Reemplazar CV</>
                    : <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M4 5l4-4 4 4M2 12v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> Subir CV (PDF)</>
                }
              </button>

              {cvUrl && (
                <a href={cvUrl} target="_blank" rel="noreferrer" className="profile-resume__btn" style={{ marginTop: '8px', textDecoration: 'none', justifyContent: 'center', display: 'flex' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 10v4h12v-4M8 1v9M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Ver mi CV
                </a>
              )}

              <input ref={fileRef} type="file" accept=".pdf" onChange={handleResume} style={{ display: 'none' }} />
            </div>
          </aside>

          <section className="profile-form-section animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="profile-form-header">
              <h1>Mi Perfil</h1>
              <p>Mantén tu información actualizada para destacar ante los empleadores.</p>
            </div>

            <form className="profile-form" onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Nombre</label>
                  <input className="form-input" type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Tu nombre" />
                </div>
                <div className="form-field">
                  <label className="form-label">Apellido</label>
                  <input className="form-input" type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Tu apellido" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+51 999 999 999" />
                </div>
                <div className="form-field">
                  <label className="form-label">Años de experiencia</label>
                  <input className="form-input" type="number" name="experience_years" value={form.experience_years} onChange={handleChange} min="0" max="50" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Ciudad</label>
                  <input className="form-input" type="text" name="city" value={form.city} onChange={handleChange} placeholder="Lima" />
                </div>
                <div className="form-field">
                  <label className="form-label">País</label>
                  <input className="form-input" type="text" name="country" value={form.country} onChange={handleChange} placeholder="Perú" />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Habilidades <span className="form-label__hint">separadas por coma</span></label>
                <input className="form-input" type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, Python..." />
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">LinkedIn</label>
                  <input className="form-input" type="url" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="form-field">
                  <label className="form-label">Portafolio</label>
                  <input className="form-input" type="url" name="portfolio_url" value={form.portfolio_url} onChange={handleChange} placeholder="https://tuportafolio.com" />
                </div>
              </div>

              {error && (
                <div className="form-error">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="form-save-btn" disabled={saving}>
                  {saving
                    ? <><span className="loading-spinner" /> Guardando...</>
                    : saved
                      ? <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8L6 12L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> ¡Guardado!</>
                      : 'Guardar cambios'
                  }
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}