const mongoose = require('mongoose');

const { normalizeOptionalString } = require('../utils/user');

const mangaListItemSchema = new mongoose.Schema(
  {
    manga: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manga',
      required: [true, 'El manga es obligatorio.'],
    },
    note: {
      type: String,
      default: null,
      set: normalizeOptionalString,
      trim: true,
      maxlength: [280, 'La nota no puede superar los 280 caracteres.'],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, 'El orden no puede ser negativo.'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const mangaListSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El owner es obligatorio.'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'El titulo de la lista es obligatorio.'],
      trim: true,
      minlength: [2, 'El titulo debe tener al menos 2 caracteres.'],
      maxlength: [80, 'El titulo no puede superar los 80 caracteres.'],
    },
    description: {
      type: String,
      default: null,
      set: normalizeOptionalString,
      trim: true,
      maxlength: [500, 'La descripcion no puede superar los 500 caracteres.'],
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    items: {
      type: [mangaListItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

mangaListSchema.index({ owner: 1, title: 1 }, { unique: true });
mangaListSchema.index({ owner: 1, visibility: 1, updatedAt: -1 });
mangaListSchema.index({ visibility: 1, updatedAt: -1 });

module.exports = mongoose.model('MangaList', mangaListSchema);
