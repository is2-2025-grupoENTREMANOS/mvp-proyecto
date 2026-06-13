import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [form, setForm]             = useState({ email: '', password: '' })
  const [loading, setLoading]       = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused]       = useState('')
  const { login }                   = useAuth()
  const navigate                    = useNavigate()

  const handleChange = (e) =>
  setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const res = await authAPI.login(form.email, form.password)

      const { user, access_token } = res.data

      // SOLO guardar usuario y token
      login(user, access_token)

      toast.success(`¡Bienvenida, ${user.nombre}!`)
    } catch (error) {
        console.error(error);

        let message = 'Error al iniciar sesión';

        if (error.response?.data?.detail) {
          if (typeof error.response.data.detail === 'string') {
            message = error.response.data.detail;
          } else if (Array.isArray(error.response.data.detail)) {
            message = error.response.data.detail
              .map((e) => e.msg)
              .join(', ');
          }
        } toast.error(message);

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>

      {/* FONDO ANIMADO */}
      <div className={styles.bg}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
        <div className={styles.bgLetter}>EM</div>
      </div>

      {/* PANEL IZQUIERDO */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
            <img
              src="/logo/EntreM.jpg"
              alt="Entre Manos"
              className="login-logo"
            />      
          <div className={styles.brandTagline}>
            Donde cada cita<br />
            es una obra de <em>arte</em>
          </div>         
        </div>
      </div>

      {/* PANEL DERECHO — FORMULARIO */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>

          <div className={styles.cardHeader}>
            <h2 className={styles.welcomeTitle}>
              Bienvenida <span>de nuevo</span>
            </h2>
            <p className={styles.welcomeSub}>
              Ingresa tus credenciales para acceder al sistema de gestión.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>

            {/* EMAIL */}
            <div className={`${styles.formGroup} ${focused === 'email' ? styles.focused : ''}`}>
              <label className={styles.label} htmlFor="email">
                Correo electrónico
              </label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* CONTRASEÑA */}
            <div className={`${styles.formGroup} ${focused === 'password' ? styles.focused : ''}`}>
              <label className={styles.label} htmlFor="password">
                Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <a href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}>
              {loading ? (
                <span className={styles.loadingWrapper}>
                  <span className={styles.spinner} />
                  Verificando...
                </span>
              ) : (
                <>
                  Ingresar al sistema
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '0.5rem' }}>
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className={styles.footer}>
            ¿Eres cliente?{' '}
            <a href="/agendar">Agenda tu cita aquí →</a>
          </p>
        </div>
      </div>
    </div>
  )
}
