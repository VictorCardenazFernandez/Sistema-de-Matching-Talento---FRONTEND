import {
  useState,
  useEffect
} from 'react'
import { useAuth } from '../context/AuthContext'
import { useAuth0 } from '@auth0/auth0-react'
import {
  getVacancies,
  applyToVacancy
} from '../services/vacancy.service.js'
import {
  API_URL,
  buildHeaders
} from '../services/auth.service.js'
import { getRecommendedVacancies } from '../services/groq.service.js'
import VacancyCard from '../components/VacancyCard'
import VacancyModal from '../components/VacancyModal'
import VacancyRecommendations from '../components/VacancyRecommendations'
import './Vacancies.css'

export default function Vacancies() {
  const { getToken, isAuthenticated, role } = useAuth()
  const { getAccessTokenSilently } = useAuth0()
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
  const [recommendations, setRecommendations] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)

  useEffect(() => { loadVacancies() }, [])

  useEffect(() => {
    if (isAuthenticated && role === 'candidate') {
      loadRecommendations()
      loadProfile()
    }
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

  const loadProfile = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/candidate/me`, { headers: buildHeaders(token) })
      if (res.ok) {
        const data = await res.json()
        setCandidateProfile(data.profile)
      }
    } catch { }
  }

  const loadRecommendations = async () => {
    setLoadingRecs(true)
    try {
      const token = await getAccessTokenSilently()
      const data = await getRecommendedVacancies(token)
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingRecs(false)
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

      {selectedVacancy && (
        <VacancyModal
          vacancy={selectedVacancy}
          onClose={handleCloseModal}
          onApply={handleApply}
          applied={!!applied[selectedVacancy.id]}
          applying={applying}
          applySuccess={applySuccess}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          candidateProfile={candidateProfile}
          isAuthenticated={isAuthenticated}
          role={role}
        />
      )}

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
                  <button key={f} className={`filter-btn ${filterModality === f ? 'filter-btn--active' : ''}`}
                    onClick={() => setFilterModality(f)}>
                    {f === 'all' ? 'Todas' : f}
                  </button>
                ))}
              </div>
              <div className="filter-group">
                {['all', 'Full-time', 'Part-time'].map(f => (
                  <button key={f} className={`filter-btn ${filterSchedule === f ? 'filter-btn--active' : ''}`}
                    onClick={() => setFilterSchedule(f)}>
                    {f === 'all' ? 'Cualquier jornada' : f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="vacancies-results">
        <div className="container">

          {isAuthenticated && role === 'candidate' && (
            <VacancyRecommendations
              recommendations={recommendations}
              vacancies={vacancies}
              loading={loadingRecs}
              onSelect={setSelectedVacancy}
            />
          )}

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
                <div key={vacancy.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
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