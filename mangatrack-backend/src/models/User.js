const mongoose = require('mongoose');
const { USERNAME_REGEX, USER_ROLES, normalizeOptionalString } = require('../utils/user');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
      maxlength: [60, 'El nombre no puede superar los 60 caracteres.'],
    },
    username: {
      type: String,
      required: [true, 'El username es obligatorio.'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'El username debe tener al menos 3 caracteres.'],
      maxlength: [30, 'El username no puede superar los 30 caracteres.'],
      match: [USERNAME_REGEX, 'El username solo puede contener letras, numeros, puntos, guiones y guion bajo.'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato valido.'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria.'],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
      select: false,
      set: normalizeOptionalString,
      index: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
    },
    favorites: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Manga',
        },
      ],
      default: [],
    },
    watchlist: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Manga',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(document, returnedObject) {
        delete returnedObject.password;
        delete returnedObject.verificationToken;
        return returnedObject;
      },
    },
  },
);

module.exports = mongoose.model('User', userSchema);
