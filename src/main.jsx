import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  useNavigate
} from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import AppRoutes from './AppRoutes'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import './index.css'

function Auth0ProviderWithNavigate() {
  const navigate = useNavigate()

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
        <Footer />
      </AuthProvider>
    </Auth0Provider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <ScrollToTop />
      <Auth0ProviderWithNavigate />
    </BrowserRouter>
  </StrictMode>,
)
