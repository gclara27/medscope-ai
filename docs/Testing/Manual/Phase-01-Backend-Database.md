# Fase 1 — Tests manuales: Backend + Base de datos

**Alcance:** FastAPI, PostgreSQL, modelos MVP, migraciones Alembic, seed demo y autenticación API (JWT, roles).

**Referencia:** [Task Tracker — Fase 1](../../TaskTracker.md#fase-1--backend--base-de-datos) · [Execution Plan — Phase 1](../../Execution%20Plan/ExecutionPlan.md#phase-1--database--backend-foundation) · [Database.md](../../Database/Database.md)

**Nota:** Los casos de login/logout/roles en la **interfaz web** se documentan en Fase 4. Aquí se valida la **API REST** (principalmente vía Swagger).

---

## Resumen de progreso

Actualiza esta tabla al ir ejecutando los tests:


| Prioridad | Total  | Ejecutados | Pendientes |
| --------- | ------ | ---------- | ---------- |
| P0        | 22     | 0          | 22         |
| P1        | 6      | 0          | 6          |
| P2        | 3      | 0          | 3          |
| **Total** | **31** | **0**      | **31**     |



| Área                             | Tests | IDs                   |
| -------------------------------- | ----- | --------------------- |
| INF — Infraestructura            | 4     | MT-P01-INF-001 … 004  |
| API — FastAPI / OpenAPI          | 4     | MT-P01-API-001 … 004  |
| DB — PostgreSQL / Alembic        | 6     | MT-P01-DB-001 … 006   |
| AUTH — Autenticación (positivos) | 6     | MT-P01-AUTH-001 … 006 |
| RBAC — Autorización por rol      | 4     | MT-P01-RBAC-001 … 004 |
| NEG — Casos negativos            | 5     | MT-P01-NEG-001 … 005  |
| SEC — Seguridad                  | 2     | MT-P01-SEC-001 … 002  |


---

## Antes de empezar (lectura obligatoria)

### Qué necesitas instalado


| Herramienta                       | Para qué               |
| --------------------------------- | ---------------------- |
| Python 3.12+                      | Backend                |
| Docker Desktop                    | PostgreSQL             |
| Git                               | Clonar el repositorio  |
| Navegador (Chrome, Edge, Firefox) | Swagger y health check |


Node.js solo es necesario si quieres levantar también el frontend; **para la mayoría de tests de Fase 1 basta con backend + PostgreSQL**.

### Credenciales demo

Todos los usuarios usan la misma contraseña: `**MedScope123!`**


| Email                   | Rol       |
| ----------------------- | --------- |
| `admin@medscope.ai`     | admin     |
| `clinician@medscope.ai` | clinician |
| `analyst@medscope.ai`   | analyst   |
| `nurse@medscope.ai`     | nurse     |


### Cómo usar Swagger (`/docs`)

Swagger es la documentación interactiva de la API. Para probar un endpoint:

1. Abre [http://localhost:8000/docs](http://localhost:8000/docs) en el navegador.
2. Busca el endpoint (por ejemplo `POST /auth/login`).
3. Haz clic en la fila del endpoint para expandirla.
4. Pulsa el botón **Try it out** (arriba a la derecha del bloque).
5. Rellena el cuerpo de la petición (JSON) si hace falta.
6. Pulsa **Execute**.
7. Mira abajo **Server response**: código HTTP y cuerpo JSON.

Para endpoints que requieren login:

1. Primero ejecuta `POST /auth/login` y copia el valor de `access_token` de la respuesta.
2. Arriba de la página Swagger, pulsa el botón **Authorize** (candado).
3. En el campo **Value**, pega **solo el token** (sin escribir `Bearer`).
4. Pulsa **Authorize** y cierra el diálogo.
5. Ahora los endpoints protegidos enviarán el JWT automáticamente.

---

# INF — Infraestructura

---

### MT-P01-INF-001 — Configuración inicial del entorno (solo primera vez)


| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **Prioridad**    | P0                                 |
| **Trazabilidad** | T-012, T-014, T-016                |
| **Canal**        | PowerShell en la raíz del proyecto |


**Precondiciones**

- Repositorio clonado en tu máquina (por ejemplo `C:\Pojects\medscope-ai`).
- Docker Desktop instalado.

**Pasos**

1. Abre **PowerShell** o la terminal integrada de Cursor.
2. Ve a la carpeta del proyecto:
  ```powershell
   cd C:\Pojects\medscope-ai
  ```
   *(Ajusta la ruta si tu copia está en otra ubicación.)*
3. Ejecuta el script de configuración:
  ```powershell
   .\scripts\setup-dev.ps1
  ```
4. Espera a que termine sin errores. Debe crear:
  - archivo `.env` (copiado desde `.env.example`),
  - carpeta `.venv` con Python,
  - dependencias del backend y del frontend.

**Resultado esperado**

- El script finaliza con mensaje de éxito.
- Existe el archivo `.env` en la raíz del proyecto.
- Existe la carpeta `.venv`.

**Criterios de aceptación**

- [x] `.\scripts\setup-dev.ps1` termina sin error
- [x] Archivo `.env` presente en la raíz
- [x] Carpeta `.venv` presente

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-INF-002 — Arranque del stack de desarrollo


| Campo            | Valor                  |
| ---------------- | ---------------------- |
| **Prioridad**    | P0                     |
| **Trazabilidad** | T-101, T-110, T-117    |
| **Canal**        | PowerShell + navegador |


**Precondiciones**

- MT-P01-INF-001 completado (o entorno ya configurado previamente).
- **Docker Desktop abierto** y en ejecución (icono de la ballena en la bandeja del sistema).

**Pasos**

1. Abre PowerShell en la raíz del proyecto.
2. Ejecuta:
  ```powershell
   .\dev.bat
  ```
   *(También vale `.\scripts\start-dev.ps1`.)*
3. Observa la salida en la terminal principal. Debe indicar:
  - PostgreSQL listo,
  - migraciones aplicadas,
  - apertura de dos ventanas nuevas (backend y frontend).
4. En la ventana titulada **MedScope AI - Backend**, espera a ver un mensaje similar a:
  ```text
   Uvicorn running on http://127.0.0.1:8000
  ```
5. Abre el navegador en [http://localhost:8000/health](http://localhost:8000/health)

**Resultado esperado**

- La página muestra JSON: `{"status":"ok","service":"medscope-api"}` (o equivalente).
- No hay errores de conexión en el navegador.

**Criterios de aceptación**

- [x] Script de arranque termina sin error fatal
- [x] Ventana del backend muestra Uvicorn en puerto 8000
- [x] `GET /health` responde en el navegador

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-INF-003 — Health check del API


| Campo            | Valor          |
| ---------------- | -------------- |
| **Prioridad**    | P0             |
| **Trazabilidad** | T-101, RBE-001 |
| **Canal**        | Navegador      |


**Precondiciones**

- Backend en ejecución (MT-P01-INF-002).

**Pasos**

1. Abre [http://localhost:8000/health](http://localhost:8000/health)
2. Lee el JSON devuelto.

**Resultado esperado**

```json
{
  "status": "ok",
  "service": "medscope-api"
}
```

**Criterios de aceptación**

- [x] HTTP 200 (la página carga sin error)
- [x] Campo `status` = `"ok"`
- [x] Campo `service` = `"medscope-api"`

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-INF-004 — Variables de entorno mínimas


| Campo            | Valor                 |
| ---------------- | --------------------- |
| **Prioridad**    | P1                    |
| **Trazabilidad** | T-102, T-103, RDO-020 |
| **Canal**        | Editor de texto       |


**Precondiciones**

- Archivo `.env` existe.

**Pasos**

1. Abre el archivo `.env` en la raíz del proyecto con un editor de texto.
2. Comprueba que existen (con valores no vacíos) al menos estas variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `CORS_ORIGINS`
3. Verifica que `DATABASE_URL` apunta a PostgreSQL local, por ejemplo:
  ```text
   postgresql://medscope:medscope_dev@localhost:5432/medscope_ai
  ```

**Resultado esperado**

- El backend puede arrancar y conectar a la base de datos (ya validado si INF-002 pasó).
- `CORS_ORIGINS` incluye `http://localhost:5173`.

**Criterios de aceptación**

- [x] `DATABASE_URL` definida y coherente con Docker Compose
- [x] `JWT_SECRET` definida (no vacía)
- [x] `CORS_ORIGINS` incluye el origen del frontend local

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

# API — FastAPI / OpenAPI

---

### MT-P01-API-001 — Swagger UI accesible


| Campo            | Valor          |
| ---------------- | -------------- |
| **Prioridad**    | P0             |
| **Trazabilidad** | T-105, RBE-002 |
| **Canal**        | Navegador      |


**Precondiciones**

- Backend en ejecución.

**Pasos**

1. Abre [http://localhost:8000/docs](http://localhost:8000/docs)
2. Comprueba que la página carga la interfaz **Swagger UI**.
3. En la lista de endpoints, localiza al menos:
  - `GET /health` (tag `system`)
  - `POST /auth/login` (tag `auth`)
  - `GET /auth/me` (tag `auth`)

**Resultado esperado**

- Página Swagger visible, sin error 404 ni pantalla en blanco.
- Endpoints de autenticación listados bajo el grupo **auth**.

**Criterios de aceptación**

- [x] `/docs` carga correctamente
- [x] Se ven endpoints de `auth` y `system`
- [x] Botón **Authorize** visible arriba a la derecha

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-API-002 — Esquema OpenAPI JSON


| Campo            | Valor          |
| ---------------- | -------------- |
| **Prioridad**    | P1             |
| **Trazabilidad** | T-105, RBE-002 |
| **Canal**        | Navegador      |


**Precondiciones**

- Backend en ejecución.

**Pasos**

1. Abre [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
2. El navegador muestra un JSON grande. Busca (Ctrl+F):
  - `"title": "MedScope AI"`
  - `"/health"`
  - `"/auth/login"`

**Resultado esperado**

- JSON válido con `openapi` versión 3.x.
- `info.title` = `MedScope AI`.
- Rutas `/health` y `/auth/login` presentes en `paths`.

**Criterios de aceptación**

- [x] JSON accesible sin error
- [x] Título de la API correcto
- [x] Rutas auth y health documentadas

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

### MT-P01-API-003 — ReDoc accesible


| Campo            | Valor     |
| ---------------- | --------- |
| **Prioridad**    | P2        |
| **Trazabilidad** | T-105     |
| **Canal**        | Navegador |


**Precondiciones**

- Backend en ejecución.

**Pasos**

1. Abre [http://localhost:8000/redoc](http://localhost:8000/redoc)
2. Comprueba que carga documentación alternativa (ReDoc).

**Resultado esperado**

- Página ReDoc con la documentación de la API.

**Criterios de aceptación**

- [x] `/redoc` carga sin error 404

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

### MT-P01-API-004 — CORS permite el frontend local


| Campo            | Valor                                           |
| ---------------- | ----------------------------------------------- |
| **Prioridad**    | P1                                              |
| **Trazabilidad** | T-125, RNF-033                                  |
| **Canal**        | Navegador (frontend + consola de desarrollador) |


**Precondiciones**

- Backend y frontend en ejecución (`.\dev.bat` levanta ambos).
- Frontend accesible en [http://localhost:5173/login](http://localhost:5173/login)

**Pasos**

1. Abre [http://localhost:5173/login](http://localhost:5173/login)
2. Abre las **herramientas de desarrollador** del navegador (F12).
3. Ve a la pestaña **Console** (Consola).
4. Introduce credenciales válidas:
  - Email: `clinician@medscope.ai`
  - Password: `MedScope123!`
5. Pulsa el botón de login de la aplicación (texto en inglés, por ejemplo **Sign in**).
6. Observa si el login funciona y si en la consola aparece un error de **CORS**.

**Resultado esperado**

- Login exitoso (redirección al dashboard o pantalla principal autenticada).
- **No** aparece en consola un error del tipo `blocked by CORS policy`.

**Criterios de aceptación**

- [x] Login desde el frontend completa sin error CORS visible
- [x] La petición a `http://localhost:8000/auth/login` no falla por origen bloqueado

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

# DB — PostgreSQL / Alembic

---

### MT-P01-DB-001 — Contenedor PostgreSQL en ejecución


| Campo            | Valor          |
| ---------------- | -------------- |
| **Prioridad**    | P0             |
| **Trazabilidad** | T-110, RDB-010 |
| **Canal**        | PowerShell     |


**Precondiciones**

- Stack arrancado con `.\dev.bat` o `docker compose up postgres -d`.

**Pasos**

1. En PowerShell, desde la raíz del proyecto:
  ```powershell
   docker compose ps
  ```
2. Localiza el servicio `postgres`. El estado debe ser **running** (o `Up`).
3. Comprueba conectividad:
  ```powershell
   docker compose exec -T postgres pg_isready -U medscope -d medscope_ai
  ```
4. La salida debe incluir `accepting connections`.

**Resultado esperado**

- Contenedor PostgreSQL activo.
- `pg_isready` confirma que acepta conexiones.

**Criterios de aceptación**

- [x] Servicio `postgres` en estado running
- [x] `pg_isready` exitoso

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-DB-002 — Migraciones Alembic aplicadas


| Campo            | Valor          |
| ---------------- | -------------- |
| **Prioridad**    | P0             |
| **Trazabilidad** | T-117, RDB-020 |
| **Canal**        | PowerShell     |


**Precondiciones**

- PostgreSQL en ejecución.
- Entorno virtual creado (`.venv`).

**Pasos**

1. Desde la raíz del proyecto:
  ```powershell
   cd backend
   ..\.venv\Scripts\alembic.exe current
  ```
2. Anota la revisión mostrada (debe ser la última, por ejemplo `1152e8c4f00f` — seed demo users).
3. Opcional — forzar migración manual:
  ```powershell
   ..\.venv\Scripts\alembic.exe upgrade head
  ```
   Debe terminar sin error (si ya está al día, no cambia nada).

**Resultado esperado**

- `alembic current` muestra una revisión (no vacía).
- `upgrade head` no falla.

**Criterios de aceptación**

- [x] `alembic current` muestra revisión aplicada
- [x] `alembic upgrade head` sin errores

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

### MT-P01-DB-003 — Tablas MVP existen


| Campo            | Valor                         |
| ---------------- | ----------------------------- |
| **Prioridad**    | P0                            |
| **Trazabilidad** | T-111 … T-116, Database.md §4 |
| **Canal**        | PowerShell + psql             |


**Precondiciones**

- Migraciones aplicadas (MT-P01-DB-002).

**Pasos**

1. Desde la raíz del proyecto:
  ```powershell
   docker compose exec -T postgres psql -U medscope -d medscope_ai -c "\dt"
  ```
2. Comprueba que aparecen estas tablas (entre otras):
  - `roles`
  - `users`
  - `predictions`
  - `patient_inputs`
  - `shap_explanations`
  - `simulations`
  - `simulation_inputs`
  - `alembic_version`

**Resultado esperado**

- Las 7 tablas de dominio MVP listadas arriba existen en el esquema `public`.

**Criterios de aceptación**

- [x] Tabla `roles` existe
- [x] Tabla `users` existe
- [x] Tablas `predictions`, `patient_inputs`, `shap_explanations` existen
- [x] Tablas `simulations`, `simulation_inputs` existen

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-DB-004 — Seed de roles


| Campo            | Valor             |
| ---------------- | ----------------- |
| **Prioridad**    | P0                |
| **Trazabilidad** | T-118, RF-004     |
| **Canal**        | PowerShell + psql |


**Precondiciones**

- Migraciones y seed aplicados.

**Pasos**

1. Ejecuta:
  ```powershell
   docker compose exec -T postgres psql -U medscope -d medscope_ai -c "SELECT name FROM roles ORDER BY name;"
  ```
2. Comprueba los nombres devueltos.

**Resultado esperado**

Exactamente estos cuatro roles (orden alfabético):

```text
 admin
 analyst
 clinician
 nurse
```

**Criterios de aceptación**

- [x] Existen 4 filas
- [x] Nombres: `admin`, `analyst`, `clinician`, `nurse`

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-DB-005 — Seed de usuarios demo


| Campo            | Valor                  |
| ---------------- | ---------------------- |
| **Prioridad**    | P0                     |
| **Trazabilidad** | T-119, Database.md §10 |
| **Canal**        | PowerShell + psql      |


**Precondiciones**

- Seed de usuarios aplicado (migración `1152e8c4f00f`).

**Pasos**

1. Ejecuta:
  ```powershell
   docker compose exec -T postgres psql -U medscope -d medscope_ai -c "SELECT u.email, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.email;"
  ```
2. Comprueba el listado.

**Resultado esperado**


| email                                                 | role      |
| ----------------------------------------------------- | --------- |
| [admin@medscope.ai](mailto:admin@medscope.ai)         | admin     |
| [analyst@medscope.ai](mailto:analyst@medscope.ai)     | analyst   |
| [clinician@medscope.ai](mailto:clinician@medscope.ai) | clinician |
| [nurse@medscope.ai](mailto:nurse@medscope.ai)         | nurse     |


**Criterios de aceptación**

- [x] 4 usuarios presentes
- [x] Emails y roles coinciden con la tabla anterior
- [x] Todos tienen `is_active = true` (opcional):
  ```powershell
  docker compose exec -T postgres psql -U medscope -d medscope_ai -c "SELECT email, is_active FROM users ORDER BY email;"
  ```

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-DB-006 — Contraseñas almacenadas con hash bcrypt


| Campo            | Valor             |
| ---------------- | ----------------- |
| **Prioridad**    | P0                |
| **Trazabilidad** | T-120, RNF-030    |
| **Canal**        | PowerShell + psql |


**Precondiciones**

- Usuarios demo en base de datos.

**Pasos**

1. Ejecuta:
  ```powershell
   docker compose exec -T postgres psql -U medscope -d medscope_ai -c "SELECT email, LEFT(password_hash, 4) AS prefix, LENGTH(password_hash) AS len FROM users ORDER BY email;"
  ```
2. Observa la columna `prefix` y la longitud.

**Resultado esperado**

- `prefix` comienza por `$2b$` (formato bcrypt).
- `password_hash` **no** es la contraseña en texto plano `MedScope123!`.
- Longitud del hash > 50 caracteres.

**Criterios de aceptación**

- [x] Todos los usuarios tienen hash que empieza por `$2b$`
- [x] Ningún `password_hash` es igual a `MedScope123!`

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

# AUTH — Autenticación (casos positivos)

---

### MT-P01-AUTH-001 — Login admin


| Campo            | Valor                 |
| ---------------- | --------------------- |
| **Prioridad**    | P0                    |
| **Trazabilidad** | UC-001, RF-001, T-121 |
| **Canal**        | Swagger               |


**Precondiciones**

- Backend y seed listos.

**Pasos**

1. Abre [http://localhost:8000/docs](http://localhost:8000/docs)
2. Expande `POST /auth/login` → **Try it out**.
3. En el cuerpo Request body, pega:
  ```json
   {
     "email": "admin@medscope.ai",
     "password": "MedScope123!"
   }
  ```
4. Pulsa **Execute**.

**Resultado esperado**

- **Code:** `200`
- Cuerpo similar a:
  ```json
  {
    "access_token": "<JWT largo>",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "email": "admin@medscope.ai",
      "role": "admin",
      ...
    }
  }
  ```

**Criterios de aceptación**

- [x] HTTP 200
- [x] `access_token` no vacío
- [x] `token_type` = `bearer`
- [x] `user.role` = `admin`
- [x] `user.email` = `admin@medscope.ai`

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

### MT-P01-AUTH-002 — Login clinician


| Campo            | Valor                 |
| ---------------- | --------------------- |
| **Prioridad**    | P0                    |
| **Trazabilidad** | UC-001, US-001, T-121 |
| **Canal**        | Swagger               |


**Pasos**

1. En `POST /auth/login`, usa:
  ```json
   {
     "email": "clinician@medscope.ai",
     "password": "MedScope123!"
   }
  ```
2. **Execute**.

**Resultado esperado**

- HTTP 200, `user.role` = `clinician`.

**Criterios de aceptación**

- [x] HTTP 200
- [x] `user.role` = `clinician`

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

### MT-P01-AUTH-003 — Login analyst


| Campo            | Valor         |
| ---------------- | ------------- |
| **Prioridad**    | P0            |
| **Trazabilidad** | UC-001, T-121 |
| **Canal**        | Swagger       |


**Pasos**

1. `POST /auth/login` con:
  ```json
   {
     "email": "analyst@medscope.ai",
     "password": "MedScope123!"
   }
  ```

**Resultado esperado**

- HTTP 200, `user.role` = `analyst`.

**Criterios de aceptación**

- [x] HTTP 200
- [x] `user.role` = `analyst`

**Ejecución manual**


| ✓    | Fecha      | Ejecutado por | Notas |
| ---- | ---------- | ------------- | ----- |
| [OK] | 19/06/2026 | GC            |       |


---

### MT-P01-AUTH-004 — Login nurse


| Campo            | Valor         |
| ---------------- | ------------- |
| **Prioridad**    | P0            |
| **Trazabilidad** | UC-001, T-121 |
| **Canal**        | Swagger       |


**Pasos**

1. `POST /auth/login` con:
  ```json
   {
     "email": "nurse@medscope.ai",
     "password": "MedScope123!"
   }
  ```

**Resultado esperado**

- HTTP 200, `user.role` = `nurse`.

**Criterios de aceptación**

- [x] HTTP 200
- [x] `user.role` = `nurse`

**Ejecución manual**


| ✓    | Fecha      | Ejecutado por | Notas |
| ---- | ---------- | ------------- | ----- |
| [OK] | 19/06/2026 | GC            |       |


---

### MT-P01-AUTH-005 — Obtener usuario actual (`GET /auth/me`)


| Campo            | Valor         |
| ---------------- | ------------- |
| **Prioridad**    | P0            |
| **Trazabilidad** | UC-080, T-122 |
| **Canal**        | Swagger       |


**Precondiciones**

- Token JWT válido (por ejemplo del login clinician en AUTH-002).

**Pasos**

1. Copia `access_token` del login de `clinician@medscope.ai`.
2. Pulsa **Authorize** en Swagger y pega el token.
3. Expande `GET /auth/me` → **Try it out** → **Execute**.

**Resultado esperado**

- HTTP 200
- Cuerpo con datos del clinician, por ejemplo:
  ```json
  {
    "email": "clinician@medscope.ai",
    "first_name": "Clara",
    "last_name": "Clinician",
    "role": "clinician"
  }
  ```

**Criterios de aceptación**

- [x] HTTP 200 sin volver a enviar email/password en la petición
- [x] Email y rol coinciden con el usuario que hizo login

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-AUTH-006 — Logout (`POST /auth/logout`)


| Campo            | Valor                 |
| ---------------- | --------------------- |
| **Prioridad**    | P0                    |
| **Trazabilidad** | UC-002, RF-002, T-124 |
| **Canal**        | Swagger               |


**Precondiciones**

- Token JWT autorizado en Swagger (mismo de AUTH-005).

**Pasos**

1. Con el token aún autorizado, expande `POST /auth/logout`.
2. **Try it out** → **Execute** (el cuerpo puede estar vacío).
3. Lee la respuesta.
4. Pulsa **Authorize** de nuevo y **Logout** en el diálogo de Swagger para limpiar el token del cliente Swagger.
5. Intenta de nuevo `GET /auth/me` **sin** reautorizar.

**Resultado esperado**

- Logout: HTTP 200, mensaje que indica cerrar sesión en el cliente (texto en inglés).
- `/auth/me` sin token: HTTP **401**.

**Criterios de aceptación**

- [x] `POST /auth/logout` → 200 con mensaje de éxito
- [x] Tras quitar el token, `GET /auth/me` → 401

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

# RBAC — Autorización por rol

---

### MT-P01-RBAC-001 — Admin accede a endpoint restringido


| Campo            | Valor                 |
| ---------------- | --------------------- |
| **Prioridad**    | P0                    |
| **Trazabilidad** | UC-003, RF-004, T-123 |
| **Canal**        | Swagger               |


**Pasos**

1. Login como `admin@medscope.ai` → copia token.
2. **Authorize** con ese token.
3. Expande `GET /auth/admin/ping` → **Execute**.

**Resultado esperado**

- HTTP 200
- Cuerpo similar a: `{"status": "ok", "role": "admin"}`

**Criterios de aceptación**

- [x] HTTP 200
- [x] Campo `role` = `admin`

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-RBAC-002 — Clinician denegado en endpoint admin


| Campo            | Valor         |
| ---------------- | ------------- |
| **Prioridad**    | P0            |
| **Trazabilidad** | UC-003, T-123 |
| **Canal**        | Swagger       |


**Pasos**

1. Login como `clinician@medscope.ai` → token → **Authorize**.
2. `GET /auth/admin/ping` → **Execute**.

**Resultado esperado**

- HTTP **403**
- `detail` en inglés, por ejemplo: `"Insufficient permissions"`

**Criterios de aceptación**

- [x] HTTP 403 (no 401 ni 200)
- [x] Mensaje de permisos insuficientes

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

### MT-P01-RBAC-003 — Analyst denegado en endpoint admin


| Campo            | Valor         |
| ---------------- | ------------- |
| **Prioridad**    | P0            |
| **Trazabilidad** | UC-003, T-123 |
| **Canal**        | Swagger       |


**Pasos**

1. Login `analyst@medscope.ai` → `GET /auth/admin/ping`.

**Resultado esperado**

- HTTP 403.

**Criterios de aceptación**

- [x] HTTP 403

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

### MT-P01-RBAC-004 — Nurse denegado en endpoint admin


| Campo            | Valor         |
| ---------------- | ------------- |
| **Prioridad**    | P0            |
| **Trazabilidad** | UC-003, T-123 |
| **Canal**        | Swagger       |


**Pasos**

1. Login `nurse@medscope.ai` → `GET /auth/admin/ping`.

**Resultado esperado**

- HTTP 403.

**Criterios de aceptación**

- [x] HTTP 403

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

# NEG — Casos negativos

---

### MT-P01-NEG-001 — Login con contraseña incorrecta


| Campo            | Valor                             |
| ---------------- | --------------------------------- |
| **Prioridad**    | P0                                |
| **Trazabilidad** | UC-001 (flujo alternativo), T-121 |
| **Canal**        | Swagger                           |


**Pasos**

1. `POST /auth/login`:
  ```json
   {
     "email": "clinician@medscope.ai",
     "password": "ContraseñaIncorrecta"
   }
  ```

**Resultado esperado**

- HTTP **401**
- `detail`: `"Invalid email or password"` (inglés)

**Criterios de aceptación**

- [x] HTTP 401
- [x] No se devuelve `access_token`
- [x] Mensaje genérico (no revela si el email existe)

**Ejecución manual**


| ✓    | Fecha      | Ejecutado por | Notas |
| ---- | ---------- | ------------- | ----- |
| [OK] | 19/06/2026 | GC            |       |


---

### MT-P01-NEG-002 — Login con email inexistente


| Campo            | Valor         |
| ---------------- | ------------- |
| **Prioridad**    | P0            |
| **Trazabilidad** | UC-001, T-121 |
| **Canal**        | Swagger       |


**Pasos**

1. `POST /auth/login`:
  ```json
   {
     "email": "noexiste@medscope.ai",
     "password": "MedScope123!"
   }
  ```

**Resultado esperado**

- HTTP 401, mismo mensaje que contraseña incorrecta.

**Criterios de aceptación**

- [x] HTTP 401
- [x] Sin `access_token`

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-NEG-003 — Endpoint protegido sin token


| Campo            | Valor         |
| ---------------- | ------------- |
| **Prioridad**    | P0            |
| **Trazabilidad** | UC-080, T-122 |
| **Canal**        | Swagger       |


**Pasos**

1. En Swagger, pulsa **Authorize** → **Logout** para asegurarte de que no hay token.
2. Sin autorizar, ejecuta `GET /auth/me`.

**Resultado esperado**

- HTTP **401**
- `detail`: `"Not authenticated"`

**Criterios de aceptación**

- [x] HTTP 401 en `/auth/me` sin cabecera Authorization

**Ejecución manual**


| ✓    | Fecha      | Ejecutado por | Notas |
| ---- | ---------- | ------------- | ----- |
| [ GC | 19/06/2026 | GC            |       |


---

### MT-P01-NEG-004 — Token JWT inválido


| Campo            | Valor   |
| ---------------- | ------- |
| **Prioridad**    | P0      |
| **Trazabilidad** | T-122   |
| **Canal**        | Swagger |


**Pasos**

1. **Authorize** con un valor inventado, por ejemplo: `token-invalido-de-prueba`
2. Ejecuta `GET /auth/me`.

**Resultado esperado**

- HTTP **401**

**Criterios de aceptación**

- [x] HTTP 401 con token malformado o falso

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [GC ] | 19/06/2026 | GC            |       |


---

### MT-P01-NEG-005 — Login con cuerpo JSON inválido


| Campo            | Valor           |
| ---------------- | --------------- |
| **Prioridad**    | P1              |
| **Trazabilidad** | RTS-002, UC-090 |
| **Canal**        | Swagger         |


**Pasos**

1. `POST /auth/login` con cuerpo incompleto:
  ```json
   {
     "email": "clinician@medscope.ai"
   }
  ```
   (sin campo `password`)
2. **Execute**.

**Resultado esperado**

- HTTP **422** (error de validación).
- Detalle de campos faltantes (formato estándar FastAPI/Pydantic).

**Criterios de aceptación**

- [x] HTTP 422
- [x] Respuesta describe el error de validación sin stack trace

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [OK ] | 19/06/2026 | GC            |       |


---

# SEC — Seguridad

---

### MT-P01-SEC-001 — Respuestas de error sin stack trace


| Campo            | Valor           |
| ---------------- | --------------- |
| **Prioridad**    | P1              |
| **Trazabilidad** | RNF-032, UC-091 |
| **Canal**        | Swagger         |


**Pasos**

1. Repite MT-P01-NEG-001 (login fallido) o NEG-005 (422).
2. Lee el cuerpo JSON completo de la respuesta.

**Resultado esperado**

- Solo campos de error de API (`detail`, etc.).
- **No** aparece traceback de Python ni rutas internas del servidor.

**Criterios de aceptación**

- [x] Error 401/422 sin stack trace en el JSON
- [x] No se filtra información sensible del servidor

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

### MT-P01-SEC-002 — Login no devuelve contraseña ni hash


| Campo            | Valor              |
| ---------------- | ------------------ |
| **Prioridad**    | P1                 |
| **Trazabilidad** | RNF-030, AGENTS.md |
| **Canal**        | Swagger            |


**Pasos**

1. Ejecuta login exitoso (AUTH-002).
2. Revisa todo el JSON de respuesta (Ctrl+F en el navegador).

**Resultado esperado**

- Campos `user`, `access_token`, `token_type`, `expires_in`.
- **Ausentes:** `password`, `password_hash`, `MedScope123!`.

**Criterios de aceptación**

- [x] No hay campo de contraseña en la respuesta
- [x] El hash bcrypt no se expone por API

**Ejecución manual**


| ✓     | Fecha      | Ejecutado por | Notas |
| ----- | ---------- | ------------- | ----- |
| [ OK] | 19/06/2026 | GC            |       |


---

## Flujo recomendado de ejecución (primera vez)

Ejecuta en este orden para minimizar repetición:

1. **INF-001 → INF-003** — preparar y arrancar entorno
2. **DB-001 → DB-006** — validar base de datos
3. **API-001 → API-002** — documentación API
4. **AUTH-001 → AUTH-006** — flujo completo de sesión
5. **RBAC-001 → RBAC-004** — roles
6. **NEG-001 → NEG-005** — errores esperados
7. **SEC-001 → SEC-002** — seguridad
8. **API-004** — CORS (requiere frontend)
9. **API-003**, **INF-004** — complementarios

Tiempo estimado primera ejecución completa: **45–60 minutos**.

---

## Registro de sesiones


| Fecha | Ejecutado por | Commit / rama | P0 (0/22) | P1 (0/6) | P2 (0/3) | Comentarios |
| ----- | ------------- | ------------- | --------- | -------- | -------- | ----------- |
|       |               |               |           |          |          |             |


---

## Anexo — Comandos curl (alternativa a Swagger)

Si prefieres terminal en lugar de Swagger:

**Login:**

```powershell
curl -X POST http://localhost:8000/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"clinician@medscope.ai\",\"password\":\"MedScope123!\"}"
```

**Me (sustituye `TOKEN` por el JWT recibido):**

```powershell
curl http://localhost:8000/auth/me -H "Authorization: Bearer TOKEN"
```

**Admin ping:**

```powershell
curl http://localhost:8000/auth/admin/ping -H "Authorization: Bearer TOKEN"
```

