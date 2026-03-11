import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
    getMyCompany, updateMyCompany,
    getMyVacancies, createVacancy, deleteVacancy,
    getApplicants
} from '../services/company.service'
import { API_URL, buildHeaders } from '../services/auth.service'
import './Dashboard.css'

const TABS = ['Resumen', 'Vacantes', 'Postulantes', 'Mi Empresa']

export default function Dashboard() {
    const { getToken } = useAuth()
    const [tab, setTab] = useState('Resumen')
    const [company, setCompany] = useState(null)
    const [vacancies, setVacancies] = useState([])
    const [applicants, setApplicants] = useState([])
    const [selectedVacancy, setSelectedVacancy] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)

    const [companyForm, setCompanyForm] = useState({
        company_name: '', description: '', industry: '',
        website_url: '', company_size: '', city: '', country: '',
    })

    const [vacancyForm, setVacancyForm] = useState({
        title: '', description: '', location: '',
        salary_min: '', salary_max: '',
        modality: 'Presencial', work_schedule: 'Full-time', status: 'open',
    })
    
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [creating, setCreating] = useState(false)

    useEffect(() => { loadAll() }, [])

    const loadAll = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            const [comp, vacs] = await Promise.all([
                getMyCompany(token).catch(() => null),
                getMyVacancies(token).catch(() => []),
            ])
            setCompany(comp)
            setVacancies(vacs || [])
            if (comp) setCompanyForm({
                company_name: comp.company_name || '',
                description: comp.description || '',
                industry: comp.industry || '',
                website_url: comp.website_url || '',
                company_size: comp.company_size || '',
                city: comp.city || '',
                country: comp.country || '',
            })
        } finally {
            setLoading(false)
        }
    }

    const loadApplicants = async (vacancy) => {
        setSelectedVacancy(vacancy)
        setTab('Postulantes')
        try {
            const token = await getToken()
            const data = await getApplicants(vacancy.id, token)
            setApplicants(data || [])
        } catch { setApplicants([]) }
    }

    const handleSaveCompany = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const token = await getToken()
            const updated = await updateMyCompany(companyForm, token, !!company)
            setCompany(updated)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleCreateVacancy = async (e) => {
        e.preventDefault()
        setCreating(true)
        try {
            const token = await getToken()
            const v = await createVacancy({
                ...vacancyForm,
                salary_min: vacancyForm.salary_min || null,
                salary_max: vacancyForm.salary_max || null,
            }, token)
            setVacancies(prev => [v, ...prev])
            setShowCreateForm(false)
            setVacancyForm({ title: '', description: '', location: '', salary_min: '', salary_max: '', modality: 'Presencial', work_schedule: 'Full-time', status: 'open' })
            setTab('Vacantes')
        } finally { setCreating(false) }
    }

    const handleDeleteVacancy = async (id) => {
        if (!confirm('¿Eliminar esta vacante?')) return
        const token = await getToken()
        await deleteVacancy(id, token)
        setVacancies(prev => prev.filter(v => v.id !== id))
    }

    const handleApplyStatus = async (applyId, status) => {
        try {
            const token = await getToken()
            const res = await fetch(`${API_URL}/apply/${applyId}/status`, {
                method: 'PUT',
                headers: { ...buildHeaders(token), 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) throw new Error('Error al actualizar')
            setApplicants(prev => prev.map(a =>
                a.apply_id === applyId ? { ...a, status } : a
            ))
        } catch (err) {
            console.error(err)
        }
    }

    const activeVacancies = vacancies.filter(v => v.status === 'open').length
    const totalApplicants = vacancies.reduce((acc, v) => acc + (v.applicants_count || 0), 0)
    const statusMap = {
  pending:    { label: 'En proceso', cls: 'dash-status--pending' },
  'En Proceso': { label: 'En proceso', cls: 'dash-status--pending' },
  accepted:   { label: 'Aceptado',   cls: 'dash-status--accepted' },
  rejected:   { label: 'Rechazado',  cls: 'dash-status--rejected' },
}
    if (loading) return <div className="route-loading"><div className="route-loading__spinner" /></div>

    return (
        <main className="dashboard">
            <div className="container">
                <div className="dashboard__header">
                    <div>
                        <h1 className="dashboard__title">Dashboard</h1>
                        <p className="dashboard__subtitle">{company?.company_name || 'Tu empresa'}</p>
                    </div>
                    <button className="dash-btn dash-btn--primary" onClick={() => { setShowCreateForm(true); setTab('Vacantes') }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Nueva vacante
                    </button>
                </div>

                {/* Tabs */}
                <div className="dashboard__tabs">
                    {TABS.map(t => (
                        <button key={t}
                            className={`dashboard__tab ${tab === t ? 'dashboard__tab--active' : ''}`}
                            onClick={() => setTab(t)}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* RESUMEN */}
                {tab === 'Resumen' && (
                    <div className="dash-section animate-fade-up">
                        <div className="dash-stats">
                            <div className="dash-stat">
                                <span className="dash-stat__number">{vacancies.length}</span>
                                <span className="dash-stat__label">Vacantes totales</span>
                            </div>
                            <div className="dash-stat">
                                <span className="dash-stat__number">{activeVacancies}</span>
                                <span className="dash-stat__label">Vacantes activas</span>
                            </div>
                            <div className="dash-stat">
                                <span className="dash-stat__number">{applicants.length || '—'}</span>
                                <span className="dash-stat__label">Postulaciones</span>
                            </div>
                        </div>

                        <h2 className="dash-section__title">Vacantes recientes</h2>
                        <div className="dash-vacancy-list">
                            {vacancies.slice(0, 5).map(v => (
                                <div key={v.id} className="dash-vacancy-row">
                                    <div className="dash-vacancy-row__info">
                                        <span className="dash-vacancy-row__title">{v.title}</span>
                                        <span className="dash-vacancy-row__meta">{v.modality} · {v.work_schedule} · {v.location}</span>
                                    </div>
                                    <div className="dash-vacancy-row__actions">
                                        <span className={`dash-status dash-status--${v.status}`}>{v.status}</span>
                                        <button className="dash-btn dash-btn--sm" onClick={() => loadApplicants(v)}>
                                            Ver postulantes
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {vacancies.length === 0 && <p className="dash-empty">No tienes vacantes aún.</p>}
                        </div>
                    </div>
                )}

                {/* VACANTES */}
                {tab === 'Vacantes' && (
                    <div className="dash-section animate-fade-up">
                        {showCreateForm && (
                            <div className="dash-card">
                                <h2 className="dash-card__title">Crear nueva vacante</h2>
                                <form className="dash-form" onSubmit={handleCreateVacancy}>
                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label className="form-label">Título</label>
                                            <input className="form-input" required value={vacancyForm.title}
                                                onChange={e => setVacancyForm(p => ({ ...p, title: e.target.value }))}
                                                placeholder="Frontend Developer" />
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label">Ubicación</label>
                                            <input className="form-input" value={vacancyForm.location}
                                                onChange={e => setVacancyForm(p => ({ ...p, location: e.target.value }))}
                                                placeholder="Lima, Perú" />
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label className="form-label">Descripción</label>
                                        <textarea className="form-input form-textarea" required rows={4}
                                            value={vacancyForm.description}
                                            onChange={e => setVacancyForm(p => ({ ...p, description: e.target.value }))}
                                            placeholder="Describe el puesto, requisitos y responsabilidades..." />
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label className="form-label">Modalidad</label>
                                            <select className="form-input" value={vacancyForm.modality}
                                                onChange={e => setVacancyForm(p => ({ ...p, modality: e.target.value }))}>
                                                <option>Presencial</option>
                                                <option>Remoto</option>
                                                <option>Híbrido</option>
                                            </select>
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label">Jornada</label>
                                            <select className="form-input" value={vacancyForm.work_schedule}
                                                onChange={e => setVacancyForm(p => ({ ...p, work_schedule: e.target.value }))}>
                                                <option>Full-time</option>
                                                <option>Part-time</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-field">
                                            <label className="form-label">Salario mínimo</label>
                                            <input className="form-input" type="number" value={vacancyForm.salary_min}
                                                onChange={e => setVacancyForm(p => ({ ...p, salary_min: e.target.value }))}
                                                placeholder="2000" />
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label">Salario máximo</label>
                                            <input className="form-input" type="number" value={vacancyForm.salary_max}
                                                onChange={e => setVacancyForm(p => ({ ...p, salary_max: e.target.value }))}
                                                placeholder="4000" />
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="button" className="dash-btn dash-btn--ghost"
                                            onClick={() => setShowCreateForm(false)}>Cancelar</button>
                                        <button type="submit" className="dash-btn dash-btn--primary" disabled={creating}>
                                            {creating ? 'Creando...' : 'Crear vacante'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="dash-vacancy-list">
                            {vacancies.map(v => (
                                <div key={v.id} className="dash-vacancy-row">
                                    <div className="dash-vacancy-row__info">
                                        <span className="dash-vacancy-row__title">{v.title}</span>
                                        <span className="dash-vacancy-row__meta">
                                            {v.modality} · {v.work_schedule} · {v.location}
                                            {v.salary_min && ` · S/ ${v.salary_min}–${v.salary_max}`}
                                        </span>
                                    </div>
                                    <div className="dash-vacancy-row__actions">
                                        <span className={`dash-status dash-status--${v.status}`}>{v.status}</span>
                                        <button className="dash-btn dash-btn--sm" onClick={() => loadApplicants(v)}>
                                            Postulantes
                                        </button>
                                        <button className="dash-btn dash-btn--sm dash-btn--danger"
                                            onClick={() => handleDeleteVacancy(v.id)}>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {vacancies.length === 0 && <p className="dash-empty">No tienes vacantes. ¡Crea una!</p>}
                        </div>
                    </div>
                )}

                {/* POSTULANTES */}
                {tab === 'Postulantes' && (
                    <div className="dash-section animate-fade-up">
                        {selectedVacancy && (
                            <h2 className="dash-section__title">
                                Postulantes para: <em>{selectedVacancy.title}</em>
                            </h2>
                        )}
                        {!selectedVacancy && <p className="dash-empty">Selecciona una vacante para ver sus postulantes.</p>}
                        <div className="dash-applicant-list">
                            {applicants.map(a => (
                                <div key={a.apply_id} className="dash-applicant-card">
                                    <div className="dash-applicant__avatar">
                                        {(a.first_name || 'U')[0].toUpperCase()}
                                    </div>
                                    <div className="dash-applicant__info">
                                        <span className="dash-applicant__name">{a.first_name} {a.last_name}</span>
                                        <span className="dash-applicant__meta">{a.city}, {a.country} · {a.experience_years} años exp.</span>
                                        {a.skills && (
                                            <div className="dash-applicant__skills">
                                                {(typeof a.skills === 'string' ? a.skills.split(',') : a.skills)
                                                    .slice(0, 4).map((s, i) => (
                                                        <span key={i} className="vacancy-skill">{s.trim()}</span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="dash-applicant__actions">
                                        {(() => {
                                            const statusMap = {
                                                pending: { label: 'En proceso', cls: 'dash-status--pending' },
                                                accepted: { label: 'Aceptado', cls: 'dash-status--accepted' },
                                                rejected: { label: 'Rechazado', cls: 'dash-status--rejected' },
                                            }
                                            const s = statusMap[a.status] || statusMap.pending
                                            return <span className={`dash-status ${s.cls}`}>{s.label}</span>
                                        })()}

                                        {a.resume_url && (
                                            <a href={a.resume_url} target="_blank" rel="noreferrer" className="dash-btn dash-btn--sm">
                                                CV
                                            </a>
                                        )}

                                        {(!a.status || a.status === 'pending') && (
                                            <>
                                                <button className="dash-btn dash-btn--accept" onClick={() => handleApplyStatus(a.apply_id, 'accepted')}>
                                                    Aceptar
                                                </button>
                                                <button className="dash-btn dash-btn--reject" onClick={() => handleApplyStatus(a.apply_id, 'rejected')}>
                                                    Rechazar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {selectedVacancy && applicants.length === 0 && (
                                <p className="dash-empty">No hay postulantes para esta vacante aún.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* MI EMPRESA */}
                {tab === 'Mi Empresa' && (
                    <div className="dash-section animate-fade-up">
                        <div className="dash-card">
                            <h2 className="dash-card__title">Perfil de empresa</h2>
                            <form className="dash-form" onSubmit={handleSaveCompany}>
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label className="form-label">Nombre de la empresa</label>
                                        <input className="form-input" value={companyForm.company_name}
                                            onChange={e => setCompanyForm(p => ({ ...p, company_name: e.target.value }))}
                                            placeholder="Tech Solutions" />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label">Industria</label>
                                        <input className="form-input" value={companyForm.industry}
                                            onChange={e => setCompanyForm(p => ({ ...p, industry: e.target.value }))}
                                            placeholder="Tecnología" />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label className="form-label">Descripción</label>
                                    <textarea className="form-input form-textarea" rows={3}
                                        value={companyForm.description}
                                        onChange={e => setCompanyForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Cuéntanos sobre tu empresa..." />
                                </div>

                                <div className="form-grid">
                                    <div className="form-field">
                                        <label className="form-label">Sitio web</label>
                                        <input className="form-input" type="url" value={companyForm.website_url}
                                            onChange={e => setCompanyForm(p => ({ ...p, website_url: e.target.value }))}
                                            placeholder="https://tuempresa.com" />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label">Tamaño</label>
                                        <select className="form-input" value={companyForm.company_size}
                                            onChange={e => setCompanyForm(p => ({ ...p, company_size: e.target.value }))}>
                                            <option value="">Seleccionar</option>
                                            <option>1-10</option>
                                            <option>11-50</option>
                                            <option>51-200</option>
                                            <option>201-500</option>
                                            <option>500+</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-field">
                                        <label className="form-label">Ciudad</label>
                                        <input className="form-input" value={companyForm.city}
                                            onChange={e => setCompanyForm(p => ({ ...p, city: e.target.value }))}
                                            placeholder="Lima" />
                                    </div>
                                    <div className="form-field">
                                        <label className="form-label">País</label>
                                        <input className="form-input" value={companyForm.country}
                                            onChange={e => setCompanyForm(p => ({ ...p, country: e.target.value }))}
                                            placeholder="Perú" />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="form-save-btn" disabled={saving}>
                                        {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}