import { createBrowserRouter } from 'react-router-dom'

import RootLayout from '../components/layout/RootLayout.jsx'
import ProtectedRoute from '../routes/ProtectedRoute.jsx'
import PublicOnlyRoute from '../routes/PublicOnlyRoute.jsx'
import HomePage from '../pages/HomePage.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import MangasPage from '../pages/mangas/MangasPage.jsx'
import ReviewsPage from '../pages/reviews/ReviewsPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'mangas',
            element: <MangasPage />,
          },
          {
            path: 'reviews',
            element: <ReviewsPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default router
