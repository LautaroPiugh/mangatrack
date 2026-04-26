import { createContext } from 'react'

const I18nContext = createContext({
  language: 'es',
  setLanguage: () => {},
  t: (key) => key,
})

export default I18nContext
