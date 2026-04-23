function Alert({ variant = 'info', title, children }) {
  return (
    <div className={`alert alert-${variant}`}>
      {title ? <strong>{title}</strong> : null}
      <span>{children}</span>
    </div>
  )
}

export default Alert
