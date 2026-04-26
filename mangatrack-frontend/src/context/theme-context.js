import { createContext } from 'react'

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  isLoading: false,
})

export default ThemeContext
