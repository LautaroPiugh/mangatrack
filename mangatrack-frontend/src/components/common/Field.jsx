function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  as = 'input',
  options = [],
  rows = 5,
  required = false,
}) {
  const fieldId = `field-${name}`

  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required ? <span className="field-required">*</span> : null}
      </span>

      {as === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className={`field-control ${error ? 'field-control-error' : ''}`}
        />
      ) : null}

      {as === 'select' ? (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`field-control ${error ? 'field-control-error' : ''}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {as === 'input' ? (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`field-control ${error ? 'field-control-error' : ''}`}
        />
      ) : null}

      {error ? <span className="field-error">{error}</span> : null}
      {!error && helperText ? <span className="field-helper">{helperText}</span> : null}
    </label>
  )
}

export default Field
