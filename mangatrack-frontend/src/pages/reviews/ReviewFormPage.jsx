import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import mangaApi from '../../api/mangaApi.js'
import reviewApi from '../../api/reviewApi.js'
import { getApiErrorMessage } from '../../api/axiosClient.js'
import Alert from '../../components/common/Alert.jsx'
import Field from '../../components/common/Field.jsx'
import Loader from '../../components/common/Loader.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import useFeedback from '../../hooks/useFeedback.js'
import { ratingOptions, readingStatusOptions } from '../../utils/constants.js'

const emptyForm = {
  manga: '',
  rating: 5,
  comment: '',
  status: 'planned',
}

function ReviewFormPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditMode = mode === 'edit'
  const { notify } = useFeedback()
  const [form, setForm] = useState({
    ...emptyForm,
    manga: searchParams.get('manga') || '',
  })
  const [mangaOptions, setMangaOptions] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [mangaResponse, reviewResponse] = await Promise.all([
          mangaApi.list({ limit: 50 }),
          isEditMode ? reviewApi.getById(id) : Promise.resolve(null),
        ])

        setMangaOptions(mangaResponse.data)

        if (reviewResponse) {
          const review = reviewResponse.data
          setForm({
            manga: review.manga?._id || '',
            rating: review.rating || 5,
            comment: review.comment || '',
            status: review.status || 'planned',
          })
        } else if (searchParams.get('manga')) {
          setForm((current) => ({ ...current, manga: searchParams.get('manga') || '' }))
        }
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'No se pudo preparar el formulario de review.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadDependencies()
  }, [id, isEditMode, searchParams])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')

      const payload = {
        ...form,
        rating: Number(form.rating),
      }

      await (isEditMode ? reviewApi.update(id, payload) : reviewApi.create(payload))
      notify({
        variant: 'success',
        title: isEditMode ? 'Review actualizada' : 'Review publicada',
        message: isEditMode
          ? 'Los cambios de tu reseña se guardaron correctamente.'
          : 'Tu reseña ya forma parte del historial de MangaTrack.',
      })
      navigate(form.manga ? `/mangas/${form.manga}` : '/my-reviews')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo guardar la review.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <Loader label="Preparando formulario..." />
  }

  return (
    <div className="form-page">
      <PageHeader
        eyebrow="Reviews"
        title={isEditMode ? 'Editar review' : 'Nueva review'}
        description="Asigna una puntuacion, comenta tu experiencia y guarda el estado de lectura."
      />

      <section className="form-card">
        <form className="stack-md" onSubmit={handleSubmit}>
          <Field
            label="Manga"
            name="manga"
            as="select"
            value={form.manga}
            onChange={handleChange}
            options={[
              { value: '', label: 'Selecciona un manga' },
              ...mangaOptions.map((manga) => ({
                value: manga._id,
                label: `${manga.title} - ${manga.author}`,
              })),
            ]}
            required
          />
          <Field
            label="Puntuacion"
            name="rating"
            as="select"
            value={form.rating}
            onChange={handleChange}
            options={ratingOptions.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
            required
          />
          <Field
            label="Estado de lectura"
            name="status"
            as="select"
            value={form.status}
            onChange={handleChange}
            options={readingStatusOptions}
            required
          />
          <Field
            label="Comentario"
            name="comment"
            as="textarea"
            value={form.comment}
            onChange={handleChange}
            placeholder="Comparte una impresion clara y personal sobre la obra."
            required
          />

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="cluster">
            <button type="submit" className="button button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar review' : 'Publicar review'}
            </button>
            <Link to={form.manga ? `/mangas/${form.manga}` : '/reviews'} className="button button-ghost">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ReviewFormPage
