import { useContext } from 'react'

import FeedbackContext from '../context/feedback-context.js'

function useFeedback() {
  const context = useContext(FeedbackContext)

  if (!context) {
    throw new Error('useFeedback debe usarse dentro de FeedbackProvider.')
  }

  return context
}

export default useFeedback
