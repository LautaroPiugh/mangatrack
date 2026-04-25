import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import FeedbackProvider from './context/FeedbackProvider.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import UserLibraryProvider from './context/UserLibraryProvider.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FeedbackProvider>
      <AuthProvider>
        <ThemeProvider>
          <UserLibraryProvider>
            <App />
          </UserLibraryProvider>
        </ThemeProvider>
      </AuthProvider>
    </FeedbackProvider>
  </StrictMode>,
)
