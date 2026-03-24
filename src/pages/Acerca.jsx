import './LegalPage.css'
import './Acerca.css'

export default function Acerca() {
    return (
        <main className="legal-page">
            <div className="container">
                <div className="acerca-hero">
                    <img src="/logo.png" alt="Humantyx Jobs" className="acerca-logo" />
                    <h1 className="legal-page__title">Acerca de Humantyx</h1>
                    <p className="acerca-tagline">Portal de empleo con inteligencia artificial para Perú</p>
                </div>

                <section className="legal-section">
                    <h2>Nuestra misión</h2>
                    <p>Conectar talento excepcional con las empresas que lo buscan, usando tecnología de punta para hacer el proceso de selección más eficiente y humano.</p>
                </section>

                <section className="legal-section">
                    <h2>¿Qué nos hace diferentes?</h2>
                    <div className="acerca-features">
                        <div className="acerca-feature">
                            <span className="acerca-feature__icon">✨</span>
                            <h3>IA de matching</h3>
                            <p>Usamos inteligencia artificial para conectar candidatos con vacantes compatibles según sus habilidades, idiomas y experiencia.</p>
                        </div>
                        <div className="acerca-feature">
                            <span className="acerca-feature__icon">🔒</span>
                            <h3>Verificación de empresas</h3>
                            <p>Todas las empresas son verificadas con su RUC ante SUNAT antes de publicar vacantes.</p>
                        </div>
                        <div className="acerca-feature">
                            <span className="acerca-feature__icon">🇵🇪</span>
                            <h3>Hecho en Perú</h3>
                            <p>Diseñado específicamente para el mercado laboral peruano, con soporte en español y integración con SUNAT.</p>
                        </div>
                    </div>
                </section>

                <section className="legal-section">
                    <h2>Contacto</h2>
                    <p>Email: <a href="mailto:contacto@humantyx.com">contacto@humantyx.com</a></p>
                    <p>WhatsApp: <a href="https://wa.me/51999999999">+51 999 999 999</a></p>
                </section>
            </div>
        </main>
    )
}