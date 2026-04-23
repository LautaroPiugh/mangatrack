import { useCallback, useMemo, useState } from 'react'

import FeedbackContext from './feedback-context.js'

let notificationId = 0

function FeedbackProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const dismissNotification = useCallback((id) => {
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
      window.setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== nextNotification.id))
      }, nextNotification.duration)
    }
  }, [])

  const value = useMemo(() => ({
    notifications,
    notify,
    dismissNotification,
  }), [dismissNotification, notifications, notify])

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

export default FeedbackProvider
