# MangaTrack Backend

API REST de MangaTrack desarrollada con Node.js, Express y MongoDB. Centraliza autenticación, usuarios, mangas, reviews, listas, actividad social, búsqueda global y envío de emails transaccionales.

## Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Nodemailer
- Brevo SMTP
- express-validator
- CORS
- Morgan

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

La API queda disponible en:

```text
http://localhost:5000/api
```

## Scripts

```bash
npm run dev
npm start
npm run check
npm run seed:admin
npm run seed:mangas
npm run migrate:follows
```

- `npm run dev`: inicia el servidor con Nodemon.
- `npm start`: inicia el servidor en modo normal.
- `npm run check`: valida sintaxis desde `src/server.js`.
- `npm run seed:admin`: crea o actualiza el usuario administrador.
- `npm run seed:mangas`: carga mangas iniciales.
- `npm run migrate:follows`: ejecuta migración de relaciones de seguimiento.

## Variables de entorno

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

ADMIN_NAME=
ADMIN_USERNAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=

EMAIL_MODE=brevo
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=2525
BREVO_SMTP_USER=tu_usuario_smtp_brevo
BREVO_SMTP_KEY=tu_smtp_key_brevo
EMAIL_FROM=MangaTrack <tu_remitente_verificado@tudominio.com>
```

## Emails con Brevo en Render

El envío de emails usa Nodemailer con SMTP de Brevo. En producción sobre Render se usa el puerto `2525`, ya que los puertos `25`, `465` y `587` pueden estar bloqueados.

Configuración esperada:

```env
EMAIL_MODE=brevo
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=2525
BREVO_SMTP_USER=tu_usuario_smtp_brevo
BREVO_SMTP_KEY=tu_smtp_key_brevo
EMAIL_FROM=MangaTrack <tu_remitente_verificado@tudominio.com>
FRONTEND_URL=https://mangatrack-rouge.vercel.app
```

Notas:

- `BREVO_SMTP_USER` es el usuario SMTP de Brevo.
- `BREVO_SMTP_KEY` es la SMTP key generada en Brevo.
- `EMAIL_FROM` debe estar verificado en Brevo.
- En Render, las variables se cargan desde el panel de Environment Variables.
- No se deben commitear credenciales reales.

Emails enviados:

- Verificación de cuenta: `/verify-email?token=...`
- Recuperación de contraseña: `/reset-password?token=...`
- Reenvío de verificación cuando el token anterior expiró o el usuario lo solicita.

Los templates están en:

```text
src/emails/templates/
├─ baseEmailLayout.js
├─ passwordResetEmail.js
└─ verificationEmail.js
```

El servicio de envío está en:

```text
src/services/email.service.js
```

## Arquitectura

```text
src/
├─ app.js
├─ server.js
├─ config/
├─ controllers/
├─ emails/
├─ middleware/
├─ models/
├─ repositories/
├─ routes/
├─ scripts/
├─ services/
└─ utils/
```

Responsabilidades:

- `routes/`: definición de endpoints y validaciones de entrada.
- `controllers/`: adaptación HTTP, códigos de respuesta y payloads.
- `services/`: reglas de negocio.
- `repositories/`: acceso a MongoDB.
- `models/`: esquemas de Mongoose.
- `middleware/`: auth, validación, 404 y manejo centralizado de errores.
- `emails/`: layouts y templates HTML/texto.
- `utils/`: helpers, JWT y errores personalizados.
- `scripts/`: tareas manuales de seed y migración.

## Endpoints

Todos los endpoints cuelgan de `/api`.

Health:

- `GET /health`
- `GET /health/smtp`

Auth:

- `POST /auth/register`
- `GET /auth/verify-email?token=...`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/login`
- `GET /auth/me`

Mangas:

- `GET /mangas`
- `GET /mangas/:idOrSlug`
- `GET /mangas/:id/reviews`
- `POST /mangas` admin
- `PUT /mangas/:id` admin
- `DELETE /mangas/:id` admin

Importación externa de mangas:

- `GET /mangas/admin/external/search` admin
- `GET /mangas/admin/external/top` admin
- `GET /mangas/admin/external/genres` admin
- `GET /mangas/admin/external/:malId` admin
- `POST /mangas/admin/external/import` admin

Reviews:

- `GET /reviews`
- `GET /reviews/recent`
- `GET /reviews/me`
- `GET /reviews/:id`
- `POST /reviews`
- `PUT /reviews/:id`
- `DELETE /reviews/:id`

Usuarios:

- `GET /users/:id`
- `GET /users/:id/followers`
- `GET /users/:id/following`
- `GET /users/:username/public`
- `GET /users/:username/lists`
- `GET /users/:username/lists/:listId`
- `GET /users/:username/activity`
- `GET /users/me/profile`
- `PATCH /users/me/profile`
- `GET /users/me/library`
- `PUT /users/me/preferences`
- `GET /users/me/favorites`
- `POST /users/me/favorites/:mangaId`
- `DELETE /users/me/favorites/:mangaId`
- `GET /users/me/watchlist`
- `POST /users/me/watchlist/:mangaId`
- `DELETE /users/me/watchlist/:mangaId`
- `POST /users/:id/follow`
- `DELETE /users/:id/unfollow`

Listas:

- `GET /lists/me`
- `POST /lists`
- `GET /lists/:id`
- `PATCH /lists/:id`
- `DELETE /lists/:id`
- `POST /lists/:id/items`
- `DELETE /lists/:id/items/:mangaId`
- `PATCH /lists/:id/items/reorder`

Actividad:

- `GET /activity/feed`
- `GET /activity/me`

Búsqueda:

- `GET /search?q=...`

## Reglas de negocio

- Las contraseñas se guardan hasheadas con bcrypt.
- El login devuelve JWT Bearer.
- El registro genera token de verificación por email.
- Los tokens de verificación se guardan hasheados.
- La recuperación de contraseña usa token temporal.
- Un usuario no verificado no puede operar en rutas que requieren cuenta activa.
- Las rutas de administración requieren rol `admin`.
- Un usuario puede tener una review por manga.
- El rating acepta valores entre `0.5` y `5`, en pasos de `0.5`.
- Las listas pueden ser públicas o privadas.
- El feed muestra actividad de usuarios seguidos.

## Flujo de prueba

1. Registrar usuario con `POST /api/auth/register`.
2. Verificar cuenta desde el enlace recibido por email.
3. Iniciar sesión con `POST /api/auth/login`.
4. Usar el token como `Authorization: Bearer <token>`.
5. Crear una review, agregar favoritos o crear listas.
6. Probar seguimiento entre usuarios y consultar `/api/activity/feed`.

## Postman

La colección está en:

```text
../postman/MangaTrack.postman_collection.json
```

## Deploy

El backend está preparado para Render.

Checklist de producción:

- Definir `NODE_ENV=production`.
- Configurar `MONGODB_URI` con la base remota.
- Configurar `JWT_SECRET` con un valor largo y privado.
- Configurar `FRONTEND_URL` con la URL pública del frontend.
- Configurar Brevo SMTP con puerto `2525`.
- Verificar que el remitente de `EMAIL_FROM` exista en Brevo.
