import { Navigate, Outlet, useLocation } from 'react-router-dom'

import Loader from '../components/common/Loader.jsx'
import useAuth from '../hooks/useAuth.js'

function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <Loader label="Restaurando sesion..." fullscreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
