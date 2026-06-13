import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
      fontFamily: 'var(--font-body)', background: 'var(--color-bg)'
    }}>
      <span style={{ fontSize: '48px' }}>✦</span>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary-dark)', fontSize: '36px' }}>
        404
      </h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Página no encontrada</p>
      <Link to="/" style={{
        background: 'var(--color-primary)', color: '#fff',
        padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '500'
      }}>
        Volver al inicio
      </Link>
    </div>
  )
}
