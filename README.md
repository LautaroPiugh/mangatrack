# 📚 MangaTrack

MangaTrack es una aplicación web full-stack orientada a la gestión y descubrimiento de mangas, con funcionalidades sociales como seguimiento de usuarios y feed personalizado.

Fue desarrollada como trabajo integrador utilizando React + Vite en el frontend, Node.js + Express en el backend y MongoDB como base de datos.

---

## 🌐 URLs públicas

- Frontend: https://mangatrack-rouge.vercel.app/
- Backend API: https://mangatrack-backend.onrender.com

---

## 🧪 Credenciales de prueba

### Usuario común verificado
- Usuario: lautapiugh  
- Password: Admin123!  

### Usuario administrador
- Usuario: admin
- Password: Admin123!  

---

## 🚀 Funcionalidades principales

### 🔐 Autenticación y usuarios
- Registro de usuarios
- Verificación de cuenta por email
- Reenvío de verificación
- Login con JWT
- Recuperación de contraseña por email
- Roles (usuario / administrador)
- Rutas protegidas

---

### 📖 Mangas
- CRUD completo de mangas (admin)
- Importación desde Jikan API
- Listado y detalle de mangas

---

### ⭐ Interacciones
- Reviews con puntuación
- Favoritos
- Watchlist
- Listas personales

---

### 👥 Funcionalidad social
- Seguir / dejar de seguir usuarios
- Perfil público de usuario
- Contadores de seguidores y seguidos

---

### 📰 Feed personalizado
- Actividad de usuarios seguidos:
  - Reviews creadas
  - Mangas agregados a favoritos
  - Mangas agregados a watchlist
- Feed filtrado exclusivamente por usuarios seguidos

---

### 🔎 Búsqueda global
- Buscador unificado
- Búsqueda de usuarios y mangas
- Resultados agrupados

---

### 🎨 UI / UX
- Interfaz responsive (320px – 2000px)
- Tema claro / oscuro
- Idioma español / inglés

---

## 🧠 Stack técnico

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- Nodemailer

---

## 🧱 Arquitectura backend

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