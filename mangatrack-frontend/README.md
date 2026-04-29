# MangaTrack Frontend

Cliente web de MangaTrack desarrollado con React y Vite. Consume la API REST del backend y cubre los flujos principales de autenticación, exploración de mangas, reviews, biblioteca personal, listas, perfiles públicos y panel de administración.

## Stack

- React
- Vite
- React Router
- Axios
- CSS propio con estilos globales

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

- `npm run dev`: inicia Vite en modo desarrollo.
- `npm run build`: genera la versión de producción.
- `npm run lint`: ejecuta ESLint.
- `npm run preview`: sirve localmente el build generado.

## Variables de entorno

```env
VITE_API_URL=http://localhost:5000/api
```

Para producción, la variable debe apuntar al backend desplegado:

```env
VITE_API_URL=https://mangatrack-backend.onrender.com/api
```

## Estructura

```text
src/
├─ app/
├─ api/
├─ assets/
├─ components/
│  ├─ activity/
│  ├─ admin/
│  ├─ auth/
│  ├─ common/
│  ├─ layout/
│  ├─ manga/
│  ├─ review/
│  └─ user/
├─ context/
├─ data/
├─ hooks/
├─ pages/
│  ├─ admin/
│  ├─ auth/
│  ├─ mangas/
│  ├─ reviews/
│  └─ user/
├─ routes/
├─ services/
├─ styles/
└─ utils/
```

## Rutas principales

Públicas:

- `/login`
- `/register`
- `/resend-verification`
- `/forgot-password`
- `/reset-password?token=...`
- `/verify-email?token=...`
- `/verify/:token`
- `/users/:username`
- `/users/:username/lists/:listId`
- `/lists/:id`

Protegidas:

- `/`
- `/feed`
- `/home`
- `/mangas`
- `/mangas/:slug`
- `/reviews`
- `/profile`
- `/library`
- `/lists`
- `/settings/profile`

Administrador:

- `/admin`
- `/admin/mangas`
- `/admin/mangas/new`
- `/admin/mangas/:id/edit`

## Integración con la API

- El cliente Axios base está en `src/api/axiosClient.js`.
- La URL base sale de `VITE_API_URL`.
- El token JWT se guarda en `localStorage`.
- Las requests protegidas envían `Authorization: Bearer <token>`.
- Al iniciar o recargar la app, la sesión se revalida contra `GET /auth/me`.

Servicios principales:

- `src/services/authService.js`
- `src/services/mangaService.js`
- `src/services/reviewService.js`
- `src/services/userService.js`
- `src/services/userLibraryService.js`
- `src/services/listService.js`
- `src/services/activityService.js`
- `src/services/searchService.js`
- `src/services/externalMangaService.js`

## Funcionalidades cubiertas

Autenticación:

- Registro.
- Login.
- Verificación de cuenta.
- Reenvío de verificación.
- Recuperación y restablecimiento de contraseña.
- Redirección de usuarios autenticados fuera de rutas públicas.

Mangas y reviews:

- Listado y detalle de mangas.
- Búsqueda y filtros.
- Reviews con rating visual.
- Creación, edición y eliminación de reviews propias desde las vistas correspondientes.

Biblioteca y listas:

- Favoritos.
- Watchlist.
- Listas personales.
- Detalle de listas propias o públicas.

Social:

- Perfil público.
- Seguimiento entre usuarios.
- Feed de actividad.
- Actividad reciente.

Administración:

- Listado de mangas administrable.
- Alta y edición de mangas.
- Búsqueda e importación desde fuente externa.

Preferencias:

- Tema claro y oscuro.
- Idioma español e inglés.
- Edición de perfil, bio y avatar.

## Deploy

El frontend está preparado para Vercel. El archivo `vercel.json` mantiene fallback hacia `index.html`, necesario para que React Router funcione al recargar rutas internas.

Antes de desplegar, configurar:

```env
VITE_API_URL=https://mangatrack-backend.onrender.com/api
```

## Validación

Comandos usados para revisar el frontend:

```bash
npm run lint
npm run build
```
