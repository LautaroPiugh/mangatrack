# MangaTrack

MangaTrack es una aplicación web full-stack para descubrir, organizar y reseñar mangas. Incluye autenticación, perfiles públicos, listas personales, favoritos, watchlist, reviews, seguimiento entre usuarios y un feed de actividad basado en las personas seguidas.

El proyecto está dividido en dos aplicaciones:

- `mangatrack-frontend`: cliente web desarrollado con React y Vite.
- `mangatrack-backend`: API REST desarrollada con Node.js, Express y MongoDB.

## URLs públicas

- Frontend: https://mangatrack-rouge.vercel.app/
- Backend API: https://mangatrack-backend.onrender.com

## Credenciales de prueba

Usuario común verificado:

```text
Usuario: lautapiugh
Password: Admin123!
```

Usuario administrador:

```text
Usuario: admin
Password: Admin123!
```

## Funcionalidades

Autenticación y cuenta:

- Registro de usuarios.
- Login con JWT.
- Verificación de cuenta por email.
- Reenvío de verificación cuando el enlace expira.
- Recuperación de contraseña por email.
- Rutas públicas, protegidas y exclusivas para administradores.

Mangas:

- Listado con búsqueda, filtros y paginación.
- Detalle público de cada manga.
- Alta, edición y eliminación desde panel administrador.
- Importación de datos externos desde Jikan/MyAnimeList.

Reviews e interacciones:

- Reviews públicas con puntuación de 0.5 a 5.
- Edición y eliminación de reviews propias.
- Favoritos.
- Watchlist.
- Promedio de rating calculado a partir de reviews.

Listas y biblioteca:

- Listas personales públicas o privadas.
- Agregado y eliminación de mangas en listas.
- Reordenamiento de items.
- Biblioteca personal con favoritos, watchlist y reviews.

Social:

- Perfil público por usuario.
- Seguidores y seguidos.
- Actividad pública del usuario.
- Feed personalizado con actividad de usuarios seguidos.

Experiencia de uso:

- Tema claro y oscuro.
- Idioma español e inglés.
- Diseño responsive para desktop y mobile.
- Toasts, loaders, estados vacíos y mensajes de error.

## Stack

Frontend:

- React
- Vite
- React Router
- Axios
- CSS propio

Backend:

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Nodemailer
- Brevo SMTP

Servicios externos:

- MongoDB Atlas o instancia MongoDB compatible.
- Brevo para envío de emails SMTP.
- Jikan API para búsqueda e importación de mangas externos.
- Vercel para el frontend.
- Render para el backend.

## Estructura del repositorio

```text
mangatrack/
├─ mangatrack-frontend/
├─ mangatrack-backend/
├─ postman/
├─ postman_collection.md
└─ README.md
```

## Puesta en marcha local

Backend:

```bash
cd mangatrack-backend
npm install
cp .env.example .env
npm run dev
```

Frontend:

```bash
cd mangatrack-frontend
npm install
cp .env.example .env
npm run dev
```

Por defecto:

- Frontend local: `http://localhost:5173`
- Backend local: `http://localhost:5000`
- API base local: `http://localhost:5000/api`

## Variables principales

Frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

Backend:

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
EMAIL_MODE=brevo
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=2525
BREVO_SMTP_USER=tu_usuario_smtp_brevo
BREVO_SMTP_KEY=tu_smtp_key_brevo
EMAIL_FROM=MangaTrack <tu_remitente_verificado@tudominio.com>
```

En producción, estas variables se cargan desde el panel del proveedor correspondiente. El archivo `.env` queda solo para desarrollo local.

## Emails en producción

El backend usa Nodemailer con Brevo SMTP. Para Render se utiliza el puerto `2525`, porque los puertos SMTP tradicionales `25`, `465` y `587` pueden estar bloqueados.

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

Los enlaces enviados por email apuntan al frontend:

- Verificación: `/verify-email?token=...`
- Recuperación de contraseña: `/reset-password?token=...`

## Scripts útiles

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Backend:

```bash
npm run dev
npm start
npm run check
npm run seed:admin
npm run seed:mangas
```

## Documentación específica

- Frontend: [`mangatrack-frontend/README.md`](./mangatrack-frontend/README.md)
- Backend: [`mangatrack-backend/README.md`](./mangatrack-backend/README.md)
- Colección Postman: [`postman/MangaTrack.postman_collection.json`](./postman/MangaTrack.postman_collection.json)

## Flujo recomendado de prueba

1. Entrar al frontend desplegado o levantar el proyecto local.
2. Registrarse con una cuenta nueva.
3. Verificar la cuenta desde el email recibido.
4. Iniciar sesión.
5. Explorar mangas, agregar favoritos o watchlist y crear una review.
6. Entrar con el usuario administrador para crear, editar o importar mangas.
7. Seguir otro usuario y revisar el feed personalizado.

## Notas de seguridad

- No se deben commitear credenciales reales.
- `JWT_SECRET` debe ser largo y distinto entre ambientes.
- `EMAIL_FROM` debe estar verificado en Brevo.
- Las rutas de administración requieren usuario autenticado con rol `admin`.
