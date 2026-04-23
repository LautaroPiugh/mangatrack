import { createBrowserRouter } from 'react-router-dom'

import RootLayout from '../components/layout/RootLayout.jsx'
import ProtectedRoute from '../routes/ProtectedRoute.jsx'
import HomePage from '../pages/HomePage.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import VerifyAccountPage from '../pages/auth/VerifyAccountPage.jsx'
import MangaDetailPage from '../pages/mangas/MangaDetailPage.jsx'
import MangaFormPage from '../pages/mangas/MangaFormPage.jsx'
import MangasPage from '../pages/mangas/MangasPage.jsx'
import MyReviewsPage from '../pages/reviews/MyReviewsPage.jsx'
import ReviewFormPage from '../pages/reviews/ReviewFormPage.jsx'
import ReviewsPage from '../pages/reviews/ReviewsPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'verify/:token',
        element: <VerifyAccountPage />,
      },
      {
        path: 'mangas',
        element: <MangasPage />,
      },
      {
        path: 'mangas/:id',
        element: <MangaDetailPage />,
      },
      {
        path: 'reviews',
        element: <ReviewsPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'mangas/new',
            element: <MangaFormPage mode="create" />,
          },
          {
            path: 'mangas/:id/edit',
            element: <MangaFormPage mode="edit" />,
          },
          {
            path: 'reviews/new',
            element: <ReviewFormPage mode="create" />,
          },
          {
            path: 'reviews/:id/edit',
            element: <ReviewFormPage mode="edit" />,
          },
          {
            path: 'my-reviews',
            element: <MyReviewsPage />,
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
