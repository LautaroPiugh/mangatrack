import { useState } from 'react'

import useI18n from '../../hooks/useI18n.js'

const buildInitialState = (initialData = {}) => ({
  title: initialData.title || '',
  description: initialData.description || '',
  visibility: initialData.visibility || 'private',
})

function MangaListForm({
  initialData = {},
  onSubmit,
  onCancel = null,
  isLoading = false,
  submitLabel,
}) {
  const { t } = useI18n()
  const [form, setForm] = useState(() => buildInitialState(initialData))
  const resolvedSubmitLabel = submitLabel || t('listForm.defaultSubmit')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      visibility: form.visibility,
    })
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <label>
        <span>{t('listForm.titleLabel')}</span>
        <input
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          minLength={2}
          maxLength={80}
          required
        />
      </label>

      <label>
        <span>{t('listForm.descriptionLabel')}</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          maxLength={500}
          placeholder={t('listForm.descriptionPlaceholder')}
        />
      </label>

      <label>
        <span>{t('listForm.visibilityLabel')}</span>
        <select name="visibility" value={form.visibility} onChange={handleChange}>
          <option value="private">{t('lists.private')}</option>
          <option value="public">{t('lists.public')}</option>
        </select>
      </label>

      <div className="profile-form-actions">
        {onCancel ? (
          <button type="button" className="filter-pill" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </button>
        ) : null}
        <button type="submit" className="primary-action" disabled={isLoading || !form.title.trim()}>
          {isLoading ? t('common.saving') : resolvedSubmitLabel}
        </button>
      </div>
    </form>
  )
}

export default MangaListForm
