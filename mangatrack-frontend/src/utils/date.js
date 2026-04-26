const getLanguage = () => {
  if (typeof document === 'undefined') {
    return 'es'
  }

  const lang = document.documentElement.lang || 'es'
  return lang.toLowerCase().startsWith('en') ? 'en' : 'es'
}

const getDateLocale = () => (getLanguage() === 'en' ? 'en-US' : 'es-AR')

export const formatRelativeDate = (value) => {
  const language = getLanguage()

  if (!value) {
    return language === 'en' ? 'Just now' : 'Hace un momento'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return language === 'en' ? 'Just now' : 'Hace un momento'
  }

  const diffInMinutes = Math.max(Math.floor((Date.now() - date.getTime()) / 60000), 0)

  if (diffInMinutes < 1) {
    return language === 'en' ? 'Just now' : 'Hace un momento'
  }

  if (diffInMinutes < 60) {
    return language === 'en'
      ? `${diffInMinutes} min ago`
      : `Hace ${diffInMinutes} min`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInHours < 24) {
    return language === 'en'
      ? `${diffInHours} h ago`
      : `Hace ${diffInHours} h`
  }

  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays < 7) {
    return language === 'en'
      ? `${diffInDays} d ago`
      : `Hace ${diffInDays} d`
  }

  return new Intl.DateTimeFormat(getDateLocale(), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const formatLongDate = (value, fallback) => {
  const resolvedFallback = fallback || (getLanguage() === 'en' ? 'Date unavailable' : 'Fecha no disponible')

  if (!value) {
    return resolvedFallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return resolvedFallback
  }

  return new Intl.DateTimeFormat(getDateLocale(), {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
