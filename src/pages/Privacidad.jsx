import './LegalPage.css'

export default function Privacidad() {
    return (
        <main className="legal-page">
            <div className="container">
                <h1 className="legal-page__title">Política de Privacidad</h1>
                <p className="legal-page__date">Última actualización: {new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                <section className="legal-section">
                    <h2>1. Datos que recopilamos</h2>
                    <p>Recopilamos nombre, email, información profesional y datos de uso de la plataforma. Los datos son proporcionados por ti al registrarte o completar tu perfil.</p>
                </section>

                <section className="legal-section">
                    <h2>2. Uso de tus datos</h2>
                    <p>Usamos tus datos para conectarte con oportunidades laborales, mejorar la plataforma y enviarte comunicaciones relevantes. No vendemos tus datos a terceros.</p>
                </section>

                <section className="legal-section">
                    <h2>3. Autenticación</h2>
                    <p>Usamos Auth0 para la autenticación. Tu contraseña nunca es almacenada en nuestros servidores.</p>
                </section>

                <section className="legal-section">
                    <h2>4. Cookies</h2>
                    <p>Usamos cookies esenciales para el funcionamiento de la plataforma. No usamos cookies de seguimiento publicitario.</p>
                </section>

                <section className="legal-section">
                    <h2>5. Tus derechos</h2>
                    <p>Tienes derecho a acceder, corregir o eliminar tus datos. Contáctanos en <a href="mailto:contacto@humantyx.com">contacto@humantyx.com</a> para ejercer estos derechos.</p>
                </section>

                <section className="legal-section">
                    <h2>6. Seguridad</h2>
                    <p>Usamos Supabase con cifrado SSL para proteger tus datos. Tomamos medidas razonables para proteger tu información.</p>
                </section>
            </div>
        </main>
    )
}