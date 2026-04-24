import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import MangaCard from '../../components/manga/MangaCard.jsx'

const mangas = [
  { id: 1, title: 'One Piece', cover: 'https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=500', rating: 4.8, votes: 15234 },
  { id: 2, title: 'Attack on Titan', cover: 'https://images.unsplash.com/photo-1666153184621-bc6445e3568d?w=500', rating: 4.9, votes: 18492 },
  { id: 3, title: 'Death Note', cover: 'https://images.unsplash.com/photo-1760113671986-63ccb46ae202?w=500', rating: 4.7, votes: 12847 },
  { id: 4, title: 'Naruto Shippuden', cover: 'https://images.unsplash.com/photo-1673047233297-41890c998920?w=500', rating: 4.6, votes: 14523 },
  { id: 5, title: 'My Hero Academia', cover: 'https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=500', rating: 4.5, votes: 11234 },
  { id: 6, title: 'Demon Slayer', cover: 'https://images.unsplash.com/photo-1666153184621-bc6445e3568d?w=500', rating: 4.8, votes: 16789 },
  { id: 7, title: 'Jujutsu Kaisen', cover: 'https://images.unsplash.com/photo-1760113671986-63ccb46ae202?w=500', rating: 4.7, votes: 13567 },
  { id: 8, title: 'Tokyo Ghoul', cover: 'https://images.unsplash.com/photo-1673047233297-41890c998920?w=500', rating: 4.5, votes: 10234 },
  { id: 9, title: 'Fullmetal Alchemist', cover: 'https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=500', rating: 4.9, votes: 19456 },
  { id: 10, title: 'Hunter x Hunter', cover: 'https://images.unsplash.com/photo-1666153184621-bc6445e3568d?w=500', rating: 4.8, votes: 17234 },
  { id: 11, title: 'Bleach', cover: 'https://images.unsplash.com/photo-1760113671986-63ccb46ae202?w=500', rating: 4.6, votes: 15123 },
  { id: 12, title: 'Berserk', cover: 'https://images.unsplash.com/photo-1673047233297-41890c998920?w=500', rating: 4.9, votes: 20567 },
]

const filters = ['Todos', 'Favoritos', 'Pendientes', 'Leyendo', 'Completados']

function MangasPage() {
  const { searchQuery = '' } = useOutletContext() || {}
  const [filter, setFilter] = useState('Todos')

  const filteredMangas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return mangas
    return mangas.filter((manga) => manga.title.toLowerCase().includes(query))
  }, [searchQuery])

  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>Explorar Mangas</h1>
          <p>Buscá títulos, marcá favoritos y armá tu lista de pendientes.</p>
        </div>

        <div className="filter-row">
          <span className="filter-icon">⌁</span>
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? 'filter-pill filter-pill-active' : 'filter-pill'}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="figma-content">
        {filteredMangas.length ? (
          <div className="manga-grid manga-grid-wide">
            {filteredMangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">本</span>
            <h2>No hay mangas todavía</h2>
            <p>Agregá el primero para empezar.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MangasPage
