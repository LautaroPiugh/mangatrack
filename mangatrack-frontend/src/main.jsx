import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import FeedbackProvider from './context/FeedbackProvider.jsx'
import { I18nProvider } from './context/I18nContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import UserLibraryProvider from './context/UserLibraryProvider.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FeedbackProvider>
      <AuthProvider>
        <I18nProvider>
          <ThemeProvider>
            <UserLibraryProvider>
              <App />
            </UserLibraryProvider>
          </ThemeProvider>
        </I18nProvider>
      </AuthProvider>
    </FeedbackProvider>
  </StrictMode>,
)
