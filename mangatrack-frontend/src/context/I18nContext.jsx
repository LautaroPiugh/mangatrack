import { useCallback, useEffect, useMemo, useState } from 'react'

import useAuth from '../hooks/useAuth.js'
import I18nContext from './i18n-context.js'
import { AVAILABLE_LANGUAGES, translations } from '../i18n/translations.js'

const LANGUAGE_STORAGE_KEY = 'mangatrack-language'

const getStoredLanguage = () => {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'es'
  } catch {
    return 'es'
  }
}

const persistLanguage = (language) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // ignore persistence errors
  }
}

const getValueFromKey = (source, key) => key
  .split('.')
  .reduce((currentValue, keyPart) => currentValue?.[keyPart], source)

const interpolate = (template, values = {}) => {
  if (typeof template !== 'string') {
    return template
  }

  return template.replace(/\{(\w+)\}/g, (_, token) => values[token] ?? `{${token}}`)
}

export function I18nProvider({ children }) {
  const { user } = useAuth()
  const userKey = user?.id || user?._id || 'guest'
  const [pendingLanguage, setPendingLanguage] = useState(null)
  const userLanguage = user?.preferences?.language || null
  const storedLanguage = getStoredLanguage()
  const optimisticLanguage = pendingLanguage?.userKey === userKey && pendingLanguage.value !== userLanguage
    ? pendingLanguage.value
    : null
  const language = optimisticLanguage || userLanguage || storedLanguage || 'es'

  useEffect(() => {
    document.documentElement.lang = language
    persistLanguage(language)
  }, [language])

  const setLanguage = useCallback((nextLanguage) => {
    if (!AVAILABLE_LANGUAGES.includes(nextLanguage)) {
      return
    }

    setPendingLanguage({
      userKey,
      value: nextLanguage,
    })
    persistLanguage(nextLanguage)
  }, [userKey])

  const t = useCallback((key, values = {}) => {
    const selectedTranslation = getValueFromKey(translations[language], key)
    const fallbackTranslation = getValueFromKey(translations.es, key)
    const template = selectedTranslation ?? fallbackTranslation ?? key

    return interpolate(template, values)
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}
