import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages

import LoginPage        from './pages/LoginPage'
import AdminDashboard   from './pages/AdminDashboard'
import ProfessionalPage from './pages/ProfessionalPage'
import PublicLanding    from './pages/PublicLanding'
import BookingPage      from './pages/BookingPage'
import NotFound         from './pages/NotFound'

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Cargando...</div>
  if (!user)   return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      
      <Route path="/profesional" element={<ProfessionalPage />} />
      <Route path="/" element={<PublicLanding />} />
      <Route path="/"        element={<PublicLanding />} />
      <Route path="/agendar" element={<BookingPage />} />
      <Route path="/login"   element={
        user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/profesional'} replace />
          : <LoginPage />
      } />

      {/* Admin */}
      <Route path="/admin/*" element={<AdminDashboard />} />
      {/* Professional */}
      <Route path="/profesional/*" element={
        <ProtectedRoute allowedRoles={['profesional']}>
          <ProfessionalPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
