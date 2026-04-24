require('dotenv').config();

const { connectDB, disconnectDB } = require('../config/db');
const Manga = require('../models/Manga');
const { generateSlug } = require('../utils/manga');

const mangaSeeds = [
  {
    title: 'One Piece',
    synopsis: 'Monkey D. Luffy zarpa en busca del One Piece para convertirse en el Rey de los Piratas.',
    author: 'Eiichiro Oda',
    artist: 'Eiichiro Oda',
    genres: ['Action', 'Adventure', 'Fantasy'],
    coverUrl: 'https://placehold.co/600x900/111827/f9fafb?text=One+Piece',
    status: 'ongoing',
    chapters: 1120,
    averageRating: 4.9,
    ratingsCount: 2450,
  },
  {
    title: 'Attack on Titan',
    synopsis: 'La humanidad lucha por sobrevivir dentro de murallas mientras descubre el origen de los titanes.',
    author: 'Hajime Isayama',
    artist: 'Hajime Isayama',
    genres: ['Action', 'Drama', 'Dark Fantasy'],
    coverUrl: 'https://placehold.co/600x900/111827/f9fafb?text=Attack+on+Titan',
    status: 'completed',
    chapters: 139,
    averageRating: 4.8,
    ratingsCount: 1980,
  },
  {
    title: 'Death Note',
    synopsis: 'Un estudiante encuentra un cuaderno mortal y comienza un duelo intelectual contra el detective L.',
    author: 'Tsugumi Ohba',
    artist: 'Takeshi Obata',
    genres: ['Mystery', 'Thriller', 'Supernatural'],
    coverUrl: 'https://placehold.co/600x900/111827/f9fafb?text=Death+Note',
    status: 'completed',
    chapters: 108,
    averageRating: 4.7,
    ratingsCount: 1640,
  },
  {
    title: 'Naruto Shippuden',
    synopsis: 'Naruto regresa más fuerte para rescatar a su amigo y enfrentar la amenaza de Akatsuki.',
    author: 'Masashi Kishimoto',
    artist: 'Masashi Kishimoto',
    genres: ['Action', 'Adventure', 'Shonen'],
    coverUrl: 'https://placehold.co/600x900/111827/f9fafb?text=Naruto+Shippuden',
    status: 'completed',
    chapters: 700,
    averageRating: 4.6,
    ratingsCount: 1735,
  },
  {
    title: 'My Hero Academia',
    synopsis: 'En un mundo de superpoderes, Izuku Midoriya busca convertirse en un gran héroe.',
    author: 'Kohei Horikoshi',
    artist: 'Kohei Horikoshi',
    genres: ['Action', 'School', 'Superhero'],
    coverUrl: 'https://placehold.co/600x900/111827/f9fafb?text=My+Hero+Academia',
    status: 'completed',
    chapters: 430,
    averageRating: 4.4,
    ratingsCount: 1320,
  },
  {
    title: 'Demon Slayer',
    synopsis: 'Tanjiro lucha contra demonios mientras busca curar a su hermana convertida en uno de ellos.',
    author: 'Koyoharu Gotouge',
    artist: 'Koyoharu Gotouge',
    genres: ['Action', 'Historical', 'Supernatural'],
    coverUrl: 'https://placehold.co/600x900/111827/f9fafb?text=Demon+Slayer',
    status: 'completed',
    chapters: 205,
    averageRating: 4.6,
    ratingsCount: 1485,
  },
  {
    title: 'Jujutsu Kaisen',
    synopsis: 'Yuji Itadori entra en el mundo de las maldiciones tras ingerir un objeto prohibido.',
    author: 'Gege Akutami',
    artist: 'Gege Akutami',
    genres: ['Action', 'Horror', 'Supernatural'],
    coverUrl: 'https://placehold.co/600x900/111827/f9fafb?text=Jujutsu+Kaisen',
    status: 'ongoing',
    chapters: 280,
    averageRating: 4.7,
    ratingsCount: 1410,
  },
  {
    title: 'Chainsaw Man',
    synopsis: 'Denji se fusiona con su demonio motosierra y entra en una cacería brutal de demonios.',
    author: 'Tatsuki Fujimoto',
    artist: 'Tatsuki Fujimoto',
    genres: ['Action', 'Dark Fantasy', 'Horror'],
    coverUrl: 'https://placehold.co/600x900/111827/f9fafb?text=Chainsaw+Man',
    status: 'ongoing',
    chapters: 196,
    averageRating: 4.5,
    ratingsCount: 1205,
  },
  {
    title: 'Berserk',
    synopsis: 'Guts atraviesa un mundo devastado por demonios, guerra y traición en busca de venganza.',
    author: 'Kentaro Miura',
    artist: 'Kentaro Miura',
    genres: ['Action', 'Dark Fantasy', 'Seinen'],
    coverUrl: 'https://placehold.co/600x900/111827/f9fafb?text=Berserk',
    status: 'hiatus',
    chapters: 378,
    averageRating: 5,
    ratingsCount: 2100,
  },
];

const seedMangas = async () => {
  const operations = mangaSeeds.map((manga) => ({
    updateOne: {
      filter: { slug: generateSlug(manga.title) },
      update: {
        $setOnInsert: {
          ...manga,
          slug: generateSlug(manga.title),
        },
      },
      upsert: true,
    },
  }));

  const result = await Manga.bulkWrite(operations, { ordered: true });
  console.log(JSON.stringify({
    inserted: result.upsertedCount,
    matched: result.matchedCount,
    modified: result.modifiedCount,
  }, null, 2));
};

const run = async () => {
  try {
    await connectDB();
    await seedMangas();
  } catch (error) {
    console.error('No se pudo ejecutar seed:mangas:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();
