import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { getApiErrorMessage } from '../../api/axiosClient.js'
import Alert from '../../components/common/Alert.jsx'
import Field from '../../components/common/Field.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFeedback from '../../hooks/useFeedback.js'

function RegisterPage() {
  const { notify } = useFeedback()
  const { isAuthenticated, register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/my-reviews" replace />
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.password !== form.confirmPassword) {
      setError('Las contrasenas no coinciden.')
      setSuccess('')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const response = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })

      setSuccess(response.message)
      notify({
        variant: 'success',
        title: 'Registro completado',
        message: 'La cuenta fue creada. Revisa tu email para verificarla.',
      })
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo completar el registro.'))
      setSuccess('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <PageHeader
        eyebrow="Autenticacion"
        title="Crear cuenta"
        description="Registrate con email y verifica tu cuenta para empezar a crear mangas y publicar reviews."
      />

      <section className="form-card">
        <form className="stack-md" onSubmit={handleSubmit}>
          <Field
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej. Lautaro Gomez"
            required
          />
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
            placeholder="Minimo 8 caracteres"
            required
          />
          <Field
            label="Confirmar contrasena"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repite la contrasena"
            required
          />

          {error ? <Alert variant="error">{error}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}

          <button type="submit" className="button button-primary button-block" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="muted-copy">
          Ya tienes una cuenta? <Link to="/login">Inicia sesion</Link>
        </p>
      </section>
    </div>
  )
}

export default RegisterPage
