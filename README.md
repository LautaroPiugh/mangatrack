# MangaTrack

MangaTrack es una aplicacion full stack para gestionar mangas y publicar reviews. El proyecto esta dividido en un frontend con React + Vite y un backend con Node.js + Express + MongoDB, con autenticacion JWT, verificacion de cuenta por email y rutas protegidas.

## Caracteristicas principales

- Registro, login y verificacion de cuenta por email
- Autenticacion con JWT Bearer
- CRUD de mangas
- CRUD de reviews
- Restricciones por usuario autenticado y verificado
- Una review por usuario para cada manga
- Listados con filtros y paginacion
- UI responsive con React Router y Axios

## Stack

### Frontend

- React
- Vite
- React Router
- Axios

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcrypt
- Nodemailer
- express-validator

## Estructura del proyecto

```text
mangatrack/
├─ mangatrack-backend/
│  ├─ src/
│  ├─ .env.example
│  ├─ package.json
│  └─ README.md
├─ mangatrack-frontend/
│  ├─ src/
│  ├─ public/
│  ├─ .env.example
│  ├─ package.json
│  └─ README.md
└─ postman/
   └─ MangaTrack.postman_collection.json
```

## Requisitos

- Node.js
- npm
- MongoDB local o remoto

## Instalacion

### 1. Backend

```bash
cd mangatrack-backend
npm install
cp .env.example .env
```

Variables principales del backend:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/mangatrack
JWT_SECRET=change_this_for_a_long_random_secret
EMAIL_MODE=json
EMAIL_FROM=MangaTrack <no-reply@mangatrack.local>
```

`EMAIL_MODE=json` es util en desarrollo porque no envia correos reales y muestra el contenido en consola.

Para SMTP real:

```env
EMAIL_MODE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=MangaTrack <tu_email@gmail.com>
FRONTEND_URL=http://localhost:5173
```

Si usas Gmail, debes generar un App Password. No uses tu contrasena normal y no commitees credenciales.

Iniciar backend:

```bash
npm run dev
```

### 2. Frontend

```bash
cd mangatrack-frontend
npm install
cp .env.example .env
```

Variable principal del frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

Iniciar frontend:

```bash
npm run dev
```

## Scripts utiles

### Backend

- `npm run dev`
- `npm start`
- `npm run check`

### Frontend

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Endpoints principales

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `GET /api/auth/verify-email?token=...`
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

## Reglas de negocio

- Solo usuarios autenticados y verificados pueden crear mangas y reviews.
- Solo el autor puede editar o eliminar su review.
- Un usuario no puede crear mas de una review por manga.
- El rating promedio por manga se calcula desde las reviews asociadas.

## Postman

La coleccion base esta en:

```text
postman/MangaTrack.postman_collection.json
```

## Documentacion adicional

- `mangatrack-backend/README.md`
- `mangatrack-frontend/README.md`
