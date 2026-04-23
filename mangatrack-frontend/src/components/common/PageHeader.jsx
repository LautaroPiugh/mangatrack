function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <section className="page-header">
      <div>
        {eyebrow ? <span className="page-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </section>
  )
}

export default PageHeader
