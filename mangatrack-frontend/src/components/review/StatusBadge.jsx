import { getStatusLabel } from '../../utils/formatters.js'

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{getStatusLabel(status)}</span>
}

export default StatusBadge
