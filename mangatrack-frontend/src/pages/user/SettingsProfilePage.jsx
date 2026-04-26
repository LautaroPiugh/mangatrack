import { useMemo, useState } from 'react'

import AvatarSelector from '../../components/user/AvatarSelector.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'
import useTheme from '../../hooks/useTheme.js'
import profileService from '../../services/profileService.js'

const buildInitialForm = (user) => ({
  username: user?.username || '',
  displayName: user?.displayName || '',
  avatar: user?.avatar || '',
  bio: user?.bio || '',
  preferredLanguage: user?.preferences?.language || 'es',
  theme: user?.preferences?.theme || 'dark',
})

function SettingsProfilePage() {
  const { user, refreshUser } = useAuth()
  const { notify } = useFeedback()
  const { t, setLanguage } = useI18n()
  const { setTheme } = useTheme()
  const baseForm = useMemo(() => buildInitialForm(user), [user])
  const [draft, setDraft] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const form = {
    ...baseForm,
    ...draft,
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setDraft((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      await profileService.updateMyProfile(form)
      setTheme(form.theme, { persist: false })
      setLanguage(form.preferredLanguage)
      await refreshUser()

      setDraft({})

      notify({
        variant: 'success',
        title: t('settings.updatedTitle'),
        message: t('settings.updatedMessage'),
      })
    } catch (saveError) {
      notify({
        variant: 'error',
        title: t('settings.updateErrorTitle'),
        message: saveError.message || 'Intentá nuevamente.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.subtitle')}</p>
        </div>
      </section>

      <div className="figma-content">
        <section className="figma-section profile-form-panel">
          <div className="section-title">
            <span>⚙</span>
            <h2>{t('settings.editProfile')}</h2>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <label>
              <span>{t('settings.username')}</span>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                minLength={3}
                maxLength={30}
                required
              />
            </label>

            <label>
              <span>{t('settings.displayName')}</span>
              <input
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange}
                maxLength={60}
                placeholder={t('settings.displayNamePlaceholder')}
              />
            </label>

            <AvatarSelector
              value={form.avatar}
              onSelect={(avatarId) =>
                setDraft((current) => ({
                  ...current,
                  avatar: avatarId,
                }))
              }
            />

            <label>
              <span>{t('settings.bio')}</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                maxLength={280}
                placeholder={t('settings.bioPlaceholder')}
              />
            </label>

            <div className="profile-form-grid">
              <label>
                <span>{t('settings.preferredLanguage')}</span>
                <select name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange}>
                  <option value="es">{t('settings.languageSpanish')}</option>
                  <option value="en">{t('settings.languageEnglish')}</option>
                </select>
              </label>

              <label>
                <span>{t('settings.theme')}</span>
                <select name="theme" value={form.theme} onChange={handleChange}>
                  <option value="dark">{t('settings.dark')}</option>
                  <option value="light">{t('settings.light')}</option>
                </select>
              </label>
            </div>

            <div className="profile-form-actions">
              <button type="submit" className="primary-action" disabled={isSaving}>
                {isSaving ? t('settings.saving') : t('settings.saveProfile')}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export default SettingsProfilePage
