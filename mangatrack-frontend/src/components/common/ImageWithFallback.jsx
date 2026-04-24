import { useState } from 'react'

function ImageWithFallback({ src, alt, className, fallbackClassName = '', ...props }) {
  const [didError, setDidError] = useState(false)

  if (!src || didError) {
    return (
      <div className={`image-fallback ${fallbackClassName || className || ''}`} aria-label={alt}>
        <span>MT</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setDidError(true)}
      decoding="async"
      {...props}
    />
  )
}

export default ImageWithFallback
