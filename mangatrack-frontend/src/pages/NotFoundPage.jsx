import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="empty-state not-found-state">
      <span className="empty-state-icon">404</span>
      <h1>Página no encontrada</h1>
      <p>La ruta que intentaste abrir no existe o fue movida dentro de MangaTrack.</p>
      <div className="not-found-actions">
        <Link to="/" className="primary-action">
          Volver al inicio
        </Link>
        <Link to="/mangas" className="filter-pill">
          Ir al catálogo
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
