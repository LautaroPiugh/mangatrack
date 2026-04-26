import { useState } from 'react'

import useI18n from '../../hooks/useI18n.js'

const formatDateInput = (value) => (
  value ? new Date(value).toISOString().split('T')[0] : ''
)

const buildInitialForm = (initialData = {}) => ({
  title: initialData?.title || '',
  slug: initialData?.slugSuggestion || initialData?.slug || '',
  synopsis: initialData?.synopsis || '',
  author: initialData?.author || '',
  artist: initialData?.artist || '',
  genres: initialData?.genres?.join(', ') || '',
  coverUrl: initialData?.coverUrl || initialData?.coverImage || '',
  status: initialData?.status || 'ongoing',
  chapters: initialData?.chapters || '',
  publishedFrom: formatDateInput(initialData?.publishedFrom),
  publishedTo: formatDateInput(initialData?.publishedTo),
})

function MangaFormSection({ kicker, title, description, children }) {
  return (
    <section className="manga-form-section">
      <div className="manga-form-section-header">
        <span>{kicker}</span>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="manga-form-section-body">{children}</div>
    </section>
  )
}

function MangaForm({
  initialData = {},
  onSubmit,
  isLoading,
  heading,
  description,
  submitLabel,
}) {
  const { t } = useI18n()
  const [form, setForm] = useState(() => buildInitialForm(initialData))

  const isExternalPrefill = Boolean(initialData?.source)
  const resolvedHeading = heading || t('admin.createLocalManga')
  const resolvedDescription = description || t('admin.createLocalMangaDescription')
  const resolvedSubmitLabel = submitLabel || t('admin.saveManga')
  const statusOptions = [
    { value: 'ongoing', label: t('admin.statusOptions.publishing') },
    { value: 'completed', label: t('admin.statusOptions.complete') },
    { value: 'hiatus', label: t('admin.statusOptions.hiatus') },
    { value: 'cancelled', label: t('admin.statusOptions.discontinued') },
  ]

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previousForm) => ({ ...previousForm, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const payload = {
      ...form,
      genres: form.genres.split(',').map((genre) => genre.trim()).filter((genre) => genre),
      chapters: form.chapters ? Number(form.chapters) : undefined,
      publishedFrom: form.publishedFrom || undefined,
      publishedTo: form.publishedTo || undefined,
    }

    onSubmit(payload)
  }

  const generateSlug = () => {
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setForm((previousForm) => ({ ...previousForm, slug }))
  }

  return (
    <div className="manga-form-shell">
      <div className="manga-form-heading">
        <div>
          <span className="manga-form-kicker">{isExternalPrefill ? t('admin.form.prefilledKicker') : t('admin.form.manualKicker')}</span>
          <h3>{resolvedHeading}</h3>
          <p>{resolvedDescription}</p>
        </div>

        {isExternalPrefill ? (
          <div className="manga-form-source-chip">
            <strong>{initialData.source.toUpperCase()}</strong>
            <span>{initialData.score ? `${t('common.score')} ${initialData.score}` : t('admin.form.scoreReady')}</span>
          </div>
        ) : null}
      </div>

      <div className="manga-form-overview">
        <div className="manga-form-preview-card">
          {form.coverUrl ? (
            <img
              src={form.coverUrl}
              alt={form.title || t('admin.form.noCover')}
              onError={(event) => {
                event.target.src = '/placeholder-manga.jpg'
              }}
            />
          ) : (
            <div className="manga-form-preview-placeholder">
              <strong>{t('admin.form.noCover')}</strong>
              <span>{t('admin.form.noCoverMessage')}</span>
            </div>
          )}
        </div>

        <div className="manga-form-overview-panel">
          <div className="manga-form-overview-card">
            <span>{t('admin.form.overviewStatus')}</span>
            <strong>{statusOptions.find((option) => option.value === form.status)?.label || t('admin.form.noStatus')}</strong>
          </div>
          <div className="manga-form-overview-card">
            <span>{t('admin.form.overviewChapters')}</span>
            <strong>{form.chapters || t('admin.form.noData')}</strong>
          </div>
          <div className="manga-form-overview-card">
            <span>{t('admin.form.overviewPublication')}</span>
            <strong>{form.publishedFrom || t('admin.form.pending')}</strong>
          </div>

          {initialData?.url ? (
            <a href={initialData.url} target="_blank" rel="noreferrer" className="manga-form-reference-link">
              {t('admin.form.externalFile')}
            </a>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="manga-form">
        <MangaFormSection
          kicker={t('admin.form.section1Kicker')}
          title={t('admin.form.section1Title')}
          description={t('admin.form.section1Description')}
        >
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">{t('admin.form.title')}</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">{t('admin.form.slug')}</label>
              <div className="slug-input-group">
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={form.slug}
                  onChange={handleChange}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="slug-generate-btn"
                  disabled={!form.title}
                >
                  {t('admin.form.generateSlug')}
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="author">{t('common.author')}</label>
              <input
                id="author"
                name="author"
                type="text"
                value={form.author}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="artist">{t('common.artist')}</label>
              <input
                id="artist"
                name="artist"
                type="text"
                value={form.artist}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </MangaFormSection>

        <MangaFormSection
          kicker={t('admin.form.section2Kicker')}
          title={t('admin.form.section2Title')}
          description={t('admin.form.section2Description')}
        >
          <div className="form-group">
            <label htmlFor="synopsis">{t('admin.form.synopsis')}</label>
            <textarea
              id="synopsis"
              name="synopsis"
              value={form.synopsis}
              onChange={handleChange}
              rows="6"
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="genres">{t('admin.form.genres')}</label>
            <input
              id="genres"
              name="genres"
              type="text"
              value={form.genres}
              onChange={handleChange}
              className="form-input"
              placeholder={t('admin.form.genresPlaceholder')}
            />
          </div>
        </MangaFormSection>

        <MangaFormSection
          kicker={t('admin.form.section3Kicker')}
          title={t('admin.form.section3Title')}
          description={t('admin.form.section3Description')}
        >
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">{t('admin.form.status')}</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="form-select"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="chapters">{t('admin.form.chapters')}</label>
              <input
                id="chapters"
                name="chapters"
                type="number"
                min="0"
                value={form.chapters}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="publishedFrom">{t('admin.form.publishedFrom')}</label>
              <input
                id="publishedFrom"
                name="publishedFrom"
                type="date"
                value={form.publishedFrom}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="publishedTo">{t('admin.form.publishedTo')}</label>
              <input
                id="publishedTo"
                name="publishedTo"
                type="date"
                value={form.publishedTo}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </MangaFormSection>

        <MangaFormSection
          kicker={t('admin.form.section4Kicker')}
          title={t('admin.form.section4Title')}
          description={t('admin.form.section4Description')}
        >
          <div className="form-group">
            <label htmlFor="coverUrl">{t('admin.form.coverUrl')}</label>
            <input
              id="coverUrl"
              name="coverUrl"
              type="url"
              value={form.coverUrl}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </MangaFormSection>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isLoading || !form.title.trim()}
            className="form-submit-btn"
          >
            {isLoading ? t('admin.form.saving') : resolvedSubmitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MangaForm
