# API Chronology V3 – Guía Completa

Esta guía documenta cómo instalar, ejecutar y consumir la API de Chronology V3. Incluye detalles de configuración, rutas disponibles, formatos de request/response y ejemplos con `curl` y `HTTPie`.

---

## 1) Requisitos

- Node.js 18+
- npm 8+
- Cuenta y proyecto en Supabase con:
  - Base de datos con tablas `events`, `categories`, `clerk_users` y tabla intermedia `event_categories`
  - Bucket de Storage llamado `uploads` (público o con política que permita `getPublicUrl`)
- Cuenta en Clerk para autenticación de usuarios

---

## 2) Instalación

```bash
npm install
```

---

## 3) Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```ini
# Server
PORT=4000
NODE_ENV=development

# Supabase
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_KEY=tu_service_role_key
SUPABASE_ANON_KEY=tu_anon_key

# Clerk
CLERK_WEBHOOK_SECRET=tu_webhook_secret_de_clerk
```

### Explicación de variables:

#### Servidor
- `PORT`: Puerto HTTP del servidor (por defecto 4000).
- `NODE_ENV`: Entorno de ejecución (`development` o `production`).

#### Supabase
- `SUPABASE_URL`: URL de tu proyecto Supabase.
- `SUPABASE_SERVICE_KEY`: Service Role Key (necesaria para operaciones de escritura).
- `SUPABASE_ANON_KEY`: Clave anónima de Supabase.

#### Clerk
- `CLERK_WEBHOOK_SECRET`: Secreto para verificar webhooks de Clerk (obtener desde el dashboard de Clerk).

---

## 4) Configuración de Clerk Webhook

### Crear tabla en Supabase

Ejecuta el siguiente SQL en el editor de SQL de Supabase para crear la tabla `clerk_users`:

```sql
create extension if not exists "uuid-ossp";

create table public.clerk_users (
  id uuid primary key default uuid_generate_v4(),
  clerk_id text unique not null,                  -- ID del usuario en Clerk (user_xxx)
  email text,                                     -- correo principal
  first_name text,
  last_name text,
  image_url text,
  last_event text,                                -- último evento recibido (user.created, etc)
  updated_at timestamptz default now()            -- fecha del último sync
);
```

### Configurar Webhook en Clerk

1. Ve al [Dashboard de Clerk](https://dashboard.clerk.com/)
2. Selecciona tu aplicación
3. Ve a "Webhooks" en la barra lateral
4. Haz clic en "+ Add Endpoint"
5. Configura el webhook:
   - **Endpoint URL**: `https://tudominio.com/api/clerk/webhooks` (o tu URL de desarrollo con ngrok)
   - **Subscribed events**:
     - `user.created`
     - `user.updated`
     - `user.deleted`
     - `user.signed_in`
     - `user.signed_out`
6. Copia el "Webhook Signing Secret" y guárdalo en tu `.env` como `CLERK_WEBHOOK_SECRET`

## 5) Endpoints de Webhook

### `POST /api/clerk/webhooks`

Endpoint para recibir webhooks de Clerk y sincronizar usuarios con la base de datos.

#### Eventos soportados:
- `user.created`: Crea un nuevo usuario en la tabla `clerk_users`
- `user.updated`: Actualiza la información del usuario existente
- `user.deleted`: Elimina al usuario de la base de datos
- `user.signed_in`: Actualiza el último evento del usuario
- `user.signed_out`: Actualiza el último evento del usuario

#### Ejemplo de respuesta exitosa:
```json
{
  "success": true
}
```

#### Ejemplo de error:
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## 6) Ejecución

- Desarrollo (con recarga en caliente):

```bash
npm run dev
```

- Producción:

```bash
npm run build && npm start
```

Por defecto el servidor levanta en `http://localhost:4000`.

---

## 5) Estructura y middlewares claves

- Rutas base:
  - `GET/POST/PUT/DELETE /api/events`
  - `GET/POST/DELETE /api/categories`
- Middlewares globales: CORS, JSON parser, `requestLogger`, `errorHandler`.
- Subida de archivos: `multer` guarda temporales en `uploads/`, luego se suben a Supabase Storage y se elimina el temporal.

---

## 6) Modelo de datos (referencia)

Evento (`events`):

```json
{
  "id": "string",
  "title": "string",
  "date": "YYYY-MM-DD",
  "description": "string",
  "createdAt": "ISO-8601",
  "verified": false,
  "imageUrl": ["https://..."],
  "categories": ["categoryId", "..."]
}
```

Categoría (`categories`):

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "ISO-8601"
}
```

Relación (`event_categories`):

```json
{
  "event_id": "string",
  "category_id": "string"
}
```

---

## 7) Endpoints – Events

### 7.1) Listar eventos

- Método: `GET`
- URL: `http://localhost:4000/api/events`
- Respuesta: lista de eventos ordenados por `date` ASC, con categorías embebidas.

Ejemplo respuesta (200):

```json
[
  {
    "id": "uuid",
    "title": "Título",
    "date": "2025-01-01",
    "description": "...",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "verified": false,
    "imageUrl": ["https://.../uploads/foto1.jpg"],
    "event_categories": [
      {
        "category_id": {
          "id": "cat-1",
          "name": "Historia",
          "description": "...",
          "createdAt": "..."
        }
      }
    ],
    "categories": [{ "id": "cat-1", "name": "Historia", "description": "...", "createdAt": "..." }]
  }
]
```

`curl`:

```bash
curl -s http://localhost:4000/api/events | jq .
```

### 7.2) Crear evento

- Método: `POST`
- URL: `http://localhost:4000/api/events`
- Body: `multipart/form-data`
  - `title` (string, requerido)
  - `date` (string, requerido, formato `YYYY-MM-DD`)
  - `description` (string, opcional)
  - `categories` (string, opcional) → JSON stringificadas. Ej: `"[\"cat-1\",\"cat-2\"]"`
  - `files` (file[], opcional) → múltiples archivos (imágenes) a subir

Ejemplo `curl` (subida con 2 imágenes y 2 categorías):

```bash
curl -X POST http://localhost:4000/api/events \
  -F "title=Batalla de ejemplo" \
  -F "date=2025-01-01" \
  -F "description=Descripción del evento" \
  -F "categories=[\"cat-1\",\"cat-2\"]" \
  -F "files=@/ruta/local/imagen1.jpg" \
  -F "files=@/ruta/local/imagen2.png"
```

Respuesta (201):

```json
{ "message": "Evento creado con éxito", "id": "uuid" }
```

Errores comunes:

- 400 si faltan `title` o `date`.
- 500 si falla inserción en BD o subida a Storage.

### 7.3) Actualizar evento

- Método: `PUT`
- URL: `http://localhost:4000/api/events/:id`
- Body: `multipart/form-data` o `application/json`.
  - Cualquier campo de `events` puede enviarse parcialmente.
  - `event_categories` (array de IDs) para reemplazar categorías del evento.
  - `files` (file[]) para subir nuevas imágenes (reemplaza `imageUrl` con las nuevas URLs).

Ejemplo (reemplazar título y categorías):

```bash
curl -X PUT http://localhost:4000/api/events/UUID-EVENTO \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nuevo título",
    "event_categories": ["cat-2", "cat-3"]
  }'
```

Ejemplo con nuevas imágenes:

```bash
curl -X PUT http://localhost:4000/api/events/UUID-EVENTO \
  -F "files=@/ruta/local/nueva1.jpg" \
  -F "files=@/ruta/local/nueva2.png"
```

Respuesta (200):

```json
{ "message": "Evento actualizado correctamente" }
```

### 7.4) Eliminar evento

- Método: `DELETE`
- URL: `http://localhost:4000/api/events/:id`

Ejemplo:

```bash
curl -X DELETE http://localhost:4000/api/events/UUID-EVENTO
```

Respuesta (200):

```json
{ "message": "Evento eliminado con éxito" }
```

---

## 8) Endpoints – Categories

### 8.1) Listar categorías

- Método: `GET`
- URL: `http://localhost:4000/api/categories`

Respuesta (200):

```json
[{ "id": "cat-1", "name": "Historia", "description": "...", "createdAt": "..." }]
```

### 8.2) Crear categoría

- Método: `POST`
- URL: `http://localhost:4000/api/categories`
- Body: `application/json`
  - `name` (string, requerido)
  - `description` (string, requerido)

Ejemplo:

```bash
curl -X POST http://localhost:4000/api/categories \
  -H "Content-Type: application/json" \
  -d '{ "name": "Historia", "description": "Categoría histórica" }'
```

Respuesta (201):

```json
{ "id": "cat-1", "name": "Historia", "description": "Categoría histórica", "createdAt": "..." }
```

Errores comunes:

- 400 si faltan `name` o `description`.

### 8.3) Eliminar categoría

- Método: `DELETE`
- URL: `http://localhost:4000/api/categories/:id`

Ejemplo:

```bash
curl -X DELETE http://localhost:4000/api/categories/cat-1
```

Respuesta (200):

```json
{ "message": "Categoria eliminada con exito" }
```

---

## 9) Subida de archivos (imágenes)

- Campo de formulario: `files` (puede repetirse para múltiples adjuntos).
- Los archivos se almacenan temporalmente en `uploads/` (carpeta local) por `multer`.
- Luego se suben al bucket `uploads` de Supabase Storage, se obtiene una URL pública y se eliminan los temporales.
- Las URLs resultantes se guardan en `imageUrl` del evento.

Recomendaciones:

- Mantener nombres de archivo únicos para evitar colisiones (el backend hace `upsert: true`).
- Validar tamaños/tipos en frontend o extender en backend.

---

## 10) Manejo de errores

- 400: Validaciones de payload (faltan campos requeridos).
- 500: Errores de base de datos o almacenamiento.
- El middleware `errorHandler` unifica las respuestas de error no capturadas.

Ejemplo error (500):

```json
{ "error": "mensaje del error" }
```

---

## 11) Notas y buenas prácticas

- Fechas en formato `YYYY-MM-DD` para `date`.
- Cuando uses `multipart/form-data` y envíes arrays (p. ej. `categories`), envíalos como JSON en string.
- Para actualizar categorías de un evento utiliza el campo `event_categories` en `PUT /api/events/:id`.
- Si subes nuevas imágenes en `PUT`, el campo `imageUrl` del evento se reemplaza por las nuevas URLs.

---

## 12) Rutas resumidas

Eventos:

- `GET    /api/events`
- `POST   /api/events` (multipart: title, date, description?, categories?, files[]?)
- `PUT    /api/events/:id` (json o multipart; event_categories[] y/o files[] opcionales)
- `DELETE /api/events/:id`

Categorías:

- `GET    /api/categories`
- `POST   /api/categories` (json: name, description)
- `DELETE /api/categories/:id`
