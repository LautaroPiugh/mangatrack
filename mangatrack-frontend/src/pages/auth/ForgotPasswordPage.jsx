import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import AuthUtilityVisual from '../../components/auth/AuthUtilityVisual.jsx'
import authService from '../../services/authService.js'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('idle')
    setMessage('')
    setIsSubmitting(true)

    try {
      const data = await authService.forgotPassword({ email })
      setStatus('success')
      setMessage(data?.message || 'Si existe una cuenta con ese email, enviaremos instrucciones para recuperar la contraseña.')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'No se pudo procesar la solicitud. Intentá nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-form-side">
        <div className="auth-panel">
          <Link to="/" className="auth-brand auth-brand-blue">
            <span>本</span>
            <div>
              <strong>MangaTrack</strong>
              <small>Tu biblioteca personal</small>
            </div>
          </Link>

          <div className="auth-title">
            <h1>Olvidaste la contraseña</h1>
            <p>Te mandamos un enlace para que puedas crear una contraseña nueva.</p>
          </div>

          <form className="figma-auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <div className="input-shell">
                <span>✉</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="usuario@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <button type="submit" className="auth-submit auth-submit-blue" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
              <span>→</span>
            </button>
          </form>

          {message ? (
            <p className={`auth-feedback ${status === 'success' ? 'auth-feedback-success' : 'auth-feedback-error'}`}>
              {message}
            </p>
          ) : null}

          <p className="auth-switch-copy">
            ¿Recordaste tu contraseña? <Link to="/login">Ingresar</Link>
          </p>
          <p className="auth-switch-copy">
            ¿Tu cuenta sigue sin activarse? <Link to="/resend-verification">Reenviar verificación</Link>
          </p>
          <p className="auth-switch-copy">
            <button type="button" className="auth-inline-button" onClick={() => navigate(-1)}>
              Volver a la pantalla anterior
            </button>
          </p>
        </div>
      </div>

      <AuthUtilityVisual variant="password" />
    </section>
  )
}

export default ForgotPasswordPage
