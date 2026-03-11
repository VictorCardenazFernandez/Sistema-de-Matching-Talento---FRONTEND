import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { API_URL, buildHeaders } from '../services/auth.service'
import './MisPostulaciones.css'

export default function MisPostulaciones() {
  const { getAccessTokenSilently } = useAuth0()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getAccessTokenSilently()
        const res = await fetch(`${API_URL}/apply/myvacancies`, {
          headers: buildHeaders(token)
        })
        if (res.ok) {
          const data = await res.json()
          setApplications(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statusMap = {
    pending:  { label: 'En proceso', cls: 'postulacion-status--pending' },
    accepted: { label: 'Aceptado',   cls: 'postulacion-status--accepted' },
    rejected: { label: 'Rechazado',  cls: 'postulacion-status--rejected' },
  }

  if (loading) return <div className="route-loading"><div className="route-loading__spinner" /></div>

  return (
    <main className="mis-postulaciones">
      <div className="container">
        <h1 className="mis-postulaciones__title">Mis Postulaciones</h1>
        <p className="mis-postulaciones__count">
          {applications.length} postulación{applications.length !== 1 ? 'es' : ''}
        </p>

        {applications.length === 0 ? (
          <p className="mis-postulaciones__empty">
            Aún no te has postulado a ninguna vacante.
          </p>
        ) : (
          <div className="mis-postulaciones__list">
            {applications.map((app) => {
              const s = statusMap[app.status] || statusMap.pending
              return (
                <div key={app.id} className="postulacion-card">
                  <div>
                    <h3 className="postulacion-card__title">{app.title || 'Vacante'}</h3>
                    <p className="postulacion-card__meta">
                      {app.company_name || ''}{app.location ? ` · ${app.location}` : ''}
                    </p>
                    <div className="postulacion-card__tags">
                      {app.modality && <span className="tag--modality">{app.modality}</span>}
                      {app.work_schedule && <span className="tag--schedule">{app.work_schedule}</span>}
                    </div>
                  </div>
                  <div className="postulacion-card__right">
                    <span className={`postulacion-status ${s.cls}`}>{s.label}</span>
                    <p className="postulacion-card__date">
                      {app.applied_at
                        ? new Date(app.applied_at).toLocaleDateString('es', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })
                        : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}