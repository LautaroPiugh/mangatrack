import { useState } from 'react'

const statusOptions = [
  { value: 'ongoing', label: 'En publicación' },
  { value: 'completed', label: 'Finalizado' },
  { value: 'hiatus', label: 'En pausa' },
  { value: 'cancelled', label: 'Cancelado' },
]

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
  heading = 'Crear manga local',
  description = 'Completá los datos principales del manga antes de publicarlo en MangaTrack.',
  submitLabel = 'Guardar manga',
}) {
  const [form, setForm] = useState(() => buildInitialForm(initialData))

  const isExternalPrefill = Boolean(initialData?.source)

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
          <span className="manga-form-kicker">{isExternalPrefill ? 'Datos precompletados' : 'Carga manual'}</span>
          <h3>{heading}</h3>
          <p>{description}</p>
        </div>

        {isExternalPrefill ? (
          <div className="manga-form-source-chip">
            <strong>{initialData.source.toUpperCase()}</strong>
            <span>{initialData.score ? `Score ${initialData.score}` : 'Importación externa lista para revisar'}</span>
          </div>
        ) : null}
      </div>

      <div className="manga-form-overview">
        <div className="manga-form-preview-card">
          {form.coverUrl ? (
            <img
              src={form.coverUrl}
              alt={form.title || 'Vista previa de portada'}
              onError={(event) => {
                event.target.src = '/placeholder-manga.jpg'
              }}
            />
          ) : (
            <div className="manga-form-preview-placeholder">
              <strong>Sin portada</strong>
              <span>Agregá una imagen para revisar cómo se verá en catálogo.</span>
            </div>
          )}
        </div>

        <div className="manga-form-overview-panel">
          <div className="manga-form-overview-card">
            <span>Estado</span>
            <strong>{statusOptions.find((option) => option.value === form.status)?.label || 'Sin estado'}</strong>
          </div>
          <div className="manga-form-overview-card">
            <span>Capítulos</span>
            <strong>{form.chapters || 'Sin dato'}</strong>
          </div>
          <div className="manga-form-overview-card">
            <span>Publicación</span>
            <strong>{form.publishedFrom || 'Pendiente'}</strong>
          </div>

          {initialData?.url ? (
            <a href={initialData.url} target="_blank" rel="noreferrer" className="manga-form-reference-link">
              Ver ficha externa
            </a>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="manga-form">
        <MangaFormSection
          kicker="Sección 1"
          title="Datos principales"
          description="Título, slug y responsables creativos del manga."
        >
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Título *</label>
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
              <label htmlFor="slug">Slug</label>
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
                  Generar
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="author">Autor</label>
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
              <label htmlFor="artist">Artista</label>
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
          kicker="Sección 2"
          title="Descripción y géneros"
          description="Este bloque se usa en listados, detalle y descubrimiento."
        >
          <div className="form-group">
            <label htmlFor="synopsis">Sinopsis</label>
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
            <label htmlFor="genres">Géneros</label>
            <input
              id="genres"
              name="genres"
              type="text"
              value={form.genres}
              onChange={handleChange}
              className="form-input"
              placeholder="Action, Drama, Fantasy..."
            />
          </div>
        </MangaFormSection>

        <MangaFormSection
          kicker="Sección 3"
          title="Publicación"
          description="Estado actual, cantidad de capítulos y fechas relevantes."
        >
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Estado</label>
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
              <label htmlFor="chapters">Capítulos</label>
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
              <label htmlFor="publishedFrom">Publicado desde</label>
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
              <label htmlFor="publishedTo">Publicado hasta</label>
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
          kicker="Sección 4"
          title="Imágenes"
          description="Portada principal del manga para tarjetas y detalle."
        >
          <div className="form-group">
            <label htmlFor="coverUrl">URL de portada</label>
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
            {isLoading ? 'Guardando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MangaForm
