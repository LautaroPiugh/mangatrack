import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'

import AuthUtilityVisual from '../../components/auth/AuthUtilityVisual.jsx'
import authService from '../../services/authService.js'

const PASSWORD_RULES = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.'
const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/
const MISSING_TOKEN_MESSAGE = 'El token de restablecimiento no está presente. Solicitá un nuevo enlace desde la página de olvido de contraseña.'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentStatus = token ? status : 'error'
  const currentMessage = token ? message : MISSING_TOKEN_MESSAGE

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!token) {
      setStatus('error')
      setMessage('El token de restablecimiento no es válido.')
      return
    }

    if (!STRONG_PASSWORD_REGEX.test(password)) {
      setStatus('error')
      setMessage(PASSWORD_RULES)
      return
    }

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await authService.resetPassword({ token, password })
      setStatus('success')
      setMessage(data?.message || 'Contraseña restablecida correctamente.')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'No se pudo restablecer la contraseña. Intentá nuevamente.')
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
            <h1>Restablecer contraseña</h1>
            <p>Creá una nueva contraseña para tu cuenta.</p>
          </div>

          {!token ? (
            <div className="figma-auth-form">
              <p className="auth-feedback auth-feedback-error">{currentMessage}</p>
              <Link to="/forgot-password" className="auth-submit auth-submit-blue">
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : (
            <form className="figma-auth-form" onSubmit={handleSubmit}>
              <label>
                <span>Nueva contraseña</span>
                <div className="input-shell">
                  <span>●</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <label>
                <span>Repetir contraseña</span>
                <div className="input-shell">
                  <span>●</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <button type="submit" className="auth-submit auth-submit-blue" disabled={isSubmitting}>
                {isSubmitting ? 'Restableciendo...' : 'Cambiar contraseña'}
                <span>→</span>
              </button>
            </form>
          )}

          {token && currentMessage ? (
            <p className={`auth-feedback ${currentStatus === 'success' ? 'auth-feedback-success' : 'auth-feedback-error'}`}>
              {currentMessage}
            </p>
          ) : null}

          <p className="auth-switch-copy">
            ¿Ya podés ingresar? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </div>

      <AuthUtilityVisual variant="password" />
    </section>
  )
}

export default ResetPasswordPage
