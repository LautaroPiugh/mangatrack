function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) {
    return null
  }

  return (
    <div className="pagination-shell">
      <button
        type="button"
        className="button button-ghost"
        onClick={() => onPageChange(meta.page - 1)}
        disabled={meta.page <= 1}
      >
        Anterior
      </button>

      <span className="pagination-copy">
        Pagina {meta.page} de {meta.totalPages}
      </span>

      <button
        type="button"
        className="button button-ghost"
        onClick={() => onPageChange(meta.page + 1)}
        disabled={meta.page >= meta.totalPages}
      >
        Siguiente
      </button>
    </div>
  )
}

export default Pagination
