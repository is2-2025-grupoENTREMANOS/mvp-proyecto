import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import PublicLanding    from './pages/PublicLanding';
import LoginPage        from './pages/LoginPage';
import AdminDashboard   from './pages/AdminDashboard';
import ProfessionalPage from './pages/ProfessionalPage';
import BookingPage      from './pages/BookingPage';
import NotFound         from './pages/NotFound';
import ClientPortal from './pages/ClientPortal';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', fontFamily:'Inter,sans-serif',
      fontSize:'14px', color:'#7A7A7A'
    }}>
      Cargando...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to={user.rol === 'admin' ? '/admin' : '/profesional'} replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    return <Navigate to={user.rol === 'admin' ? '/admin' : '/profesional'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>

      <Route path="/mis-citas" element={<ClientPortal />} />
      {/* Siempre accesible */}
      <Route path="/"        element={<PublicLanding />} />
      <Route path="/booking" element={<BookingPage />} />

      {/* Solo sin sesión */}
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />

      {/* Protegidas por rol */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/profesional" element={
        <ProtectedRoute requiredRole="profesional">
          <ProfessionalPage />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}