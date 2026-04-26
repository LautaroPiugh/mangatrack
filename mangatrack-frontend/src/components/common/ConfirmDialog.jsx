import { createPortal } from 'react-dom'

import useI18n from '../../hooks/useI18n.js'

function ConfirmDialog({
  open = false,
  title,
  description = '',
  confirmLabel,
  cancelLabel,
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const { t } = useI18n()

  if (!open) {
    return null
  }

  const resolvedTitle = title || t('confirmDialog.defaultTitle')
  const resolvedConfirmLabel = confirmLabel || t('confirmDialog.defaultConfirm')
  const resolvedCancelLabel = cancelLabel || t('common.cancel')

  return createPortal(
    <div
      className="confirm-dialog-backdrop confirm-dialog-overlay"
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog-header">
          <h2>{resolvedTitle}</h2>
        </div>

        {description ? (
          <div className="confirm-dialog-body">
            <p>{description}</p>
          </div>
        ) : null}

        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="filter-pill"
            onClick={onCancel}
            disabled={loading}
          >
            {resolvedCancelLabel}
          </button>
          <button
            type="button"
            className={`primary-action ${variant === 'danger' ? 'action-danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? t('common.processing') : resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ConfirmDialog
