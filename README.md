# MangaTrack

MangaTrack es una aplicación web full-stack para gestionar mangas, reseñas, favoritos, watchlist y listas personales. Fue desarrollada como trabajo integrador final usando React + Vite en frontend, Node.js + Express en backend y MongoDB como base de datos.

## URLs públicas

- Frontend: PENDIENTE
- Backend API: PENDIENTE

## Repositorios

- Backend: PENDIENTE
- Frontend: PENDIENTE

## Credenciales de prueba

### Usuario común verificado

- Email: user@mangatrack.com
- Password: User123456

### Usuario administrador

- Email: admin@mangatrack.com
- Password: Admin123456

## Funcionalidades principales

- Registro de usuarios.
- Verificación de cuenta por correo electrónico.
- Reenvío de correo de verificación.
- Login con JWT.
- Recuperación de contraseña por email.
- CRUD de mangas.
- Panel admin para crear, editar, eliminar e importar mangas.
- Integración con Jikan API para buscar e importar mangas.
- Reviews con rating.
- Favoritos.
- Watchlist.
- Listas personales.
- Feed de actividad.
- Perfil de usuario.
- Tema claro/oscuro.
- Idioma español/inglés.
- Rutas protegidas por JWT.
- Roles de usuario y administrador.
- UI responsive.

## Stack técnico

### Frontend

- React
- Vite
- React Router
- Axios
- CSS responsive

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Nodemailer
- express-validator
- dotenv
- CORS
- Morgan

## Arquitectura backend

El backend respeta una arquitectura por capas:

```text
src/
├─ config/
├─ models/
├─ repositories/
├─ services/
├─ controllers/
├─ routes/
├─ middleware/
├─ utils/
└─ scripts/