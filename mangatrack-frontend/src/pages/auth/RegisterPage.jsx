import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import ImageWithFallback from '../../components/common/ImageWithFallback.jsx'
import useAuth from '../../hooks/useAuth.js'

const PASSWORD_REQUIREMENTS = 'Usá entre 8 y 72 caracteres, con al menos una mayúscula, un número y un símbolo.'
const USERNAME_HINT = 'Entre 3 y 30 caracteres. Solo letras, números, puntos, guiones y guion bajo.'

const mangaPosters = [
  'https://images.unsplash.com/photo-1666153184621-bc6445e3568d?w=500',
  'https://images.unsplash.com/photo-1767700629009-c5b5dc7b5947?w=500',
  'https://images.unsplash.com/photo-1760113671986-63ccb46ae202?w=500',
  'https://images.unsplash.com/photo-1673047233297-41890c998920?w=500',
]

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const buildFieldErrors = (details = []) => details.reduce((accumulator, detail) => {
    if (detail?.field && detail?.message && !accumulator[detail.field]) {
      accumulator[detail.field] = detail.message
    }

    return accumulator
  }, {})

  const isStrongPassword = (value) => /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/.test(value)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFieldErrors((current) => {
      if (!current[name] && !(name === 'password' && current.confirmPassword)) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[name]

      if (name === 'password') {
        delete nextErrors.confirmPassword
      }

      return nextErrors
    })
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})
    setSuccess('')

    if (!isStrongPassword(form.password)) {
      setFieldErrors({ password: PASSWORD_REQUIREMENTS })
      setError('Revisá los campos marcados.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setFieldErrors({
        password: 'Las contraseñas no coinciden.',
        confirmPassword: 'Las contraseñas no coinciden.',
      })
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await register({
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
      })

      if (response.token) {
        navigate('/', { replace: true })
        return
      }

      const emailSent = response.data?.emailDelivery?.sent !== false

      setSuccess(
        response.message
          || (emailSent
            ? 'Revisá tu correo para verificar la cuenta.'
            : 'La cuenta fue creada, pero el correo de verificación no pudo enviarse ahora.')
      )

      if (emailSent) {
        window.setTimeout(() => navigate('/login'), 1800)
      }
    } catch (registerError) {
      const nextFieldErrors = buildFieldErrors(registerError.details)
      const message = registerError.message || 'No se pudo crear la cuenta. Intentá nuevamente.'

      if (message.toLowerCase().includes('username') && !nextFieldErrors.username) {
        nextFieldErrors.username = message
      }

      if (message.toLowerCase().includes('email') && !nextFieldErrors.email) {
        nextFieldErrors.email = message
      }

      if (message.toLowerCase().includes('contrasena') && !nextFieldErrors.password) {
        nextFieldErrors.password = message
      }

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors)
      }

      setError(
        Object.keys(nextFieldErrors).length > 0
          ? 'Revisá los campos marcados.'
          : message
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen auth-screen-register">
      <div className="auth-visual-side auth-visual-register">
        <div className="poster-cloud">
          {mangaPosters.map((poster, index) => (
            <div key={poster} className="poster-float" style={{ '--delay': `${index * 80}ms` }}>
              <ImageWithFallback src={poster} alt={`Manga ${index + 1}`} className="poster-float-image" />
            </div>
          ))}
        </div>

        <div className="auth-visual-caption">
          <h2>Unite a la comunidad</h2>
          <p>Miles de lectores ya organizan sus mangas en MangaTrack. Es gratis y simple.</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-panel">
          <Link to="/" className="auth-brand auth-brand-orange">
            <span>本</span>
            <div>
              <strong>MangaTrack</strong>
              <small>Tu biblioteca personal</small>
            </div>
          </Link>

          <div className="auth-title">
            <h1>Crear cuenta</h1>
            <p>Empezá a organizar tus lecturas</p>
          </div>

          <form className="figma-auth-form" onSubmit={handleRegister}>
            <label>
              <span>Nombre</span>
              <div className="input-shell">
                <span>人</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                  autoComplete="name"
                />
              </div>
              {fieldErrors.name ? <p className="auth-field-error">{fieldErrors.name}</p> : null}
            </label>

            <label>
              <span>Usuario</span>
              <div className="input-shell">
                <span>@</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="tu_usuario"
                  required
                  autoComplete="username"
                />
              </div>
              <p className="auth-field-hint">{USERNAME_HINT}</p>
              {fieldErrors.username ? <p className="auth-field-error">{fieldErrors.username}</p> : null}
            </label>

            <label>
              <span>Email</span>
              <div className="input-shell">
                <span>✉</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email ? <p className="auth-field-error">{fieldErrors.email}</p> : null}
            </label>

            <label>
              <span>Contraseña</span>
              <div className="input-shell">
                <span>●</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Manga123!"
                  required
                  autoComplete="new-password"
                />
              </div>
              <p className="auth-field-hint">{PASSWORD_REQUIREMENTS}</p>
              {fieldErrors.password ? <p className="auth-field-error">{fieldErrors.password}</p> : null}
            </label>

            <label>
              <span>Confirmar contraseña</span>
              <div className="input-shell">
                <span>●</span>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Manga123!"
                  required
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.confirmPassword ? <p className="auth-field-error">{fieldErrors.confirmPassword}</p> : null}
            </label>

            <button type="submit" className="auth-submit auth-submit-orange" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              <span>→</span>
            </button>
          </form>

          {error ? <p className="auth-feedback auth-feedback-error">{error}</p> : null}
          {success ? <p className="auth-feedback auth-feedback-success">{success}</p> : null}

          <p className="auth-switch-copy">
            ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage
