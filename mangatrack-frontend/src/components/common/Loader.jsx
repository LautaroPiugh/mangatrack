function Loader({ label = 'Cargando...', fullscreen = false }) {
  return (
    <div className={fullscreen ? 'loader-shell loader-shell-fullscreen' : 'loader-shell'}>
      <span className="loader-spinner" />
      <span className="loader-label">{label}</span>
    </div>
  )
}

export default Loader
