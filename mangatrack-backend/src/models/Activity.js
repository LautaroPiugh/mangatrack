const mongoose = require('mongoose');

const ACTIVITY_TYPES = [
  'review_created',
  'manga_favorited',
  'manga_added_to_watchlist',
  'manga_added_to_list',
  'list_created',
];

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio.'],
      index: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: [true, 'El tipo de actividad es obligatorio.'],
      index: true,
    },
    manga: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manga',
      default: null,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MangaList',
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

activitySchema.index({ visibility: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

module.exports = {
  Activity: mongoose.model('Activity', activitySchema),
  ACTIVITY_TYPES,
};
