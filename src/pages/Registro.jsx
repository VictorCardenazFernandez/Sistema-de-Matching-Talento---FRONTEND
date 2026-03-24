import {
  useState,
  useEffect
} from 'react'
import {
  useNavigate,
  useSearchParams
} from 'react-router-dom'
import { API_URL } from '../services/auth.service'
import { useAuth0 } from '@auth0/auth0-react'
import './Registro.css'

export default function Registro() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { loginWithRedirect } = useAuth0()
  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (token) loadInvitation()
    else { setError('Token de invitación no encontrado'); setLoading(false) }
  }, [token])

  const loadInvitation = async () => {
    try {
      const res = await fetch(`${API_URL}/invitation/${token}`)
      if (!res.ok) throw new Error('Invitación inválida o expirada')
      const data = await res.json()
      setInvitation(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    try {
      await fetch(`${API_URL}/invitation/${token}/accept`, { method: 'POST' })
      setAccepted(true)
      setTimeout(() => {
        loginWithRedirect({
          authorizationParams: { connection: 'google-oauth2', prompt: 'select_account' },
          appState: { returnTo: invitation?.role === 'company' ? '/dashboard' : '/profile' }
        })
      }, 2000)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="route-loading"><div className="route-loading__spinner" /></div>

  return (
    <main className="registro-page">
      <div className="registro-container">
        <h1 className="registro-logo" onClick={() => navigate('/')}>Humantyx</h1>

        {error ? (
          <div className="registro-card">
            <div className="registro-error">
              <p>❌ {error}</p>
              <button className="registro-btn" onClick={() => navigate('/')}>Ir al inicio</button>
            </div>
          </div>
        ) : accepted ? (
          <div className="registro-card">
            <div className="registro-success">
              <p>✓ ¡Invitación aceptada! Redirigiendo al login...</p>
            </div>
          </div>
        ) : (
          <div className="registro-card">
            <h2 className="registro-title">¡Te invitaron a Humantyx!</h2>
            <p className="registro-subtitle">
              Fuiste invitado a unirte como{' '}
              <strong>{invitation?.role === 'company' ? 'empresa' : 'candidato'}</strong>.
            </p>
            <p className="registro-email">Invitación para: <strong>{invitation?.email}</strong></p>

            <div className="registro-steps">
              <p>Al aceptar podrás:</p>
              <ul>
                {invitation?.role === 'candidate' ? (
                  <>
                    <li>✓ Crear tu perfil de candidato</li>
                    <li>✓ Postularte a vacantes</li>
                    <li>✓ Recibir recomendaciones de trabajo con IA</li>
                  </>
                ) : (
                  <>
                    <li>✓ Publicar vacantes</li>
                    <li>✓ Ver postulantes</li>
                    <li>✓ Usar IA para encontrar los mejores candidatos</li>
                  </>
                )}
              </ul>
            </div>

            <button className="registro-btn" onClick={handleAccept}>
              Aceptar invitación y registrarme
            </button>
            <p className="registro-note">
              Serás redirigido a Google para completar tu registro.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}