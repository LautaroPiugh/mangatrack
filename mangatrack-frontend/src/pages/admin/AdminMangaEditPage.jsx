import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import MangaForm from '../../components/admin/MangaForm.jsx'
import mangaService from '../../services/mangaService.js'

function AdminMangaEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [manga, setManga] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadManga = async () => {
      setLoadError('')

      try {
        const data = await mangaService.getManga(id)

        if (!isMounted) {
          return
        }

        setManga(data)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setLoadError(error.message || 'Error al cargar manga')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadManga()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleSubmit = async (payload) => {
    setIsSaving(true)
    setSaveError('')

    try {
      await mangaService.updateManga(id, payload)
      navigate('/admin/mangas')
    } catch (err) {
      setSaveError(err.message || 'Error al actualizar manga')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <p>Cargando...</p>
  if (loadError) return <p>{loadError}</p>
  if (!manga) return <p>Manga no encontrado</p>

  return (
    <div className="admin-manga-edit-page">
      <div className="admin-page-header">
        <h1>Editar manga</h1>
        <p>Actualizá la ficha interna y revisá los datos importados o creados manualmente.</p>
      </div>

      {saveError ? (
        <div className="admin-error-message">
          <p>{saveError}</p>
        </div>
      ) : null}

      <MangaForm
        key={manga._id}
        initialData={manga}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        heading={`Editar ${manga.title}`}
        description="Modificá la metadata principal, las imágenes y el estado de publicación."
        submitLabel="Guardar cambios"
      />
    </div>
  )
}

export default AdminMangaEditPage
