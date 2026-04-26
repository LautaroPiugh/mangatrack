import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'

const TOAST_ICONS = {
  success: '✓',
  error: '!',
  warning: '!',
  info: 'i',
}

function ToastViewport() {
  const { notifications, dismissNotification } = useFeedback()
  const { t } = useI18n()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <article
          key={notification.id}
          className={`toast-card toast-${notification.variant}`}
          data-variant={notification.variant}
        >
          <span className="toast-icon" aria-hidden="true">
            {TOAST_ICONS[notification.variant] || TOAST_ICONS.info}
          </span>

          <div className="toast-copy">
            {notification.title ? <strong>{notification.title}</strong> : null}
            <span>{notification.message}</span>
          </div>

          <button
            type="button"
            className="toast-close"
            onClick={() => dismissNotification(notification.id)}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </article>
      ))}
    </div>
  )
}

export default ToastViewport
