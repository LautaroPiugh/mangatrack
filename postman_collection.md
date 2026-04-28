# MangaTrack API - Guía para Postman

Esta guía documenta los endpoints principales de la API de MangaTrack usando variables de entorno compatibles con Postman.

## Variables sugeridas

- `{{base_url}}`
  - Ejemplo local: `http://localhost:5000`
  - Ejemplo producción: `https://tu-backend.vercel.app`
- `{{token}}`
  - JWT obtenido luego de autenticarse

## Convenciones

- Todas las URLs usan el prefijo `/api`
- Los endpoints protegidos requieren:

```http
Authorization: Bearer {{token}}
```

- Ejemplo de header JSON:

```http
Content-Type: application/json
```

---

## Auth

### Registrar usuario

- Método: `POST`
- URL: `{{base_url}}/api/auth/register`
- Protegido: `No`
- Descripción: crea una cuenta nueva y dispara el flujo de verificación por email.

#### Headers

```http
Content-Type: application/json
```

#### Body

```json
{
  "name": "Lautaro Perez",
  "username": "lautaro.perez",
  "email": "lautaro@example.com",
  "password": "Manga123!"
}
```

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Registro exitoso. Revisá tu email para verificar la cuenta.",
  "data": {
    "user": {
      "id": "6811a3f6d82e5b3a4b2d0011",
      "name": "Lautaro Perez",
      "username": "lautaro.perez",
      "displayName": null,
      "avatar": "avatar_student",
      "bio": null,
      "email": "lautaro@example.com",
      "role": "user",
      "isVerified": false,
      "verifiedAt": null,
      "preferences": {
        "theme": "dark",
        "language": "es"
      },
      "createdAt": "2026-04-28T18:10:00.000Z"
    }
  }
}
```

---

### Iniciar sesión

- Método: `POST`
- URL: `{{base_url}}/api/auth/login`
- Protegido: `No`
- Descripción: autentica al usuario y devuelve JWT más datos del usuario.

#### Headers

```http
Content-Type: application/json
```

#### Body

```json
{
  "username": "lautaro.perez",
  "password": "Manga123!"
}
```

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Inicio de sesion exitoso.",
  "data": {
    "token": "{{token}}",
    "user": {
      "id": "6811a3f6d82e5b3a4b2d0011",
      "name": "Lautaro Perez",
      "username": "lautaro.perez",
      "displayName": "Lautaro",
      "avatar": "avatar_student",
      "bio": "Leo seinen y shonen.",
      "email": "lautaro@example.com",
      "role": "user",
      "isVerified": true,
      "verifiedAt": "2026-04-28T18:30:00.000Z",
      "preferences": {
        "theme": "dark",
        "language": "es"
      },
      "createdAt": "2026-04-28T18:10:00.000Z"
    }
  }
}
```

---

### Verificar email

- Método: `GET`
- URL: `{{base_url}}/api/auth/verify-email?token=abc123token`
- Protegido: `No`
- Descripción: valida el token de verificación recibido por email y activa la cuenta.

#### Headers

No requiere headers especiales.

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "La cuenta fue verificada correctamente.",
  "data": {
    "user": {
      "id": "6811a3f6d82e5b3a4b2d0011",
      "name": "Lautaro Perez",
      "username": "lautaro.perez",
      "displayName": null,
      "avatar": "avatar_student",
      "bio": null,
      "email": "lautaro@example.com",
      "role": "user",
      "isVerified": true,
      "verifiedAt": "2026-04-28T18:30:00.000Z",
      "preferences": {
        "theme": "dark",
        "language": "es"
      },
      "createdAt": "2026-04-28T18:10:00.000Z"
    }
  }
}
```

---

## Users

### Obtener perfil público por ID

- Método: `GET`
- URL: `{{base_url}}/api/users/6811a3f6d82e5b3a4b2d0011`
- Protegido: `Opcional`
- Descripción: devuelve el perfil público de un usuario. Si se envía token, incluye `isFollowing` calculado respecto del usuario autenticado.

#### Headers

Opcional:

```http
Authorization: Bearer {{token}}
```

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Perfil público obtenido correctamente.",
  "data": {
    "id": "6811a3f6d82e5b3a4b2d0011",
    "name": "Lautaro Perez",
    "username": "lautaro.perez",
    "displayName": "Lautaro",
    "avatar": "avatar_student",
    "bio": "Leo seinen y shonen.",
    "createdAt": "2026-04-28T18:10:00.000Z",
    "stats": {
      "reviewsCount": 12,
      "favoritesCount": 8,
      "watchlistCount": 6,
      "averageRatingGiven": 4.3,
      "topGenres": [
        {
          "genre": "Seinen",
          "count": 5
        },
        {
          "genre": "Action",
          "count": 4
        }
      ]
    },
    "followersCount": 14,
    "followingCount": 9,
    "isFollowing": true,
    "isCurrentUser": false,
    "favorites": [
      {
        "_id": "6811b4f6d82e5b3a4b2d0100",
        "title": "Berserk",
        "slug": "berserk",
        "author": "Kentaro Miura",
        "artist": "Kentaro Miura",
        "genres": ["Action", "Seinen"],
        "coverUrl": "https://cdn.mangatrack.app/covers/berserk.jpg",
        "status": "completed",
        "averageRating": 4.9,
        "ratingsCount": 214
      }
    ],
    "recentReviews": [],
    "lists": [],
    "activity": []
  }
}
```

---

## Follow

### Seguir usuario

- Método: `POST`
- URL: `{{base_url}}/api/users/6811a3f6d82e5b3a4b2d0011/follow`
- Protegido: `Sí`
- Descripción: crea una relación de seguimiento entre el usuario autenticado y el usuario indicado.

#### Headers

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Ahora sigues a este usuario.",
  "data": {
    "user": {
      "id": "6811a3f6d82e5b3a4b2d0011",
      "name": "Lautaro Perez",
      "username": "lautaro.perez",
      "displayName": "Lautaro",
      "avatar": "avatar_student",
      "bio": "Leo seinen y shonen.",
      "createdAt": "2026-04-28T18:10:00.000Z"
    },
    "followersCount": 15,
    "followingCount": 9,
    "isFollowing": true
  }
}
```

---

### Dejar de seguir usuario

- Método: `DELETE`
- URL: `{{base_url}}/api/users/6811a3f6d82e5b3a4b2d0011/unfollow`
- Protegido: `Sí`
- Descripción: elimina la relación de seguimiento contra el usuario indicado.

#### Headers

```http
Authorization: Bearer {{token}}
```

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Dejaste de seguir a este usuario.",
  "data": {
    "user": {
      "id": "6811a3f6d82e5b3a4b2d0011",
      "name": "Lautaro Perez",
      "username": "lautaro.perez",
      "displayName": "Lautaro",
      "avatar": "avatar_student",
      "bio": "Leo seinen y shonen.",
      "createdAt": "2026-04-28T18:10:00.000Z"
    },
    "followersCount": 14,
    "followingCount": 9,
    "isFollowing": false
  }
}
```

---

### Listar seguidores de un usuario

- Método: `GET`
- URL: `{{base_url}}/api/users/6811a3f6d82e5b3a4b2d0011/followers`
- Protegido: `No`
- Descripción: devuelve la lista de usuarios que siguen al usuario indicado.

#### Headers

No requiere headers especiales.

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Seguidores obtenidos correctamente.",
  "data": [
    {
      "id": "6811a3f6d82e5b3a4b2d0099",
      "name": "Ana Torres",
      "username": "ana.torres",
      "displayName": "Ana",
      "avatar": "avatar_cat",
      "bio": "Slice of life y josei.",
      "createdAt": "2026-04-21T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "user": {
      "id": "6811a3f6d82e5b3a4b2d0011",
      "name": "Lautaro Perez",
      "username": "lautaro.perez",
      "displayName": "Lautaro",
      "avatar": "avatar_student",
      "bio": "Leo seinen y shonen.",
      "createdAt": "2026-04-28T18:10:00.000Z"
    }
  }
}
```

---

### Listar usuarios seguidos por un usuario

- Método: `GET`
- URL: `{{base_url}}/api/users/6811a3f6d82e5b3a4b2d0011/following`
- Protegido: `No`
- Descripción: devuelve la lista de usuarios seguidos por el usuario indicado.

#### Headers

No requiere headers especiales.

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Seguidos obtenidos correctamente.",
  "data": [
    {
      "id": "6811a3f6d82e5b3a4b2d0200",
      "name": "Mica Roldán",
      "username": "mica.roldan",
      "displayName": "Mica",
      "avatar": "avatar_oni",
      "bio": "Me gustan los thrillers psicológicos.",
      "createdAt": "2026-04-15T10:40:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "user": {
      "id": "6811a3f6d82e5b3a4b2d0011",
      "name": "Lautaro Perez",
      "username": "lautaro.perez",
      "displayName": "Lautaro",
      "avatar": "avatar_student",
      "bio": "Leo seinen y shonen.",
      "createdAt": "2026-04-28T18:10:00.000Z"
    }
  }
}
```

---

## Search

### Búsqueda global

- Método: `GET`
- URL: `{{base_url}}/api/search?q=bers`
- Protegido: `No`
- Descripción: busca usuarios por `username` y mangas por `title` en un único endpoint.

#### Headers

No requiere headers especiales.

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Resultados obtenidos correctamente.",
  "data": {
    "users": [
      {
        "id": "6811a3f6d82e5b3a4b2d0201",
        "username": "berserkfan",
        "avatar": "avatar_robot"
      }
    ],
    "mangas": [
      {
        "id": "6811b4f6d82e5b3a4b2d0100",
        "title": "Berserk",
        "slug": "berserk",
        "cover": "https://cdn.mangatrack.app/covers/berserk.jpg",
        "coverUrl": "https://cdn.mangatrack.app/covers/berserk.jpg"
      }
    ]
  }
}
```

---

## Mangas

### Listar mangas

- Método: `GET`
- URL: `{{base_url}}/api/mangas?q=one&status=ongoing&page=1&limit=12`
- Protegido: `No`
- Descripción: obtiene el catálogo paginado de mangas, con filtros por búsqueda, estado y género.

#### Headers

No requiere headers especiales.

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Mangas obtenidos correctamente.",
  "data": [
    {
      "_id": "6811b4f6d82e5b3a4b2d0111",
      "title": "One Piece",
      "slug": "one-piece",
      "author": "Eiichiro Oda",
      "artist": "Eiichiro Oda",
      "genres": ["Action", "Adventure", "Shonen"],
      "coverUrl": "https://cdn.mangatrack.app/covers/one-piece.jpg",
      "status": "ongoing",
      "averageRating": 4.8,
      "ratingsCount": 302
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  }
}
```

---

### Obtener detalle de manga

- Método: `GET`
- URL: `{{base_url}}/api/mangas/berserk`
- Protegido: `Opcional`
- Descripción: obtiene un manga por `id` o por `slug`. La ruta real del proyecto es `:idOrSlug`.

#### Headers

Opcional:

```http
Authorization: Bearer {{token}}
```

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Manga obtenido correctamente.",
  "data": {
    "_id": "6811b4f6d82e5b3a4b2d0100",
    "title": "Berserk",
    "slug": "berserk",
    "synopsis": "La historia de Guts, un espadachín marcado por la tragedia.",
    "author": "Kentaro Miura",
    "artist": "Kentaro Miura",
    "genres": ["Action", "Adventure", "Seinen"],
    "coverUrl": "https://cdn.mangatrack.app/covers/berserk.jpg",
    "status": "completed",
    "chapters": 364,
    "publishedFrom": "1989-08-25T00:00:00.000Z",
    "publishedTo": "2021-05-21T00:00:00.000Z",
    "averageRating": 4.9,
    "ratingsCount": 214,
    "createdAt": "2026-04-10T09:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z"
  }
}
```

---

### Listar reviews de un manga

- Método: `GET`
- URL: `{{base_url}}/api/mangas/6811b4f6d82e5b3a4b2d0100/reviews?page=1&limit=10&sort=recent`
- Protegido: `No`
- Descripción: obtiene las reseñas públicas asociadas a un manga.

#### Headers

No requiere headers especiales.

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Reviews del manga obtenidas correctamente.",
  "data": {
    "manga": {
      "_id": "6811b4f6d82e5b3a4b2d0100",
      "title": "Berserk",
      "slug": "berserk",
      "coverUrl": "https://cdn.mangatrack.app/covers/berserk.jpg"
    },
    "reviewSummary": {
      "averageRating": 4.9,
      "reviewsCount": 214
    },
    "reviews": [
      {
        "_id": "6811c7f6d82e5b3a4b2d0300",
        "rating": 5,
        "content": "Una obra enorme en escala, dibujo y construcción de mundo.",
        "isPublic": true,
        "createdAt": "2026-04-28T20:10:00.000Z",
        "updatedAt": "2026-04-28T20:10:00.000Z",
        "user": {
          "_id": "6811a3f6d82e5b3a4b2d0200",
          "username": "mica.roldan",
          "displayName": "Mica",
          "avatar": "avatar_oni"
        }
      }
    ]
  },
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## Reviews

### Crear review

- Método: `POST`
- URL: `{{base_url}}/api/reviews`
- Protegido: `Sí`
- Descripción: crea una review nueva o actualiza la review existente del usuario autenticado sobre el mismo manga.

#### Headers

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

#### Body

```json
{
  "mangaId": "6811b4f6d82e5b3a4b2d0100",
  "rating": 4.5,
  "content": "Narrativamente intensa, oscura y con arte impresionante.",
  "isPublic": true
}
```

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Review creada correctamente.",
  "data": {
    "_id": "6811c7f6d82e5b3a4b2d0301",
    "rating": 4.5,
    "content": "Narrativamente intensa, oscura y con arte impresionante.",
    "isPublic": true,
    "user": {
      "_id": "6811a3f6d82e5b3a4b2d0011",
      "username": "lautaro.perez",
      "displayName": "Lautaro",
      "avatar": "avatar_student"
    },
    "manga": {
      "_id": "6811b4f6d82e5b3a4b2d0100",
      "title": "Berserk",
      "slug": "berserk"
    },
    "createdAt": "2026-04-28T20:20:00.000Z",
    "updatedAt": "2026-04-28T20:20:00.000Z"
  }
}
```

---

## Feed

### Obtener feed de usuarios seguidos

- Método: `GET`
- URL: `{{base_url}}/api/activity/feed?page=1&limit=20`
- Protegido: `Sí`
- Descripción: devuelve la actividad pública reciente de los usuarios que sigue el usuario autenticado.

#### Headers

```http
Authorization: Bearer {{token}}
```

#### Body

No aplica.

#### Respuesta de ejemplo

```json
{
  "success": true,
  "message": "Actividad de usuarios seguidos obtenida correctamente.",
  "data": [
    {
      "_id": "6811d2f6d82e5b3a4b2d0400",
      "type": "review_created",
      "visibility": "public",
      "user": {
        "_id": "6811a3f6d82e5b3a4b2d0200",
        "name": "Mica Roldán",
        "username": "mica.roldan",
        "displayName": "Mica",
        "avatar": "avatar_oni",
        "bio": "Me gustan los thrillers psicológicos.",
        "createdAt": "2026-04-15T10:40:00.000Z"
      },
      "manga": {
        "_id": "6811b4f6d82e5b3a4b2d0100",
        "title": "Berserk",
        "slug": "berserk",
        "author": "Kentaro Miura",
        "artist": "Kentaro Miura",
        "genres": ["Action", "Seinen"],
        "coverUrl": "https://cdn.mangatrack.app/covers/berserk.jpg",
        "status": "completed",
        "averageRating": 4.9,
        "ratingsCount": 214
      },
      "review": {
        "_id": "6811c7f6d82e5b3a4b2d0300",
        "rating": 5,
        "content": "Una obra enorme en escala, dibujo y construcción de mundo.",
        "createdAt": "2026-04-28T20:10:00.000Z",
        "updatedAt": "2026-04-28T20:10:00.000Z",
        "isPublic": true
      },
      "list": null,
      "metadata": null,
      "createdAt": "2026-04-28T20:10:05.000Z",
      "updatedAt": "2026-04-28T20:10:05.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "followingCount": 9
  }
}
```

---

## Notas para Postman

- Crear un environment con:

```text
base_url = http://localhost:5000
token = <jwt>
```

- Flujo recomendado de prueba:
  1. `POST /api/auth/register`
  2. `GET /api/auth/verify-email?token=...`
  3. `POST /api/auth/login`
  4. Guardar el `data.token` en `{{token}}`
  5. Consumir endpoints protegidos

- Si querés automatizar el guardado del token en Postman, podés usar este script en la pestaña `Tests` del login:

```javascript
const json = pm.response.json();
pm.environment.set("token", json.data.token);
```
