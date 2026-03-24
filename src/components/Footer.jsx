import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../services/auth.service'
import './Footer.css'

export default function Footer() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSending(true)
        setError(null)
        try {
            const res = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSent(true)
            setForm({ name: '', email: '', subject: '', message: '' })
            setTimeout(() => setSent(false), 5000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">

                    <div className="footer__brand">
                        <img src="/logo.png" alt="Humantyx Jobs" className="footer__logo" />
                        <p className="footer__tagline">
                            Conectamos talento excepcional con las empresas que lo buscan.
                        </p>
                        <div className="footer__social">
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                                className="footer__social-btn" aria-label="LinkedIn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                                    <circle cx="4" cy="4" r="2" />
                                </svg>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer"
                                className="footer__social-btn" aria-label="Instagram">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <circle cx="12" cy="12" r="4" />
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                </svg>
                            </a>
                            <a href="https://wa.me/51999999999" target="_blank" rel="noreferrer"
                                className="footer__social-btn footer__social-btn--whatsapp" aria-label="WhatsApp">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.849L0 24l6.335-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.655-.502-5.184-1.381l-.37-.22-3.862.913.962-3.768-.242-.387A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="footer__links">
                        <h4 className="footer__links-title">Plataforma</h4>
                        <Link to="/" className="footer__link">Vacantes</Link>
                        <Link to="/registro-empresa" className="footer__link">Crear cuenta empresa</Link>
                        <Link to="/login" className="footer__link">Iniciar sesión</Link>
                    </div>

                    <div className="footer__links">
                        <h4 className="footer__links-title">Legal</h4>
                        <Link to="/terminos" className="footer__link">Términos y condiciones</Link>
                        <Link to="/privacidad" className="footer__link">Política de privacidad</Link>
                        <Link to="/faq" className="footer__link">Preguntas frecuentes</Link>
                        <Link to="/acerca" className="footer__link">Acerca de Humantyx</Link>
                    </div>

                    <div className="footer__contact">
                        <h4 className="footer__links-title">Contáctanos</h4>
                        <a href="mailto:contacto@humantyx.com" className="footer__contact-item">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 3h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M1 4l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            contacto@humantyx.com
                        </a>
                        <a href="https://wa.me/51999999999" target="_blank" rel="noreferrer" className="footer__contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                            </svg>
                            +51 999 999 999
                        </a>
                    </div>
                </div>

                <div className="footer__form-section">
                    <h4 className="footer__form-title">Envíanos un mensaje</h4>
                    {sent ? (
                        <div className="footer__form-success">
                            ✓ Mensaje enviado. Te responderemos pronto.
                        </div>
                    ) : (
                        <form className="footer__form" onSubmit={handleSubmit}>
                            <div className="footer__form-grid">
                                <input className="footer__input" required
                                    placeholder="Tu nombre"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                                <input className="footer__input" type="email" required
                                    placeholder="Tu email"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            <input className="footer__input" required
                                placeholder="Asunto"
                                value={form.subject}
                                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                            <textarea className="footer__input footer__textarea" required rows={4}
                                placeholder="¿En qué podemos ayudarte?"
                                value={form.message}
                                onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                            {error && <p className="footer__form-error">✗ {error}</p>}
                            <button type="submit" className="footer__form-btn" disabled={sending}>
                                {sending ? 'Enviando...' : 'Enviar mensaje'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="footer__bottom">
                    <p>© {new Date().getFullYear()} Humantyx Jobs. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
