import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import mangaApi from '../../api/mangaApi.js'
import { getApiErrorMessage } from '../../api/axiosClient.js'
import Alert from '../../components/common/Alert.jsx'
import Field from '../../components/common/Field.jsx'
import Loader from '../../components/common/Loader.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import useFeedback from '../../hooks/useFeedback.js'

const emptyForm = {
  title: '',
  author: '',
  genre: '',
  description: '',
  coverImage: '',
}

function MangaFormPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = mode === 'edit'
  const { notify } = useFeedback()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isEditMode) {
      return
    }

    const loadManga = async () => {
      try {
        setIsLoading(true)
        const response = await mangaApi.getById(id)
        const manga = response.data

        setForm({
          title: manga.title || '',
          author: manga.author || '',
          genre: manga.genre || '',
          description: manga.description || '',
          coverImage: manga.coverImage || '',
        })
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'No se pudo cargar el manga para editar.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadManga()
  }, [id, isEditMode])

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
        coverImage: form.coverImage.trim() || undefined,
      }

      const response = isEditMode
        ? await mangaApi.update(id, payload)
        : await mangaApi.create(payload)

      notify({
        variant: 'success',
        title: isEditMode ? 'Manga actualizado' : 'Manga creado',
        message: isEditMode
          ? 'Los cambios del manga se guardaron correctamente.'
          : 'El manga fue agregado al catalogo.',
      })
      navigate(`/mangas/${response.data._id}`)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo guardar el manga.'))
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
        eyebrow="Gestion de catalogo"
        title={isEditMode ? 'Editar manga' : 'Nuevo manga'}
        description="Completa los datos principales del manga para incorporarlo al catalogo del sistema."
      />

      <section className="form-card">
        <form className="stack-md" onSubmit={handleSubmit}>
          <Field
            label="Titulo"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ej. Monster"
            required
          />
          <Field
            label="Autor"
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Ej. Naoki Urasawa"
            required
          />
          <Field
            label="Genero"
            name="genre"
            value={form.genre}
            onChange={handleChange}
            placeholder="Ej. Thriller"
            required
          />
          <Field
            label="URL de portada"
            name="coverImage"
            value={form.coverImage}
            onChange={handleChange}
            placeholder="https://..."
            helperText="Opcional. Si lo dejas vacio, se mostrara un placeholder elegante."
          />
          <Field
            label="Descripcion"
            name="description"
            as="textarea"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe brevemente la obra, su tono y su atractivo."
            required
          />

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="cluster">
            <button type="submit" className="button button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar manga' : 'Crear manga'}
            </button>
            <Link to={isEditMode ? `/mangas/${id}` : '/mangas'} className="button button-ghost">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}

export default MangaFormPage
