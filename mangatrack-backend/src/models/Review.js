const mongoose = require('mongoose');
const { normalizeOptionalString } = require('../utils/user');

const isValidRatingStep = (value) => Number.isFinite(value) && Number.isInteger(value * 2);

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, 'La puntuacion es obligatoria.'],
      min: [0.5, 'La puntuacion minima es 0.5.'],
      max: [5, 'La puntuacion maxima es 5.'],
      validate: {
        validator: isValidRatingStep,
        message: 'La puntuacion debe ser un multiplo de 0.5.',
      },
    },
    content: {
      type: String,
      default: null,
      set: normalizeOptionalString,
      trim: true,
      maxlength: [1000, 'El contenido no puede superar los 1000 caracteres.'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio.'],
    },
    manga: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manga',
      required: [true, 'El manga es obligatorio.'],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index({ user: 1, manga: 1 }, { unique: true });
reviewSchema.index({ manga: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
