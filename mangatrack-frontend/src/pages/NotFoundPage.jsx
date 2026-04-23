import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="empty-state empty-state-large">
      <div className="empty-state-mark">404</div>
      <h1>Pagina no encontrada</h1>
      <p>La ruta que intentaste abrir no existe o fue movida dentro de MangaTrack.</p>
      <div className="cluster">
        <Link to="/" className="button button-primary">
          Volver al inicio
        </Link>
        <Link to="/mangas" className="button button-ghost">
          Ir al catalogo
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
