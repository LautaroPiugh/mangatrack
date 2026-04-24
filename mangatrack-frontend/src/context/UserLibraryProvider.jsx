import { useCallback, useEffect, useMemo, useState } from 'react'

import useAuth from '../hooks/useAuth.js'
import useFeedback from '../hooks/useFeedback.js'
import userLibraryService from '../services/userLibraryService.js'
import UserLibraryContext from './user-library-context.js'

const getMangaId = (manga) => manga?._id || manga?.id || null

function UserLibraryProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const { notify } = useFeedback()
  const [favorites, setFavorites] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const refreshLibrary = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([])
      setWatchlist([])
      setHasLoaded(false)
      return {
        favorites: [],
        watchlist: [],
      }
    }

    const [favoriteItems, watchlistItems] = await Promise.all([
      userLibraryService.getFavorites(),
      userLibraryService.getWatchlist(),
    ])

    setFavorites(favoriteItems || [])
    setWatchlist(watchlistItems || [])

    return {
      favorites: favoriteItems || [],
      watchlist: watchlistItems || [],
    }
  }, [isAuthenticated])

  useEffect(() => {
    let isMounted = true

    const loadLibrary = async () => {
      if (!isAuthenticated) {
        setFavorites([])
        setWatchlist([])
        setIsLoading(false)
        setHasLoaded(false)
        return
      }

      setIsLoading(true)

      try {
        const nextLibrary = await refreshLibrary()

        if (!isMounted) {
          return
        }

        setFavorites(nextLibrary.favorites)
        setWatchlist(nextLibrary.watchlist)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setFavorites([])
        setWatchlist([])
        notify({
          variant: 'error',
          title: 'Biblioteca no disponible',
          message: error.message || 'No se pudieron cargar favoritos y pendientes.',
        })
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setHasLoaded(true)
        }
      }
    }

    loadLibrary()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, notify, refreshLibrary, user?.id])

  const addFavorite = useCallback(async (mangaId) => {
    const previousFavorites = favorites
    const optimisticFavorites = previousFavorites.some((item) => getMangaId(item) === mangaId)
      ? previousFavorites
      : [...previousFavorites, { _id: mangaId }]

    setFavorites(optimisticFavorites)

    try {
      const nextFavorites = await userLibraryService.addFavorite(mangaId)
      setFavorites(nextFavorites || optimisticFavorites)
      return nextFavorites || optimisticFavorites
    } catch (error) {
      setFavorites(previousFavorites)
      throw error
    }
  }, [favorites])

  const removeFavorite = useCallback(async (mangaId) => {
    const previousFavorites = favorites
    const optimisticFavorites = previousFavorites.filter((item) => getMangaId(item) !== mangaId)

    setFavorites(optimisticFavorites)

    try {
      const nextFavorites = await userLibraryService.removeFavorite(mangaId)
      setFavorites(nextFavorites || optimisticFavorites)
      return nextFavorites || optimisticFavorites
    } catch (error) {
      setFavorites(previousFavorites)
      throw error
    }
  }, [favorites])

  const addToWatchlist = useCallback(async (mangaId) => {
    const previousWatchlist = watchlist
    const optimisticWatchlist = previousWatchlist.some((item) => getMangaId(item) === mangaId)
      ? previousWatchlist
      : [...previousWatchlist, { _id: mangaId }]

    setWatchlist(optimisticWatchlist)

    try {
      const nextWatchlist = await userLibraryService.addToWatchlist(mangaId)
      setWatchlist(nextWatchlist || optimisticWatchlist)
      return nextWatchlist || optimisticWatchlist
    } catch (error) {
      setWatchlist(previousWatchlist)
      throw error
    }
  }, [watchlist])

  const removeFromWatchlist = useCallback(async (mangaId) => {
    const previousWatchlist = watchlist
    const optimisticWatchlist = previousWatchlist.filter((item) => getMangaId(item) !== mangaId)

    setWatchlist(optimisticWatchlist)

    try {
      const nextWatchlist = await userLibraryService.removeFromWatchlist(mangaId)
      setWatchlist(nextWatchlist || optimisticWatchlist)
      return nextWatchlist || optimisticWatchlist
    } catch (error) {
      setWatchlist(previousWatchlist)
      throw error
    }
  }, [watchlist])

  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => getMangaId(item)).filter(Boolean)),
    [favorites],
  )

  const watchlistIds = useMemo(
    () => new Set(watchlist.map((item) => getMangaId(item)).filter(Boolean)),
    [watchlist],
  )

  const value = useMemo(() => ({
    favorites,
    watchlist,
    favoriteIds,
    watchlistIds,
    isLoading,
    hasLoaded,
    isFavorite: (mangaId) => favoriteIds.has(mangaId),
    isInWatchlist: (mangaId) => watchlistIds.has(mangaId),
    addFavorite,
    removeFavorite,
    addToWatchlist,
    removeFromWatchlist,
    refreshLibrary,
  }), [
    addFavorite,
    addToWatchlist,
    favoriteIds,
    favorites,
    hasLoaded,
    isLoading,
    refreshLibrary,
    removeFavorite,
    removeFromWatchlist,
    watchlist,
    watchlistIds,
  ])

  return <UserLibraryContext.Provider value={value}>{children}</UserLibraryContext.Provider>
}

export default UserLibraryProvider
