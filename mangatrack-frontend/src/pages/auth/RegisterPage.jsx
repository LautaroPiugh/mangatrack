import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import ImageWithFallback from '../../components/common/ImageWithFallback.jsx'
import useAuth from '../../hooks/useAuth.js'

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
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })

      if (response.token) {
        navigate('/', { replace: true })
        return
      }

      setSuccess(response.message || 'Revisá tu correo para verificar la cuenta.')
      window.setTimeout(() => navigate('/login'), 1800)
    } catch (registerError) {
      setError(registerError.message || 'No se pudo crear la cuenta. Intentá nuevamente.')
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
                <input name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" required />
              </div>
            </label>

            <label>
              <span>Email</span>
              <div className="input-shell">
                <span>✉</span>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" required />
              </div>
            </label>

            <label>
              <span>Contraseña</span>
              <div className="input-shell">
                <span>●</span>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
              </div>
            </label>

            <label>
              <span>Confirmar contraseña</span>
              <div className="input-shell">
                <span>●</span>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
              </div>
            </label>

            <button type="submit" className="auth-submit auth-submit-orange">
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
