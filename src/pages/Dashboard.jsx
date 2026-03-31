import {
    useState,
    useEffect
} from 'react'
import { useAuth } from '../context/AuthContext'
import {
    getMyCompany,
    updateMyCompany,
    getMyVacancies,
    createVacancy,
    deleteVacancy,
    getApplicants
} from '../services/company.service'
import {
    API_URL,
    buildHeaders
} from '../services/auth.service'
import OwnerInfo from '../components/OwnerInfo'
import InviteModal from '../components/InviteModal'
import PointsBadge from '../components/PointsBadge'
import CandidateProfileModal from '../components/CandidateProfileModal'
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
        title: '',
        description: '',
        location: '',
        salary_min: '',
        salary_max: '',
        modality: 'Presencial',
        work_schedule: 'Full-time',
        status: 'open',
        languages: ''
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [creating, setCreating] = useState(false)
    const [aiRecs, setAiRecs] = useState([])
    const [loadingAiRecs, setLoadingAiRecs] = useState(false)
    const [editingVacancy, setEditingVacancy] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [editing, setEditing] = useState(false)
    const [ownerInfo, setOwnerInfo] = useState(null)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [pointsToken, setPointsToken] = useState(null)
    const [selectedCandidate, setSelectedCandidate] = useState(null)

    useEffect(() => { loadAll() }, [])

    const loadAll = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            setPointsToken(token)
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
            try {
                const ownerRes = await fetch(`${API_URL}/company-request/me`, {
                    headers: buildHeaders(token)
                })
                if (ownerRes.ok) {
                    const ownerData = await ownerRes.json()
                    setOwnerInfo(ownerData)
                }
            } catch { }
        } finally {
            setLoading(false)
        }
    }

    const loadAiRecommendations = async (vacancyId) => {
        setLoadingAiRecs(true)
        setAiRecs([])
        try {
            const token = await getToken()
            const res = await fetch(`${API_URL}/ai/recommend/candidates/${vacancyId}`, {
                headers: buildHeaders(token)
            })
            if (!res.ok) throw new Error('Error')
            const data = await res.json()
            setAiRecs(data.recommendations || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingAiRecs(false)
        }
    }

    const loadApplicants = async (vacancy) => {
        setSelectedVacancy(vacancy)
        setTab('Postulantes')
        try {
            const token = await getToken()
            const data = await getApplicants(vacancy.id, token)
            setApplicants(data || [])
            loadAiRecommendations(vacancy.id)
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

    const handleEditVacancy = async (e) => {
        e.preventDefault()
        setEditing(true)
        try {
            const token = await getToken()
            const res = await fetch(`${API_URL}/vacancy/edit/${editingVacancy.id}`, {
                method: 'PUT',
                headers: { ...buildHeaders(token), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editForm,
                    salary_min: editForm.salary_min || null,
                    salary_max: editForm.salary_max || null,
                    languages: editForm.languages || null,
                }),
            })
            if (!res.ok) throw new Error('Error al actualizar')
            const updated = await res.json()
            setVacancies(prev => prev.map(v => v.id === updated.id ? updated : v))
            setEditingVacancy(null)
        } catch (err) {
            console.error(err)
        } finally {
            setEditing(false)
        }
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

    const handleViewCV = async (candidateProfileId) => {
        try {
            const token = await getToken()
            const res = await fetch(`${API_URL}/file/download-cv/${candidateProfileId}`, {
                headers: buildHeaders(token),
                redirect: 'follow'
            })
            if (!res.ok) throw new Error('CV no encontrado')
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            window.open(url, '_blank')
        } catch (err) {
            console.error(err)
            alert('No se pudo obtener el CV')
        }
    }

    const handleToggleVacancyStatus = async (vacancy) => {
        const newStatus = vacancy.status === 'open' ? 'closed' : 'open'
        try {
            const token = await getToken()
            const res = await fetch(`${API_URL}/vacancy/status/${vacancy.id}`, {
                method: 'PUT',
                headers: { ...buildHeaders(token), 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Error al actualizar')
            setVacancies(prev => prev.map(v =>
                v.id === vacancy.id ? { ...v, status: newStatus } : v
            ))
        } catch (err) {
            console.error(err)
        }
    }

    const activeVacancies = vacancies.filter(v => v.status === 'open').length
    const totalApplicants = vacancies.reduce((acc, v) => acc + (v.applicants_count || 0), 0)

    if (loading) return <div className="route-loading"><div className="route-loading__spinner" /></div>

    return (
        <main className="dashboard">
            <div className="container">
                <div className="dashboard__header">
                    <div>
                        <h1 className="dashboard__title">Dashboard</h1>
                        <p className="dashboard__subtitle">{company?.company_name || 'Tu empresa'}</p>
                    </div>

                    <PointsBadge token={pointsToken} />

                    <button className="dash-btn dash-btn--ghost" onClick={() => setShowInviteModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        👥 Invitar
                    </button>

                    <button className="dash-btn dash-btn--primary" onClick={() => { setShowCreateForm(true); setTab('Vacantes') }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Nueva vacante
                    </button>
                </div>

                <div className="dashboard__tabs">
                    {TABS.map(t => (
                        <button key={t}
                            className={`dashboard__tab ${tab === t ? 'dashboard__tab--active' : ''}`}
                            onClick={() => setTab(t)}>
                            {t}
                        </button>
                    ))}
                </div>

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
                                        <button
                                            className={`dash-status dash-status--${v.status} dash-status--clickable`}
                                            onClick={() => handleToggleVacancyStatus(v)}
                                            title="Click para cambiar estado"
                                        >
                                            {v.status === 'open' ? 'OPEN' : 'CLOSED'}
                                        </button>
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
                                            <label className="form-label">Dirección</label>
                                            <input className="form-input" value={vacancyForm.location}
                                                onChange={e => setVacancyForm(p => ({ ...p, location: e.target.value }))}
                                                placeholder="Av. Javier Prado 123, San Isidro" />
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

                                    <div className="form-field">
                                        <label className="form-label">
                                            Idiomas requeridos
                                            <span className="form-label__hint">separados por coma (opcional)</span>
                                        </label>
                                        <input className="form-input" type="text"
                                            value={vacancyForm.languages || ''}
                                            onChange={e => setVacancyForm(p => ({ ...p, languages: e.target.value }))}
                                            placeholder="Español, Inglés..." />
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
                                        <button
                                            className={`dash-status dash-status--${v.status} dash-status--clickable`}
                                            onClick={() => handleToggleVacancyStatus(v)}
                                            title="Click para cambiar estado"
                                        >
                                            {v.status === 'open' ? 'OPEN' : 'CLOSED'}
                                        </button>
                                        <button className="dash-btn dash-btn--sm" onClick={() => loadApplicants(v)}>
                                            Postulantes
                                        </button>
                                        <button
                                            className="dash-btn dash-btn--sm"
                                            onClick={() => {
                                                setEditingVacancy(v)
                                                setEditForm({
                                                    title: v.title || '',
                                                    description: v.description || '',
                                                    location: v.location || '',
                                                    salary_min: v.salary_min || '',
                                                    salary_max: v.salary_max || '',
                                                    modality: v.modality || 'Presencial',
                                                    work_schedule: v.work_schedule || 'Full-time',
                                                    status: v.status || 'open',
                                                    languages: Array.isArray(v.languages) ? v.languages.join(', ') : v.languages || '',
                                                })
                                            }}
                                        >
                                            Editar
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

                {tab === 'Postulantes' && (
                    <div className="dash-section animate-fade-up">
                        {selectedVacancy && (
                            <h2 className="dash-section__title">
                                Postulantes para: <em>{selectedVacancy.title}</em>
                            </h2>
                        )}
                        {!selectedVacancy && <p className="dash-empty">Selecciona una vacante para ver sus postulantes.</p>}
                        {aiRecs.length > 0 && (
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{
                                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                                    fontSize: '1.1rem', marginBottom: '16px'
                                }}>
                                    ✨ Top candidatos recomendados
                                </h3>
                                <div className="postulantes-ai-list">
                                    {aiRecs.map((rec) => {
                                        const candidate = applicants.find(a => a.apply_id === rec.apply_id)
                                        if (!candidate) return null
                                        return (
                                            <div key={rec.apply_id} className="postulantes-ai-card"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setSelectedCandidate(candidate)}>
                                                <div className="postulantes-ai-avatar">
                                                    {(candidate.first_name || 'U')[0].toUpperCase()}
                                                </div>
                                                <div className="postulantes-ai-info">
                                                    <div className="postulantes-ai-header">
                                                        <span className="postulantes-ai-name">
                                                            {candidate.first_name} {candidate.last_name}
                                                        </span>
                                                        <span className="postulantes-ai-badge">{rec.score}% match</span>
                                                    </div>
                                                    <p className="postulantes-ai-reason">{rec.reason}</p>
                                                </div>
                                                <div className="postulantes-ai-actions" onClick={e => e.stopPropagation()}>
                                                    {(() => {
                                                        const statusMap = {
                                                            pending: { label: 'En proceso', cls: 'dash-status--pending' },
                                                            accepted: { label: 'Aceptado', cls: 'dash-status--accepted' },
                                                            rejected: { label: 'Rechazado', cls: 'dash-status--rejected' },
                                                        }
                                                        const s = statusMap[candidate.status] || statusMap.pending
                                                        return <span className={`dash-status ${s.cls}`}>{s.label}</span>
                                                    })()}
                                                    {(!candidate.status || candidate.status === 'pending') && (
                                                        <>
                                                            <button className="dash-btn dash-btn--accept"
                                                                onClick={() => handleApplyStatus(candidate.apply_id, 'accepted')}>
                                                                Aceptar
                                                            </button>
                                                            <button className="dash-btn dash-btn--reject"
                                                                onClick={() => handleApplyStatus(candidate.apply_id, 'rejected')}>
                                                                Rechazar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {loadingAiRecs && (
                            <div style={{ marginBottom: '24px', color: '#3DBFB8', fontSize: '0.9rem' }}>
                                ✨ Analizando candidatos con IA...
                            </div>
                        )}
                        <div className="dash-applicant-list">
                            {applicants.map(a => (
                                <div
                                    key={a.apply_id}
                                    className="dash-applicant-card"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedCandidate(a)}
                                >
                                    <div className="dash-applicant__avatar">
                                        {(a.first_name || 'U')[0].toUpperCase()}
                                    </div>
                                    <div className="dash-applicant__info">
                                        <span className="dash-applicant__name">
                                            {a.first_name} {a.last_name}
                                        </span>
                                        <span className="dash-applicant__meta">
                                            {a.city}, {a.country} · {a.experience_years} años exp.
                                        </span>
                                        {a.skills && (
                                            <div className="dash-applicant__skills">
                                                {(typeof a.skills === 'string' ? a.skills.split(',') : a.skills)
                                                    .slice(0, 4).map((s, i) => (
                                                        <span key={i} className="vacancy-skill">{s.trim()}</span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="dash-applicant__actions" onClick={e => e.stopPropagation()}>
                                        {(() => {
                                            const statusMap = {
                                                pending: { label: 'En proceso', cls: 'dash-status--pending' },
                                                accepted: { label: 'Aceptado', cls: 'dash-status--accepted' },
                                                rejected: { label: 'Rechazado', cls: 'dash-status--rejected' },
                                            }
                                            const s = statusMap[a.status] || statusMap.pending
                                            return <span className={`dash-status ${s.cls}`}>{s.label}</span>
                                        })()}
                                        {(!a.status || a.status === 'pending') && (
                                            <>
                                                <button className="dash-btn dash-btn--accept"
                                                    onClick={() => handleApplyStatus(a.apply_id, 'accepted')}>
                                                    Aceptar
                                                </button>
                                                <button className="dash-btn dash-btn--reject"
                                                    onClick={() => handleApplyStatus(a.apply_id, 'rejected')}>
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

                {tab === 'Mi Empresa' && (
                    <div className="dash-section animate-fade-up">
                        <OwnerInfo ownerInfo={ownerInfo} />
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

            {editingVacancy && (
                <div className="modal-overlay" onClick={() => setEditingVacancy(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Editar vacante</h2>
                            <button className="modal__close" onClick={() => setEditingVacancy(null)}>✕</button>
                        </div>
                        <form className="dash-form" onSubmit={handleEditVacancy}>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Título</label>
                                    <input className="form-input" required value={editForm.title}
                                        onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Ubicación</label>
                                    <input className="form-input" value={editForm.location}
                                        onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="form-label">Descripción</label>
                                <textarea className="form-input form-textarea" rows={4} required value={editForm.description}
                                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Modalidad</label>
                                    <select className="form-input" value={editForm.modality}
                                        onChange={e => setEditForm(p => ({ ...p, modality: e.target.value }))}>
                                        <option>Presencial</option>
                                        <option>Remoto</option>
                                        <option>Híbrido</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Jornada</label>
                                    <select className="form-input" value={editForm.work_schedule}
                                        onChange={e => setEditForm(p => ({ ...p, work_schedule: e.target.value }))}>
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Salario mínimo</label>
                                    <input className="form-input" type="number" value={editForm.salary_min}
                                        onChange={e => setEditForm(p => ({ ...p, salary_min: e.target.value }))}
                                        placeholder="2000" />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Salario máximo</label>
                                    <input className="form-input" type="number" value={editForm.salary_max}
                                        onChange={e => setEditForm(p => ({ ...p, salary_max: e.target.value }))}
                                        placeholder="4000" />
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="form-label">Idiomas requeridos <span className="form-label__hint">separados por coma</span></label>
                                <input className="form-input" value={editForm.languages}
                                    onChange={e => setEditForm(p => ({ ...p, languages: e.target.value }))}
                                    placeholder="Español, Inglés..." />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Estado</label>
                                <select className="form-input" value={editForm.status}
                                    onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                                    <option value="open">Abierta</option>
                                    <option value="closed">Cerrada</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="dash-btn dash-btn--ghost"
                                    onClick={() => setEditingVacancy(null)}>Cancelar</button>
                                <button type="submit" className="dash-btn dash-btn--primary" disabled={editing}>
                                    {editing ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
            {selectedCandidate && (
                <CandidateProfileModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidate(null)}
                    onViewCV={handleViewCV}
                />
            )}
        </main>
    )
}