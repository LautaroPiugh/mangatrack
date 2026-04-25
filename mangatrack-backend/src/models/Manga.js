const mongoose = require('mongoose');
const { normalizeOptionalString } = require('../utils/user');
const { MANGA_STATUSES, SLUG_REGEX } = require('../utils/manga');

const mangaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El titulo es obligatorio.'],
      trim: true,
      minlength: [2, 'El titulo debe tener al menos 2 caracteres.'],
      maxlength: [120, 'El titulo no puede superar los 120 caracteres.'],
    },
    normalizedTitle: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'El slug es obligatorio.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [SLUG_REGEX, 'El slug solo puede contener letras, numeros y guiones medios.'],
    },
    synopsis: {
      type: String,
      default: null,
      set: normalizeOptionalString,
      trim: true,
      maxlength: [4000, 'La sinopsis no puede superar los 4000 caracteres.'],
    },
    author: {
      type: String,
      default: null,
      set: normalizeOptionalString,
      trim: true,
      maxlength: [120, 'El autor no puede superar los 120 caracteres.'],
    },
    artist: {
      type: String,
      default: null,
      set: normalizeOptionalString,
      trim: true,
      maxlength: [120, 'El artista no puede superar los 120 caracteres.'],
    },
    genres: {
      type: [String],
      default: [],
    },
    coverUrl: {
      type: String,
      default: null,
      set: normalizeOptionalString,
      trim: true,
    },
    status: {
      type: String,
      enum: MANGA_STATUSES,
      default: 'ongoing',
    },
    chapters: {
      type: Number,
      default: 0,
      min: [0, 'La cantidad de capitulos no puede ser negativa.'],
    },
    publishedFrom: {
      type: Date,
      default: null,
    },
    publishedTo: {
      type: Date,
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'El rating promedio no puede ser menor a 0.'],
      max: [5, 'El rating promedio no puede ser mayor a 5.'],
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: [0, 'La cantidad de valoraciones no puede ser negativa.'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    external: {
      source: {
        type: String,
        default: null,
        lowercase: true,
        trim: true,
      },
      externalId: {
        type: Number,
        default: null,
        min: [1, 'El externalId debe ser mayor a 0.'],
      },
      url: {
        type: String,
        default: null,
        set: normalizeOptionalString,
        trim: true,
      },
      bannerImage: {
        type: String,
        default: null,
        set: normalizeOptionalString,
        trim: true,
      },
      titleEnglish: {
        type: String,
        default: null,
        set: normalizeOptionalString,
        trim: true,
        maxlength: [160, 'El titulo ingles no puede superar los 160 caracteres.'],
      },
      titleJapanese: {
        type: String,
        default: null,
        set: normalizeOptionalString,
        trim: true,
        maxlength: [160, 'El titulo japones no puede superar los 160 caracteres.'],
      },
      titleSynonyms: {
        type: [String],
        default: [],
      },
      authors: {
        type: [String],
        default: [],
      },
      type: {
        type: String,
        default: null,
        set: normalizeOptionalString,
        trim: true,
        maxlength: [60, 'El tipo externo no puede superar los 60 caracteres.'],
      },
      volumes: {
        type: Number,
        default: null,
        min: [0, 'La cantidad de volumenes no puede ser negativa.'],
      },
      score: {
        type: Number,
        default: null,
        min: [0, 'El score externo no puede ser menor a 0.'],
        max: [10, 'El score externo no puede ser mayor a 10.'],
      },
      rank: {
        type: Number,
        default: null,
        min: [1, 'El rank externo debe ser mayor a 0.'],
      },
      popularity: {
        type: Number,
        default: null,
        min: [1, 'La popularidad externa debe ser mayor a 0.'],
      },
    },
  },
  {
    autoIndex: false,
    timestamps: true,
    versionKey: false,
  },
);

mangaSchema.index({ slug: 1 }, { unique: true });
mangaSchema.index({ status: 1 });
mangaSchema.index({ genres: 1 });
mangaSchema.index({ title: 1 });
mangaSchema.index({ normalizedTitle: 1 });
mangaSchema.index({ author: 1 });
mangaSchema.index(
  { 'external.source': 1, 'external.externalId': 1 },
  {
    unique: true,
    partialFilterExpression: {
      'external.source': { $exists: true, $type: 'string' },
      'external.externalId': { $exists: true, $type: 'number' },
    },
  },
);
mangaSchema.index({ title: 'text', author: 'text', genres: 'text' });

module.exports = mongoose.model('Manga', mangaSchema);
