import { useState } from 'react'
import './LegalPage.css'
import './FAQ.css'

const faqs = [
    {
        q: '¿Cómo me registro como candidato?',
        a: 'Haz clic en "Iniciar sesión" y usa tu cuenta de Google o LinkedIn. Tu perfil se crea automáticamente.'
    },
    {
        q: '¿Cómo creo una cuenta empresa?',
        a: 'Ve a "Crear cuenta empresa" en la página de inicio. Necesitarás tu RUC activo en SUNAT y un email para verificación.'
    },
    {
        q: '¿Cómo postulo a una vacante?',
        a: 'Haz clic en "Ver detalles" en cualquier vacante, completa tu perfil y haz clic en "Postularme". Asegúrate de tener tu CV subido.'
    },
    {
        q: '¿Cómo sé si mi postulación fue revisada?',
        a: 'En "Mis Postulaciones" puedes ver el estado de cada postulación: En proceso, Aceptado o Rechazado.'
    },
    {
        q: '¿Qué es el sistema de recomendaciones con IA?',
        a: 'Usamos inteligencia artificial para analizar tu perfil y recomendar las vacantes más compatibles contigo, considerando habilidades, idiomas y experiencia.'
    },
    {
        q: '¿Cómo publico una vacante como empresa?',
        a: 'Desde tu Dashboard, haz clic en "Nueva vacante" y completa el formulario con los detalles del puesto.'
    },
    {
        q: '¿Puedo invitar a otras personas a la plataforma?',
        a: 'Sí. Los candidatos pueden invitar hasta 5 personas. Los administradores pueden invitar candidatos o empresas sin límite.'
    },
    {
        q: '¿Cómo contacto al soporte?',
        a: 'Puedes escribirnos al formulario de contacto en el footer, por email a contacto@humantyx.com o por WhatsApp.'
    },
]

export default function FAQ() {
    const [open, setOpen] = useState(null)

    return (
        <main className="legal-page">
            <div className="container">
                <h1 className="legal-page__title">Preguntas Frecuentes</h1>
                <p className="legal-page__subtitle">Todo lo que necesitas saber sobre Humantyx Jobs</p>

                <div className="faq-list">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`faq-item ${open === i ? 'faq-item--open' : ''}`}>
                            <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                                {faq.q}
                                <span className="faq-icon">{open === i ? '−' : '+'}</span>
                            </button>
                            {open === i && <p className="faq-answer">{faq.a}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}