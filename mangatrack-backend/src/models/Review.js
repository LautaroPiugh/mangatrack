const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, 'La puntuacion es obligatoria.'],
      min: [1, 'La puntuacion minima es 1.'],
      max: [5, 'La puntuacion maxima es 5.'],
      validate: {
        validator: Number.isInteger,
        message: 'La puntuacion debe ser un numero entero.',
      },
    },
    comment: {
      type: String,
      required: [true, 'El comentario es obligatorio.'],
      trim: true,
      minlength: [5, 'El comentario debe tener al menos 5 caracteres.'],
      maxlength: [1200, 'El comentario no puede superar los 1200 caracteres.'],
    },
    status: {
      type: String,
      required: [true, 'El estado de lectura es obligatorio.'],
      enum: {
        values: ['reading', 'completed', 'planned'],
        message: 'El estado debe ser reading, completed o planned.',
      },
      default: 'planned',
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index({ user: 1, manga: 1 }, { unique: true });
reviewSchema.index({ manga: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ status: 1 });

module.exports = mongoose.model('Review', reviewSchema);
