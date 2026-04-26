# MangaTrack Frontend

Interfaz web de `MangaTrack`, construida con React + Vite e integrada contra la API del backend.

## Stack

- React
- Vite
- React Router
- Axios
- CSS modular simple con estilos globales propios

## Qué Incluye

- Home con métricas y actividad reciente
- Registro, login y pantalla de verificación
- Persistencia básica de sesión con `localStorage`
- Rutas protegidas
- Listado y detalle de mangas
- Alta y edición de mangas
- Listado global de reviews
- Alta, edición y borrado de reviews
- Vista de `Mis reviews`
- Feedback visual con alerts, loaders, empty states y toasts

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Scripts disponibles:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

## Variables de Entorno

```env
VITE_API_URL=http://localhost:5000/api
```

## Estructura

```text
src/
├─ app/
├─ api/
├─ components/
│  ├─ common/
│  ├─ layout/
│  ├─ manga/
│  └─ review/
├─ context/
├─ hooks/
├─ pages/
│  ├─ auth/
│  ├─ mangas/
│  └─ reviews/
├─ routes/
├─ styles/
└─ utils/
```

## Rutas Principales

- `/`
- `/register`
- `/login`
- `/verify-email?token=...`
- `/mangas`
- `/mangas/:id`
- `/mangas/new`
- `/mangas/:id/edit`
- `/reviews`
- `/reviews/new`
- `/reviews/:id/edit`
- `/my-reviews`

## Integración con Backend

- El cliente HTTP central está en `src/api/axiosClient.js`
- El token se guarda en `localStorage`
- Las requests protegidas envían `Authorization: Bearer <token>`
- Al recargar la app, se revalida la sesión con `GET /auth/me`
- La verificación de cuenta consume `GET /api/auth/verify-email?token=...`

## Estado Actual de la UI

La interfaz ya está orientada a una entrega académica defendible:

- estética sobria y oscura
- cards para mangas
- rating visual con estrellas
- badges de estado
- formularios consistentes
- mensajes de feedback
- layout responsive para desktop y mobile

## Build Verificado

El frontend fue validado con:

```bash
npm run lint
npm run build
```
