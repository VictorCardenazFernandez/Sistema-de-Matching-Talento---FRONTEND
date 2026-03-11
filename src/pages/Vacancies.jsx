import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getVacancies, applyToVacancy } from '../services/vacancy.service'
import { API_URL, buildHeaders } from '../services/auth.service'
import './Vacancies.css'

function VacancyCard({ vacancy, applied, onVerDetalles }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="vacancy-card">
      <div className="vacancy-card__header">
        <div className="vacancy-card__company-logo">
          {vacancy.company_name?.[0] || 'E'}
        </div>
        <div className="vacancy-card__meta">
          <p className="vacancy-card__company">{vacancy.company_name || 'Empresa'}</p>
          <p className="vacancy-card__date">{formatDate(vacancy.created_at)}</p>
        </div>
      </div>

      <h3 className="vacancy-card__title">{vacancy.title}</h3>

      <div className="vacancy-card__tags">
        {vacancy.modality && <span className="vacancy-tag">{vacancy.modality}</span>}
        {vacancy.work_schedule && <span className="vacancy-tag">{vacancy.work_schedule}</span>}
        {vacancy.location && <span className="vacancy-tag vacancy-tag--location">📍 {vacancy.location}</span>}
      </div>

      <p className="vacancy-card__desc vacancy-card__desc--clamp">{vacancy.description}</p>

      <div className="vacancy-card__footer">
        <button
          className={`vacancy-card__apply-btn ${applied ? 'vacancy-card__apply-btn--applied' : ''}`}
          onClick={() => onVerDetalles(vacancy)}
        >
          {applied ? '✓ Ya postulado' : 'Ver detalles'}
        </button>
      </div>
    </div>
  )
}

export default function Vacancies() {
  const navigate = useNavigate()
  const { getToken, isAuthenticated, role } = useAuth()

  const [vacancies, setVacancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applied, setApplied] = useState({})
  const [search, setSearch] = useState('')
  const [filterModality, setFilterModality] = useState('all')
  const [filterSchedule, setFilterSchedule] = useState('all')
  const [selectedVacancy, setSelectedVacancy] = useState(null)
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [candidateProfile, setCandidateProfile] = useState(null)

  useEffect(() => {
    loadVacancies()
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated || role !== 'candidate') return
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/candidate/me`, { headers: buildHeaders(token) })
        if (res.ok) {
          const data = await res.json()
          setCandidateProfile(data.profile)
        }
      } catch { }
    }
    loadProfile()
  }, [isAuthenticated, role])

  const loadVacancies = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = getToken ? await getToken() : null
      const data = await getVacancies(token)
      setVacancies(data || [])
    } catch {
      setError('No se pudieron cargar las vacantes.')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (vacancyId) => {
    if (!isAuthenticated) return
    setApplying(true)
    try {
      const token = await getToken()
      await applyToVacancy(vacancyId, token)
      setApplied(prev => ({ ...prev, [vacancyId]: true }))
      setShowConfirm(false)
      setApplySuccess(true)
      setTimeout(() => setApplySuccess(false), 3000)
    } catch (err) {
      console.error('Error al postular:', err)
    } finally {
      setApplying(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedVacancy(null)
    setApplySuccess(false)
    setShowConfirm(false)
  }

  const filteredVacancies = vacancies.filter(v => {
    const matchSearch = !search ||
      v.title?.toLowerCase().includes(search.toLowerCase()) ||
      v.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase())
    const matchModality = filterModality === 'all' || v.modality === filterModality
    const matchSchedule = filterSchedule === 'all' || v.work_schedule === filterSchedule
    return matchSearch && matchModality && matchSchedule
  })

  return (
    <main className="vacancies-page">

      {/* Modal de detalles */}
      {selectedVacancy && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            <div className="modal__header">
              <div>
                <h2 className="modal__title">{selectedVacancy.title}</h2>
                <p className="modal__subtitle">
                  {selectedVacancy.company_name}
                  {selectedVacancy.location && ` · ${selectedVacancy.location}`}
                </p>
              </div>
              <button className="modal__close" onClick={handleCloseModal}>✕</button>
            </div>

            <div className="vacancy-card__tags" style={{ marginBottom: '24px' }}>
              {selectedVacancy.modality && <span className="vacancy-tag">{selectedVacancy.modality}</span>}
              {selectedVacancy.work_schedule && <span className="vacancy-tag">{selectedVacancy.work_schedule}</span>}
            </div>

            {(selectedVacancy.salary_min || selectedVacancy.salary_max) && (
              <div className="modal__salary">
                <p className="modal__salary-label">Salario</p>
                <p className="modal__salary-value">
                  {selectedVacancy.salary_min && `S/ ${selectedVacancy.salary_min}`}
                  {selectedVacancy.salary_min && selectedVacancy.salary_max && ' — '}
                  {selectedVacancy.salary_max && `S/ ${selectedVacancy.salary_max}`}
                </p>
              </div>
            )}

            <div className="modal__description">
              <h3 className="modal__description-title">Descripción</h3>
              <p>{selectedVacancy.description}</p>
            </div>

            {applySuccess && (
              <div className="modal__success">
                ✓ ¡Postulación enviada con éxito!
              </div>
            )}

            {!isAuthenticated ? (
              <button className="vacancy-card__apply-btn" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                Inicia sesión para postularte
              </button>
            ) : role === 'candidate' && !showConfirm ? (
              <button
                className={`vacancy-card__apply-btn ${applied[selectedVacancy.id] ? 'vacancy-card__apply-btn--applied' : ''}`}
                style={{ width: '100%' }}
                onClick={() => !applied[selectedVacancy.id] && setShowConfirm(true)}
                disabled={applied[selectedVacancy.id]}
              >
                {applied[selectedVacancy.id] ? '✓ Ya postulado' : 'Postularme'}
              </button>
            ) : role === 'candidate' && showConfirm ? (
              <div className="modal__confirm">
                <h4 className="modal__confirm-title">Confirmar postulación</h4>
                <p><strong>Nombre:</strong> {candidateProfile?.first_name} {candidateProfile?.last_name}</p>
                <p><strong>Ciudad:</strong> {candidateProfile?.city}, {candidateProfile?.country}</p>
                <p><strong>Experiencia:</strong> {candidateProfile?.experience_years} años</p>
                {candidateProfile?.linkedin_url && (
                  <p><strong>LinkedIn:</strong> {candidateProfile.linkedin_url}</p>
                )}
                <p className="modal__confirm-note">Se enviará tu perfil actual al empleador.</p>
                <div className="modal__confirm-actions">
                  <button className="btn-retry" onClick={() => setShowConfirm(false)}>
                    Cancelar
                  </button>
                  <button
                    className="vacancy-card__apply-btn"
                    onClick={() => handleApply(selectedVacancy.id)}
                    disabled={applying}
                    style={{ flex: 2 }}
                  >
                    {applying ? 'Enviando...' : 'Confirmar postulación'}
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* Hero */}
      <section className="vacancies-hero">
        <div className="container">
          <div className="vacancies-hero__content animate-fade-up">
            <div className="vacancies-hero__eyebrow">
              <div className="vacancies-hero__dot" />
              <span>Oportunidades en vivo</span>
            </div>
            <h1 className="vacancies-hero__title">
              Encuentra tu próximo<br />
              <em>gran trabajo</em>
            </h1>
            <p className="vacancies-hero__subtitle">
              Conectamos talento excepcional con las empresas que lo buscan.
            </p>
          </div>

          {/* Search */}
          <div className="vacancies-search animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="vacancies-search__input-wrap">
              <svg className="vacancies-search__icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 16l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                className="vacancies-search__input"
                type="text"
                placeholder="Buscar vacantes, empresa, tecnología..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="vacancies-search__clear" onClick={() => setSearch('')}>×</button>
              )}
            </div>

            <div className="vacancies-search__filters">
              <div className="filter-group">
                {['all', 'Remoto', 'Híbrido', 'Presencial'].map(f => (
                  <button
                    key={f}
                    className={`filter-btn ${filterModality === f ? 'filter-btn--active' : ''}`}
                    onClick={() => setFilterModality(f)}
                  >
                    {f === 'all' ? 'Todas' : f}
                  </button>
                ))}
              </div>
              <div className="filter-group">
                {['all', 'Full-time', 'Part-time'].map(f => (
                  <button
                    key={f}
                    className={`filter-btn ${filterSchedule === f ? 'filter-btn--active' : ''}`}
                    onClick={() => setFilterSchedule(f)}
                  >
                    {f === 'all' ? 'Cualquier jornada' : f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="vacancies-results">
        <div className="container">
          <div className="vacancies-results__header">
            <span className="vacancies-count">
              {loading ? '—' : filteredVacancies.length} vacante{filteredVacancies.length !== 1 ? 's' : ''}
              {search && ` para "${search}"`}
            </span>
          </div>

          {loading && (
            <div className="vacancies-loading">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="vacancy-skeleton" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="vacancy-skeleton__line vacancy-skeleton__line--title" />
                  <div className="vacancy-skeleton__line" />
                  <div className="vacancy-skeleton__line vacancy-skeleton__line--short" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="vacancies-error">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7v6M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p>{error}</p>
              <button className="btn-retry" onClick={loadVacancies}>Reintentar</button>
            </div>
          )}

          {!loading && !error && filteredVacancies.length === 0 && (
            <div className="vacancies-empty">
              <div className="vacancies-empty__icon">○</div>
              <h3>Sin resultados</h3>
              <p>Intenta con otros términos de búsqueda o filtros.</p>
              <button className="btn-retry" onClick={() => { setSearch(''); setFilterModality('all'); setFilterSchedule('all') }}>
                Limpiar filtros
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="vacancies-grid">
              {filteredVacancies.map((vacancy, i) => (
                <div
                  key={vacancy.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
                >
                  <VacancyCard
                    vacancy={vacancy}
                    applied={!!applied[vacancy.id]}
                    onVerDetalles={setSelectedVacancy}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}