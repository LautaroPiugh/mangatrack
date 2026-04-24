const mongoose = require('mongoose');
const Manga = require('../models/Manga');
const Review = require('../models/Review');

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
  await ensureCollectionIndexes(Manga);
  await ensureCollectionIndexes(Review);
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
