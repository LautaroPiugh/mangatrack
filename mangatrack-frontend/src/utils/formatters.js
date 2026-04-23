const statusLabelMap = {
  planned: 'Planned',
  reading: 'Reading',
  completed: 'Completed',
}

export const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const getStatusLabel = (status) => statusLabelMap[status] || status

export const getInitials = (text = '') => (
  text
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join('')
)
