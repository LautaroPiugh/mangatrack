import { Link, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import authApi from '../../api/authApi.js'
import { getApiErrorMessage } from '../../api/axiosClient.js'
import Alert from '../../components/common/Alert.jsx'
import Loader from '../../components/common/Loader.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import useFeedback from '../../hooks/useFeedback.js'

function VerifyAccountPage() {
  const { token } = useParams()
  const { notify } = useFeedback()
  const hasRequestedVerification = useRef(false)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (hasRequestedVerification.current) {
      return
    }

    hasRequestedVerification.current = true

    const verifyAccount = async () => {
      try {
        setStatus('loading')
        const response = await authApi.verifyAccount(token)
        setMessage(response.message)
        notify({
          variant: 'success',
          title: 'Cuenta verificada',
          message: 'Ya puedes iniciar sesion en MangaTrack.',
        })
        setStatus('success')
      } catch (requestError) {
        setMessage(getApiErrorMessage(requestError, 'No se pudo verificar la cuenta.'))
        setStatus('error')
      }
    }

    verifyAccount()
  }, [notify, token])

  return (
    <div className="form-page">
      <PageHeader
        eyebrow="Verificacion"
        title="Activacion de cuenta"
        description="Estamos validando el enlace enviado por correo para habilitar tu acceso."
      />

      <section className="form-card">
        {status === 'loading' ? <Loader label="Verificando cuenta..." /> : null}
        {status === 'success' ? <Alert variant="success">{message}</Alert> : null}
        {status === 'error' ? <Alert variant="error">{message}</Alert> : null}

        <div className="cluster">
          <Link to="/login" className="button button-primary">
            Ir a login
          </Link>
          <Link to="/register" className="button button-ghost">
            Volver al registro
          </Link>
        </div>
      </section>
    </div>
  )
}

export default VerifyAccountPage
