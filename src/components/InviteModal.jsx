import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuth } from '../context/AuthContext'
import {
  API_URL,
  buildHeaders
} from '../services/auth.service'
import './InviteModal.css'

export default function InviteModal({ onClose }) {
  const { getAccessTokenSilently } = useAuth0()
  const { role } = useAuth()
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('candidate')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently()
      const res = await fetch(`${API_URL}/invitation/send`, {
        method: 'POST',
        headers: { ...buildHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal invite-modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Invitar a Humantyx</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        {success ? (
          <div className="invite-modal__success">
            <p>✓ Invitación enviada a <strong>{email}</strong></p>
            <button className="form-save-btn" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-field">
              <label className="form-label">Correo del invitado</label>
              <input className="form-input" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com" />
            </div>

            {role === 'admin' && (
              <div className="form-field">
                <label className="form-label">Rol</label>
                <select className="form-input" value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}>
                  <option value="candidate">Candidato</option>
                  <option value="company">Empresa</option>
                </select>
              </div>
            )}

            {role === 'candidate' && (
              <p className="invite-modal__note">
                Puedes enviar hasta un máximo 5 invitaciones.
              </p>
            )}

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button type="submit" className="form-save-btn" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar invitación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}