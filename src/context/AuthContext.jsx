import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { API_URL, buildHeaders } from '../services/auth.service'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { user, isLoading, isAuthenticated, loginWithRedirect, logout: auth0Logout, getAccessTokenSilently } = useAuth0()
  const [role, setRole] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchRole()
    } else {
      setRole(null)
    }
  }, [isAuthenticated])

  const fetchRole = async () => {
    try {
      const token = await getAccessTokenSilently()
      const res = await fetch(`${API_URL}/candidate/me`, { headers: buildHeaders(token) })
      if (res.ok) {
        const data = await res.json()
        const userRole = data.user?.role || 'candidate'
        setRole(userRole)
        return userRole
      }
    } catch {
      setRole('candidate')
      return 'candidate'
    }
  }

  const loginWithGoogle = () => loginWithRedirect({
    authorizationParams: { connection: 'google-oauth2', prompt: 'select_account' },
    appState: { returnTo: '/profile' },
  })

  const loginWithLinkedIn = () => loginWithRedirect({
    authorizationParams: { connection: 'linkedin', prompt: 'select_account' },
    appState: { returnTo: '/profile' },
  })

  const loginWithMicrosoft = () => loginWithRedirect({
    authorizationParams: { connection: 'windowslive', prompt: 'select_account' },
    appState: { returnTo: '/profile' },
  })

  const logout = () => auth0Logout({ logoutParams: { returnTo: window.location.origin } })

  const getToken = async () => {
    try { return await getAccessTokenSilently() }
    catch { return null }
  }

  return (
    <AuthContext.Provider value={{
      user: isAuthenticated ? user : null,
      loading: isLoading,
      isAuthenticated,
      role,
      loginWithGoogle,
      loginWithLinkedIn,
      loginWithMicrosoft,
      logout,
      getToken,
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}