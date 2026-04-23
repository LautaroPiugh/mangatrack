import useFeedback from '../../hooks/useFeedback.js'

function ToastViewport() {
  const { notifications, dismissNotification } = useFeedback()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <article
          key={notification.id}
          className={`toast-card toast-${notification.variant}`}
        >
          <div className="toast-copy">
            {notification.title ? <strong>{notification.title}</strong> : null}
            <span>{notification.message}</span>
          </div>

          <button
            type="button"
            className="toast-close"
            onClick={() => dismissNotification(notification.id)}
            aria-label="Cerrar notificacion"
          >
            ×
          </button>
        </article>
      ))}
    </div>
  )
}

export default ToastViewport
