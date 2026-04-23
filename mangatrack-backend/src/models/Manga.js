const mongoose = require('mongoose');

const normalizeOptionalString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const mangaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El titulo es obligatorio.'],
      trim: true,
      minlength: [2, 'El titulo debe tener al menos 2 caracteres.'],
      maxlength: [120, 'El titulo no puede superar los 120 caracteres.'],
    },
    author: {
      type: String,
      required: [true, 'El autor es obligatorio.'],
      trim: true,
      minlength: [2, 'El autor debe tener al menos 2 caracteres.'],
      maxlength: [80, 'El autor no puede superar los 80 caracteres.'],
    },
    genre: {
      type: String,
      required: [true, 'El genero es obligatorio.'],
      trim: true,
      maxlength: [50, 'El genero no puede superar los 50 caracteres.'],
    },
    description: {
      type: String,
      required: [true, 'La descripcion es obligatoria.'],
      trim: true,
      minlength: [20, 'La descripcion debe tener al menos 20 caracteres.'],
      maxlength: [2000, 'La descripcion no puede superar los 2000 caracteres.'],
    },
    coverImage: {
      type: String,
      default: null,
      set: normalizeOptionalString,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

mangaSchema.index({ title: 1 });
mangaSchema.index({ author: 1 });
mangaSchema.index({ genre: 1 });
mangaSchema.index({ title: 'text', author: 'text', genre: 'text' });

module.exports = mongoose.model('Manga', mangaSchema);
