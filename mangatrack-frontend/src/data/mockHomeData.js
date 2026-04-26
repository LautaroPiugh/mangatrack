export const fallbackHeroStats = {
  spotlight: 'Modo showcase',
}

export const fallbackRecentMangas = [
  {
    _id: 'mock-manga-1',
    title: 'Crimson Alley',
    author: 'Studio Kiro',
    genre: 'Cyber Drama',
    description: 'Una ciudad nocturna, neones rotos y una caceria emocional entre clanes editoriales.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.8,
      totalReviews: 92,
    },
    isMock: true,
  },
  {
    _id: 'mock-manga-2',
    title: 'Sakura Protocol',
    author: 'Aoi Works',
    genre: 'Sci-Fi',
    description: 'Una piloto novata descubre que cada combate revela memorias borradas de una Tokio imposible.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.5,
      totalReviews: 61,
    },
    isMock: true,
  },
  {
    _id: 'mock-manga-3',
    title: 'Ink District',
    author: 'MangaTrack Lab',
    genre: 'Mystery',
    description: 'Detectives, imprentas antiguas y mensajes escondidos entre paginas que nadie debia leer.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.6,
      totalReviews: 44,
    },
    isMock: true,
  },
  {
    _id: 'mock-manga-4',
    title: 'Moon over Akiba',
    author: 'Yoru Press',
    genre: 'Romance',
    description: 'Dos coleccionistas compiten por la misma edición imposible mientras cae la lluvia sobre la ciudad.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.3,
      totalReviews: 38,
    },
    isMock: true,
  },
  {
    _id: 'mock-manga-5',
    title: 'Paper Ronin',
    author: 'Kite House',
    genre: 'Action',
    description: 'Espadas, tinta y honor en una guerra clandestina contada como si cada capitulo fuera un duelo.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.9,
      totalReviews: 110,
    },
    isMock: true,
  },
  {
    _id: 'mock-manga-6',
    title: 'Velvet Shibuya',
    author: 'Signal Shelf',
    genre: 'Thriller',
    description: 'Una presentadora desaparece y la verdad se esconde entre clubes, posters rotos y callejones de lluvia.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.4,
      totalReviews: 57,
    },
    isMock: true,
  },
]

export const fallbackTopMangas = [
  ...fallbackRecentMangas,
  {
    _id: 'mock-manga-7',
    title: 'Midnight Shrine',
    author: 'Torii Lab',
    genre: 'Fantasy',
    description: 'Espiritus errantes y guardianes silenciosos protegen un barrio que existe entre dos mundos.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.7,
      totalReviews: 81,
    },
    isMock: true,
  },
  {
    _id: 'mock-manga-8',
    title: 'Station Zero',
    author: 'Northbound',
    genre: 'Drama',
    description: 'La ultima estacion del tren conecta vidas rotas que buscan una segunda oportunidad.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.2,
      totalReviews: 34,
    },
    isMock: true,
  },
  {
    _id: 'mock-manga-9',
    title: 'Tokyo Static',
    author: 'Noise Frame',
    genre: 'Seinen',
    description: 'Una banda pirata transmite mensajes prohibidos mientras la ciudad entra en silencio.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.1,
      totalReviews: 28,
    },
    isMock: true,
  },
  {
    _id: 'mock-manga-10',
    title: 'Cherry Voltage',
    author: 'Matsu Studio',
    genre: 'Slice of Life',
    description: 'Una cafetería temática une músicos, dibujantes y estudiantes en una primavera eléctrica.',
    coverImage: '',
    reviewSummary: {
      averageRating: 4.0,
      totalReviews: 25,
    },
    isMock: true,
  },
]

export const fallbackFeaturedReviews = [
  {
    _id: 'mock-review-1',
    rating: 5,
    status: 'completed',
    comment: 'Tiene ritmo, atmosfera y una puesta visual que parece hecha para maratonear tomos completos.',
    createdAt: '2026-04-20T12:00:00.000Z',
    updatedAt: '2026-04-20T12:00:00.000Z',
    isMock: true,
    user: {
      name: 'Club de lectura',
    },
    manga: {
      title: 'Paper Ronin',
    },
  },
  {
    _id: 'mock-review-2',
    rating: 4,
    status: 'reading',
    comment: 'Gran mezcla de misterio urbano y sensibilidad japonesa. Entra por la estética y se queda por los personajes.',
    createdAt: '2026-04-18T12:00:00.000Z',
    updatedAt: '2026-04-18T12:00:00.000Z',
    isMock: true,
    user: {
      name: 'Editor invitado',
    },
    manga: {
      title: 'Ink District',
    },
  },
  {
    _id: 'mock-review-3',
    rating: 5,
    status: 'planned',
    comment: 'Hasta como recomendación de portada funciona: tiene un imaginario claro y vende muy bien la idea de la app.',
    createdAt: '2026-04-16T12:00:00.000Z',
    updatedAt: '2026-04-16T12:00:00.000Z',
    isMock: true,
    user: {
      name: 'Panel editorial',
    },
    manga: {
      title: 'Sakura Protocol',
    },
  },
]
