const mongoose = require('mongoose');
const { Activity } = require('../models/Activity');
const Follow = require('../models/Follow');
const Manga = require('../models/Manga');
const MangaList = require('../models/MangaList');
const Review = require('../models/Review');
const User = require('../models/User');

const ensureCollectionIndexes = async (model) => {
  await model.createCollection().catch((error) => {
    if (error?.codeName !== 'NamespaceExists') {
      throw error;
    }
  });

  await model.syncIndexes();
};

const connectDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('Falta definir MONGODB_URI en las variables de entorno.');
  }

  await mongoose.connect(MONGODB_URI);
  await ensureCollectionIndexes(User);
  await ensureCollectionIndexes(Manga);
  await ensureCollectionIndexes(Review);
  await ensureCollectionIndexes(MangaList);
  await ensureCollectionIndexes(Activity);
  await ensureCollectionIndexes(Follow);
  console.log(`MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`);
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  console.log('Conexion con MongoDB cerrada.');
};

module.exports = {
  connectDB,
  disconnectDB,
};
