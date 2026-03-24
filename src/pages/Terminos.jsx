import './LegalPage.css'

export default function Terminos() {
    return (
        <main className="legal-page">
            <div className="container">
                <h1 className="legal-page__title">Términos y Condiciones</h1>
                <p className="legal-page__date">Última actualización: {new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

                <section className="legal-section">
                    <h2>1. Aceptación de los términos</h2>
                    <p>Al acceder y usar Humantyx Jobs, aceptas estos términos y condiciones. Si no estás de acuerdo, no uses la plataforma.</p>
                </section>

                <section className="legal-section">
                    <h2>2. Uso de la plataforma</h2>
                    <p>Humantyx Jobs es una plataforma de matching de talento que conecta candidatos con empresas. Está prohibido el uso fraudulento, la publicación de información falsa o el acceso no autorizado a cuentas de terceros.</p>
                </section>

                <section className="legal-section">
                    <h2>3. Cuentas de usuario</h2>
                    <p>Eres responsable de mantener la confidencialidad de tu cuenta. Notifícanos inmediatamente si detectas uso no autorizado.</p>
                </section>

                <section className="legal-section">
                    <h2>4. Contenido</h2>
                    <p>Las empresas son responsables de la veracidad de las vacantes publicadas. Los candidatos son responsables de la información de su perfil.</p>
                </section>

                <section className="legal-section">
                    <h2>5. Propiedad intelectual</h2>
                    <p>Todo el contenido de Humantyx Jobs, incluyendo el logo, diseño y código, es propiedad de Humantyx. No está permitida su reproducción sin autorización.</p>
                </section>

                <section className="legal-section">
                    <h2>6. Limitación de responsabilidad</h2>
                    <p>Humantyx no garantiza el éxito en procesos de selección ni la veracidad de la información publicada por terceros.</p>
                </section>

                <section className="legal-section">
                    <h2>7. Contacto</h2>
                    <p>Para consultas sobre estos términos, escríbenos a <a href="mailto:contacto@humantyx.com">contacto@humantyx.com</a></p>
                </section>
            </div>
        </main>
    )
}
