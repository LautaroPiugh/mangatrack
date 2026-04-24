import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import authService from '../../services/authService.js'

function VerifyAccountPage() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Estamos verificando tu cuenta...')

  useEffect(() => {
    let isMounted = true

    const verifyAccount = async () => {
      try {
        const response = await authService.verifyAccount(token)

        if (!isMounted) {
          return
        }

        setStatus('success')
        setMessage(response.message || 'La cuenta fue verificada correctamente.')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setStatus('error')
        setMessage(error.message || 'No se pudo verificar la cuenta.')
      }
    }

    verifyAccount()

    return () => {
      isMounted = false
    }
  }, [token])

  return (
    <section className="empty-state not-found-state">
      <span className="empty-state-icon">{status === 'success' ? 'OK' : status === 'error' ? '!' : '...'}</span>
      <h1>
        {status === 'success'
          ? 'Cuenta verificada'
          : status === 'error'
            ? 'No se pudo verificar la cuenta'
            : 'Verificando cuenta'}
      </h1>
      <p>{message}</p>
      <div className="not-found-actions">
        {status === 'success' ? (
          <Link to="/login" className="primary-action">
            Ir a iniciar sesión
          </Link>
        ) : null}
        <Link to="/" className="filter-pill">
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}

export default VerifyAccountPage
