import { Routes, Route } from 'react-router-dom'
import Vacancies from './pages/Vacancies'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './routes/ProtectedRoutes'
import MisPostulaciones from './pages/MisPostulaciones'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Vacancies />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/mis-postulaciones" element={
        <ProtectedRoute><MisPostulaciones /></ProtectedRoute>
      } />
    </Routes>
  )
}
