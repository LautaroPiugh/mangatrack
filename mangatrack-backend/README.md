# MangaTrack Backend

API REST para el proyecto final `MangaTrack`, desarrollada con Node.js, Express y MongoDB.

## Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT Bearer
- bcrypt
- Nodemailer
- express-validator
- CORS
- Morgan

## Arquitectura

```text
src/
├─ app.js
├─ server.js
├─ config/
├─ models/
├─ repositories/
├─ services/
├─ controllers/
├─ routes/
├─ middleware/
└─ utils/
```

Responsabilidades:

- `routes/`: definición de endpoints y middlewares.
- `controllers/`: manejo de `req` / `res`.
- `services/`: reglas de negocio.
- `repositories/`: acceso a MongoDB.
- `middleware/`: auth, validación, 404 y manejo centralizado de errores.
- `utils/`: JWT, email y errores personalizados.

## Instalación

```bash
npm install
cp .env.example .env
```

Completa las variables del archivo `.env` y luego ejecuta:

```bash
npm run dev
```

Scripts disponibles:

- `npm run dev`: levanta el backend con `nodemon`
- `npm start`: arranque normal
- `npm run check`: validación rápida de sintaxis

## Variables de Entorno

Tomar como base `.env.example`.

```env
APP_NAME=MangaTrack
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/mangatrack
JWT_SECRET=change_this_for_a_long_random_secret
JWT_EXPIRES_IN=1d
JWT_ISSUER=MangaTrack API
JWT_AUDIENCE=MangaTrack Client
EMAIL_MODE=json
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=MangaTrack <no-reply@mangatrack.local>
```

Notas:

- `EMAIL_MODE=json` no envía realmente correos; los imprime en consola y sirve para desarrollo.
- Si defines `FRONTEND_URL`, el link de verificación apunta a la pantalla `/verify/:token` del frontend.
- Si usas SMTP real, cambia `EMAIL_MODE=smtp` y completa las credenciales.

## Endpoints

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `GET /api/auth/verify/:token`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Mangas

- `GET /api/mangas`
- `GET /api/mangas/:id`
- `POST /api/mangas`
- `PUT /api/mangas/:id`
- `DELETE /api/mangas/:id`
- `GET /api/mangas/:id/reviews`

### Reviews

- `GET /api/reviews`
- `GET /api/reviews/:id`
- `GET /api/reviews/me`
- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`

## Reglas de Negocio Implementadas

- Registro con hash de contraseña usando `bcrypt`.
- Login con JWT Bearer y expiración.
- Verificación de cuenta por email.
- Rutas protegidas con middleware JWT.
- Solo usuarios autenticados y verificados pueden crear mangas y reviews.
- Solo el dueño de una review puede editarla o eliminarla.
- Un usuario solo puede tener una review por manga.
- Promedio de rating por manga calculado desde reviews.
- Filtros y paginación en listados.

## Flujo Recomendado de Prueba

1. Registrar usuario desde `POST /api/auth/register`
2. Verificar cuenta con el link recibido por email o usando el token
3. Iniciar sesión con `POST /api/auth/login`
4. Usar el token Bearer para crear mangas y reviews

## Postman

La colección base está en:

```text
../postman/MangaTrack.postman_collection.json
```
