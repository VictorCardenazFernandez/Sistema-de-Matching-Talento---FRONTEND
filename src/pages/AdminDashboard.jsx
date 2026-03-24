import {
  useState,
  useEffect
} from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getAllRequests,
  resolveRequest,
  getGlobalStats,
  getAllUsers,
  getAllVacanciesAdmin
} from '../services/admin.services.js'
import './AdminDashboard.css'

const TABS = ['Estadísticas', 'Candidatos', 'Empresas', 'Vacantes', 'Solicitudes']

export default function AdminDashboard() {
  const { getToken } = useAuth()
  const [tab, setTab] = useState('Estadísticas')
  const [stats, setStats] = useState(null)
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const [s, r, u, v] = await Promise.all([
        getGlobalStats(token),
        getAllRequests(token),
        getAllUsers(token),
        getAllVacanciesAdmin(token),
      ])
      setStats(s)
      setRequests(r)
      setUsers(u)
      setVacancies(v)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (requestId, status) => {
    try {
      const token = await getToken()
      await resolveRequest(requestId, status, token)
      setRequests(prev => prev.map(r =>
        r.id === requestId ? { ...r, status } : r
      ))
      const token2 = await getToken()
      const s = await getGlobalStats(token2)
      setStats(s)
    } catch (err) {
      console.error(err)
    }
  }

  const candidates = users.filter(u => u.role === 'candidate')
  const companies = users.filter(u => u.role === 'company')

  if (loading) return <div className="route-loading"><div className="route-loading__spinner" /></div>

  return (
    <main className="admin-dashboard">
      <div className="container">
        <div className="admin-dashboard__header">
          <h1 className="admin-dashboard__title">Admin Panel</h1>
          <span className="admin-badge">🛡️ Administrador</span>
        </div>

        <div className="admin-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'admin-tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
              {t === 'Solicitudes' && requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="admin-tab__badge">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'Estadísticas' && stats && (
          <div className="admin-section animate-fade-up">
            <div className="admin-stats">
              {[
                { label: 'Candidatos', value: stats.total_candidates, tab: 'Candidatos' },
                { label: 'Empresas', value: stats.total_companies, tab: 'Empresas' },
                { label: 'Vacantes activas', value: stats.active_vacancies, tab: 'Vacantes' },
                { label: 'Postulaciones', value: stats.total_applies, tab: null },
                { label: 'Solicitudes pendientes', value: stats.pending_requests, tab: 'Solicitudes', highlight: true },
              ].map(s => (
                <div
                  key={s.label}
                  className={`admin-stat ${s.highlight ? 'admin-stat--highlight' : ''} ${s.tab ? 'admin-stat--clickable' : ''}`}
                  onClick={() => s.tab && setTab(s.tab)}
                >
                  <span className="admin-stat__number">{s.value}</span>
                  <span className="admin-stat__label">{s.label}</span>
                  {s.tab && <span className="admin-stat__arrow">→</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Candidatos' && (
          <div className="admin-section animate-fade-up">
            <h2 className="admin-section__title">Candidatos ({candidates.length})</h2>
            <div className="admin-table">
              <div className="admin-table__header">
                <span>Nombre</span>
                <span>Email</span>
                <span>Registro</span>
              </div>
              {candidates.map(u => (
                <div key={u.id} className="admin-table__row">
                  <span>{u.name || '—'}</span>
                  <span>{u.email}</span>
                  <span>{new Date(u.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              ))}
              {candidates.length === 0 && <p className="admin-empty">No hay candidatos.</p>}
            </div>
          </div>
        )}

        {tab === 'Empresas' && (
          <div className="admin-section animate-fade-up">
            <h2 className="admin-section__title">Empresas ({companies.length})</h2>
            <div className="admin-table">
              <div className="admin-table__header" style={{ gridTemplateColumns: '2fr 3fr 1fr' }}>
                <span>Empresa</span>
                <span>Descripción</span>
                <span>Registro</span>
              </div>
              {companies.map(u => (
                <div key={u.id} className="admin-table__row" style={{ gridTemplateColumns: '2fr 3fr 1fr' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{u.company_name || u.name || '—'}</span>
                    {u.industry && <p style={{ color: '#666', fontSize: '0.8rem', margin: '2px 0 0' }}>{u.industry}</p>}
                    {u.city && <p style={{ color: '#aaa', fontSize: '0.8rem' }}>📍 {u.city}, {u.country}</p>}
                  </div>
                  <span style={{ color: '#555', fontSize: '0.85rem' }}>
                    {u.company_description || '—'}
                  </span>
                  <span>{new Date(u.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              ))}
              {companies.length === 0 && <p className="admin-empty">No hay empresas.</p>}
            </div>
          </div>
        )}

        {tab === 'Vacantes' && (
          <div className="admin-section animate-fade-up">
            <h2 className="admin-section__title">Vacantes ({vacancies.length})</h2>
            <div className="admin-table">
              <div className="admin-table__header">
                <span>Título</span>
                <span>Empresa</span>
                <span>Estado</span>
                <span>Fecha</span>
              </div>
              {vacancies.map(v => (
                <div key={v.id} className="admin-table__row">
                  <span>{v.title}</span>
                  <span>{v.company_name || '—'}</span>
                  <span className={`admin-status admin-status--${v.status}`}>
                    {v.status === 'open' ? 'Abierta' : v.status === 'closed' ? 'Cerrada' : v.status}
                  </span>
                  <span>{new Date(v.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              ))}
              {vacancies.length === 0 && <p className="admin-empty">No hay vacantes.</p>}
            </div>
          </div>
        )}

        {tab === 'Solicitudes' && (
          <div className="admin-section animate-fade-up">
            <h2 className="admin-section__title">Solicitudes de empresa</h2>
            {requests.length === 0 ? (
              <p className="admin-empty">No hay solicitudes aún.</p>
            ) : (
              <div className="admin-requests">
                {requests.map(req => (
                  <div key={req.id} className={`admin-request-card admin-request-card--${req.status}`}>
                    <div className="admin-request__info">
                      <div className="admin-request__header">
                        <h3 className="admin-request__company">{req.company_name}</h3>
                        <span className={`admin-request__status admin-request__status--${req.status}`}>
                          {req.status === 'pending' ? 'Pendiente' : req.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                        </span>
                      </div>
                      <p className="admin-request__user">👤 {req.name || req.email} · {req.email}</p>
                      {req.industry && <p className="admin-request__meta">🏭 {req.industry}</p>}
                      {req.city && <p className="admin-request__meta">📍 {req.city}, {req.country}</p>}
                      {req.website_url && <a href={req.website_url} target="_blank" rel="noreferrer" className="admin-request__link">🌐 {req.website_url}</a>}
                      {req.description && <p className="admin-request__desc">{req.description}</p>}
                      <p className="admin-request__date">
                        {new Date(req.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {req.status === 'pending' && (
                      <div className="admin-request__actions">
                        <button className="admin-btn admin-btn--accept" onClick={() => handleResolve(req.id, 'accepted')}>✓ Aceptar</button>
                        <button className="admin-btn admin-btn--reject" onClick={() => handleResolve(req.id, 'rejected')}>✕ Rechazar</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
