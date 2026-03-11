import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import AppRoutes from './AppRoutes'
import './index.css'

function Auth0ProviderWithNavigate() {
  const navigate = useNavigate()

  // Solo incluir audience si está definido en .env
  // Si no tienes una API creada en Auth0, déjalo vacío en .env
  const authParams = {
    redirect_uri: window.location.origin,
    scope: 'openid profile email',
  }
  if (import.meta.env.VITE_AUTH0_AUDIENCE) {
    authParams.audience = import.meta.env.VITE_AUTH0_AUDIENCE
  }

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={authParams}
      onRedirectCallback={(appState) => {
        navigate(appState?.returnTo ?? '/profile', { replace: true })
      }}
    >
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </Auth0Provider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate />
    </BrowserRouter>
  </StrictMode>,
)
