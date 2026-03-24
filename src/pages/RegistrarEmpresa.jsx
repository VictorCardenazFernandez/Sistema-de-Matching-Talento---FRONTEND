import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../services/auth.service'
import './RegistrarEmpresa.css'

const COMPANY_TYPES = ['S.A.C.', 'S.A.', 'E.I.R.L.', 'S.R.L.', 'S.A.A.', 'Persona Natural con Negocio', 'Otra']

export default function RegisterEmpresa() {
    const navigate = useNavigate()
    const [step, setStep] = useState('email') // email | verify | form | done
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [rucInfo, setRucInfo] = useState(null)
    const [checkingRuc, setCheckingRuc] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [form, setForm] = useState({
        owner_first_name: '', owner_last_name: '',
        contact_phone: '', ruc: '', company_type: 'S.A.C.',
    })

    const handleSendCode = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_URL}/public/company-request/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setStep('verify')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyCode = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_URL}/public/company-request/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setStep('form')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCheckRuc = async (ruc) => {
        if (ruc.length !== 11) return
        setCheckingRuc(true)
        setRucInfo(null)
        try {
            const res = await fetch(`${API_URL}/public/company-request/check-ruc/${ruc}`)
            if (res.ok) {
                const data = await res.json()
                setRucInfo(data)
            } else {
                setRucInfo({ error: 'RUC no encontrado o inactivo' })
            }
        } catch {
            setRucInfo({ error: 'No se pudo verificar el RUC' })
        } finally {
            setCheckingRuc(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_URL}/public/company-request/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, ...form }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setStep('done')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="register-empresa">
            <div className="register-empresa__container">
                <div className="register-empresa__header">
                    <h1 className="register-empresa__logo" onClick={() => navigate('/')}>
                        Humantyx
                    </h1>
                    <h2 className="register-empresa__title">Crear cuenta empresa</h2>
                    <p className="register-empresa__subtitle">
                        Publica vacantes y encuentra el mejor talento para tu empresa.
                    </p>
                </div>

                <div className="register-empresa__card">

                    {step !== 'done' && (
                        <div className="register-steps">
                            {['email', 'verify', 'form'].map((s, i) => (
                                <div key={s} className={`register-step ${step === s ? 'register-step--active' : ['email', 'verify', 'form'].indexOf(step) > i ? 'register-step--done' : ''}`}>
                                    <div className="register-step__dot">{['email', 'verify', 'form'].indexOf(step) > i ? '✓' : i + 1}</div>
                                    <span className="register-step__label">
                                        {s === 'email' ? 'Email' : s === 'verify' ? 'Verificar' : 'Datos'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 'email' && (
                        <form onSubmit={handleSendCode} className="register-form">
                            <div className="form-field">
                                <label className="form-label">Correo electrónico de la empresa</label>
                                <input className="form-input" type="email" required
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="empresa@ejemplo.com" />
                            </div>
                            {error && <p className="form-error">{error}</p>}
                            <button type="submit" className="register-btn" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar código de verificación'}
                            </button>
                        </form>
                    )}

                    {step === 'verify' && (
                        <form onSubmit={handleVerifyCode} className="register-form">
                            <p className="register-form__hint">
                                Enviamos un código de 6 dígitos a <strong>{email}</strong>
                            </p>

                            <div className="form-field">
                                <label className="form-label">Código de verificación</label>
                                <input className="form-input register-code-input" required maxLength={6}
                                    value={code} onChange={e => setCode(e.target.value)}
                                    placeholder="123456" />
                            </div>
                            {error && <p className="form-error">{error}</p>}
                            <button type="submit" className="register-btn" disabled={loading}>
                                {loading ? 'Verificando...' : 'Verificar código'}
                            </button>
                            <button type="button" className="register-btn-ghost"
                                onClick={() => setStep('email')}>
                                ← Cambiar email
                            </button>
                        </form>
                    )}

                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="register-form">
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Nombre del solicitante</label>
                                    <input className="form-input" required
                                        value={form.owner_first_name}
                                        onChange={e => setForm(p => ({ ...p, owner_first_name: e.target.value }))}
                                        placeholder="Juan" />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Apellido</label>
                                    <input className="form-input" required
                                        value={form.owner_last_name}
                                        onChange={e => setForm(p => ({ ...p, owner_last_name: e.target.value }))}
                                        placeholder="Pérez" />
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="form-label">Número de contacto</label>
                                <input className="form-input" required
                                    value={form.contact_phone}
                                    onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))}
                                    placeholder="+51 999 999 999" />
                            </div>

                            <div className="form-field">
                                <label className="form-label">RUC</label>
                                <input className="form-input" required maxLength={11}
                                    value={form.ruc}
                                    onChange={e => {
                                        const val = e.target.value
                                        setForm(p => ({ ...p, ruc: val }))
                                        if (val.length === 11) handleCheckRuc(val)
                                    }}
                                    placeholder="20123456789" />

                                {checkingRuc && <p className="ruc-checking">Verificando RUC...</p>}

                                {rucInfo && !rucInfo.error && (
                                    <div className="ruc-info">
                                        <p className="ruc-info__label">Empresa encontrada</p>
                                        <p className="ruc-info__name">{rucInfo.nombre}</p>
                                        <p className="ruc-info__estado">✓ RUC Activo</p>
                                    </div>
                                )}

                                {rucInfo?.error && (
                                    <p className="form-hint form-hint--error">✗ {rucInfo.error}</p>
                                )}
                            </div>

                            <div className="form-field">
                                <label className="form-label">Tipo de empresa</label>
                                <select className="form-input"
                                    value={form.company_type}
                                    onChange={e => setForm(p => ({ ...p, company_type: e.target.value }))}>
                                    {COMPANY_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>

                            {error && <p className="form-error">{error}</p>}

                            <button type="submit" className="register-btn" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar solicitud'}
                            </button>
                        </form>
                    )}

                    {step === 'done' && (
                        <div className="register-done">
                            <div className="register-done__icon">🎉</div>
                            <h3 className="register-done__title">¡Solicitud enviada!</h3>
                            <p className="register-done__text">
                                Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por correo cuando sea aprobada.
                            </p>
                            <button className="register-btn" onClick={() => navigate('/')}>
                                Ir a Humantyx
                            </button>
                        </div>
                    )}
                </div>

                <p className="register-empresa__login">
                    ¿Ya tienes cuenta? <span onClick={() => navigate('/login')}>Inicia sesión</span>
                </p>
            </div>
        </main>
    )
}