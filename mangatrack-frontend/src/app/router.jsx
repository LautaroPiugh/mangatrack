import { createBrowserRouter } from 'react-router-dom'

import RootLayout from '../components/layout/RootLayout.jsx'
import ProtectedRoute from '../routes/ProtectedRoute.jsx'
import PublicOnlyRoute from '../routes/PublicOnlyRoute.jsx'
import HomePage from '../pages/HomePage.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import VerifyAccountPage from '../pages/auth/VerifyAccountPage.jsx'
import MangasPage from '../pages/mangas/MangasPage.jsx'
import MangaDetailPage from '../pages/mangas/MangaDetailPage.jsx'
import ReviewsPage from '../pages/reviews/ReviewsPage.jsx'
import ProfilePage from '../pages/user/ProfilePage.jsx'
import LibraryPage from '../pages/user/LibraryPage.jsx'
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
    path: '/verify/:token',
    element: <VerifyAccountPage />,
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
            path: 'mangas/:slug',
            element: <MangaDetailPage />,
          },
          {
            path: 'reviews',
            element: <ReviewsPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'library',
            element: <LibraryPage />,
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
