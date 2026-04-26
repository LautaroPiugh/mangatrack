import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import FeedbackContext from './feedback-context.js'

let notificationId = 0

function FeedbackProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const timeoutMapRef = useRef(new Map())

  const dismissNotification = useCallback((id) => {
    const timeoutId = timeoutMapRef.current.get(id)

    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutMapRef.current.delete(id)
    }

    setNotifications((current) => current.filter((item) => item.id !== id))
  }, [])

  const notify = useCallback((payload) => {
    notificationId += 1

    const nextNotification = {
      id: notificationId,
      variant: payload.variant || 'info',
      title: payload.title || '',
      message: payload.message || '',
      duration: payload.duration ?? 3200,
    }

    setNotifications((current) => [...current, nextNotification])

    if (nextNotification.duration > 0) {
      const timeoutId = window.setTimeout(() => {
        timeoutMapRef.current.delete(nextNotification.id)
        setNotifications((current) => current.filter((item) => item.id !== nextNotification.id))
      }, nextNotification.duration)

      timeoutMapRef.current.set(nextNotification.id, timeoutId)
    }
  }, [])

  useEffect(() => () => {
    timeoutMapRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId)
    })
    timeoutMapRef.current.clear()
  }, [])

  const value = useMemo(() => ({
    notifications,
    notify,
    dismissNotification,
  }), [dismissNotification, notifications, notify])

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

export default FeedbackProvider
