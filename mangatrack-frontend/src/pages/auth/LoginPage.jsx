import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import ImageWithFallback from '../../components/common/ImageWithFallback.jsx'
import useAuth from '../../hooks/useAuth.js'

const mangaPosters = [
  'https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=500',
  'https://images.unsplash.com/photo-1666153184621-bc6445e3568d?w=500',
  'https://images.unsplash.com/photo-1760113671986-63ccb46ae202?w=500',
  'https://images.unsplash.com/photo-1673047233297-41890c998920?w=500',
]

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ username, password })
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión. Revisá tu usuario y contraseña e intentá otra vez.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-form-side">
        <div className="auth-panel">
          <Link to="/" className="auth-brand">
            <span>本</span>
            <div>
              <strong>MangaTrack</strong>
              <small>Tu biblioteca personal</small>
            </div>
          </Link>

          <div className="auth-title">
            <h1>Iniciar sesión</h1>
            <p>Accedé para seguir tus mangas</p>
          </div>

          <form className="figma-auth-form" onSubmit={handleLogin}>
            <label>
              <span>Usuario</span>
              <div className="input-shell">
                <span>@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="tu_usuario"
                  required
                  autoComplete="username"
                />
              </div>
            </label>

            <label>
              <span>Contraseña</span>
              <div className="input-shell">
                <span>●</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </label>

            <button type="submit" className="auth-submit">
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              <span>→</span>
            </button>
          </form>

          {error ? <p className="auth-feedback auth-feedback-error">{error}</p> : null}

          <p className="auth-switch-copy">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </p>

          <p className="auth-switch-copy">
            ¿No tenés cuenta? <Link to="/register">Crear una cuenta</Link>
          </p>
          <p className="auth-switch-copy">
            <Link to="/resend-verification">Reenviar correo de verificación</Link>
          </p>
        </div>
      </div>

      <div className="auth-visual-side auth-visual-login">
        <div className="poster-cloud">
          {mangaPosters.map((poster, index) => (
            <div key={poster} className="poster-float" style={{ '--delay': `${index * 80}ms` }}>
              <ImageWithFallback src={poster} alt={`Manga ${index + 1}`} className="poster-float-image" />
            </div>
          ))}
        </div>

        <div className="auth-visual-caption">
          <h2>Tu colección, organizada</h2>
          <p>Descubrí nuevos títulos, guardá tus favoritos y compartí tus opiniones con la comunidad.</p>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
