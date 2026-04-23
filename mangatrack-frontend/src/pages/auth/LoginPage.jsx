import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '../../api/axiosClient.js'
import Alert from '../../components/common/Alert.jsx'
import Field from '../../components/common/Field.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFeedback from '../../hooks/useFeedback.js'

function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useFeedback()
  const { isAuthenticated, login } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/my-reviews" replace />
  }

  const redirectTo = location.state?.from?.pathname || '/my-reviews'

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')
      await login(form)
      notify({
        variant: 'success',
        title: 'Sesion iniciada',
        message: 'Bienvenido nuevamente a MangaTrack.',
      })
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo iniciar sesion.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <PageHeader
        eyebrow="Acceso"
        title="Iniciar sesion"
        description="Accede a tu cuenta para gestionar tus mangas, reviews y progreso de lectura."
      />

      <section className="form-card">
        <form className="stack-md" onSubmit={handleSubmit}>
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            required
          />
          <Field
            label="Contrasena"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Tu contrasena"
            required
          />

          {error ? <Alert variant="error">{error}</Alert> : null}

          <button type="submit" className="button button-primary button-block" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        <p className="muted-copy">
          No tienes cuenta? <Link to="/register">Registrate aqui</Link>
        </p>
      </section>
    </div>
  )
}

export default LoginPage
