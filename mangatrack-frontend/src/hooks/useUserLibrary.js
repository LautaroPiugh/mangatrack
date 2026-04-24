import { useContext } from 'react'

import UserLibraryContext from '../context/user-library-context.js'

function useUserLibrary() {
  const context = useContext(UserLibraryContext)

  if (!context) {
    throw new Error('useUserLibrary debe usarse dentro de UserLibraryProvider.')
  }

  return context
}

export default useUserLibrary
