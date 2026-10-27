# AGENTS.md — confirm-deliveries

Guía para agentes de IA (Claude Code, Codex, Copilot, etc.). Fuente única de verdad: `CLAUDE.md` importa este archivo.

## Qué es

Sistema para **confirmar guías de envío** y seguir su estado: un usuario autenticado registra guías (dirección, ciudad, valor, costo de envío, proveedor…), cambia su estado y consulta el historial. Proyecto de portafolio (repo público).

Origen: API Express sobre GCP Cloud Functions + Firestore con JWT propio, eliminada en la fase 2. Documentación de ese sistema: `docs/legacy-firestore-api.md`.

## Migración por fases

| Fase | Qué | Estado |
|---|---|---|
| 1 | Esquema Supabase: tablas, constraints, triggers, RLS, seed | ✅ |
| 2 | API Express (`api/`) con Supabase Auth, tests de integración; borrado del legacy | ✅ |
| 3 | Frontend React + TS + Vite (`web/`): login, lista, etiqueta con recorrido, cambio de estado, alta de guías | ✅ |
| 4 | CI/CD en GitHub Actions: lint, tests, imagen Docker de la API en GHCR, frontend en Vercel | pendiente |
| 5 | Demo en vivo y README | pendiente |

Demo en vivo (costo cero): web → Vercel · api → Render free (imagen de GHCR) · DB/Auth → Supabase free. Limitaciones aceptadas: Render free duerme la API tras inactividad (cold start ~30–50 s; el frontend debe mostrar un estado de carga claro) y Supabase free pausa proyectos inactivos ~1 semana. El README debe avisarlo.

Por qué PostgreSQL: pedidos, estados e historial de cambios son relacionales. (MongoDB se muestra en otro proyecto del portafolio; no proponerlo aquí.)

## Estructura

```
api/            Node + Express 5 (ESM, JavaScript)
  src/
    app.js          app Express: CORS, /health, Swagger, router, errores
    server.js       arranque (listen)
    supabase.js     clientes: verificación de tokens y cliente por usuario
    middlewares.js  authenticate, validate (Joi), errorHandler, HttpError
    schemas.js      esquemas Joi
    routes.js       endpoints /api/v1
    openapi.js      especificación OpenAPI (servida en /api/v1/docs)
  test/           integración contra Supabase local (Vitest + Supertest)
web/            React 19 + TS + Vite (deploy en Vercel, root dir = web)
  src/
    App.tsx           sesión de Supabase → Login o Deliveries
    Login.tsx         login + acceso con cuenta demo + etiqueta de ejemplo
    Deliveries.tsx    lista con filtros por estado + panel de detalle
    GuideLabel.tsx    la guía como etiqueta de envío: datos, acciones y recorrido
    NewGuideDialog.tsx  alta de una guía (<dialog> nativo)
    lib/api.ts        cliente Supabase, tipos y llamadas a la API
    lib/status.ts     etiquetas, transiciones (espejo de la DB) y formatos
supabase/       config, migrations/ (única fuente del esquema), seed.sql
docs/           documentación del sistema legacy
```

## Modelo de datos

Fuente de verdad: `supabase/migrations/`. Resumen:

- `profiles` — PK → `auth.users(id)`, `username` único. Se crea por trigger al registrarse (`username` desde `options.data` del signUp; si falta, el email).
- `guides` — reglas de validación como `check` constraints; `guia` único; `status`, `created_by` (default `auth.uid()`), `created_at`, `updated_at`. `numero_cuenta` e `id_proveedor` son `text` (ceros a la izquierda).
- `delivery_status` — `confirmada` (al crear) → `en_transito` | `cancelada`; `en_transito` → `entregada` | `devuelta`. Los demás son finales. Transición inválida → error `23514`.
- `guide_status_history` — una fila por creación y por cambio de estado, escrita **solo** por trigger (`changed_by = auth.uid()`).

Seguridad: RLS en todas las tablas + privilegios por columna. `authenticated` puede leer todo, insertar guías (sin `status`/`created_by`) y actualizar **solo** `status`; `anon` no accede a nada. La DB se protege aunque se llame a PostgREST directamente con la publishable key.

La API llama a Supabase **con el token del usuario** (`clientFor(token)`), nunca con la secret key: si no, `auth.uid()` es null y se pierden RLS, `created_by` y `changed_by`.

Seed local: usuario `demo@confirm-deliveries.dev` / `demo1234` con 5 guías en distintos estados.

## API

Prefijo `/api/v1`, header `Authorization: Bearer <access_token de Supabase>`. Swagger UI en `/api/v1/docs`; `/health` es público.

- `GET /me` — perfil del usuario actual
- `GET /guides?status=` — lista, más recientes primero
- `GET /guides/:id` — detalle + `history`
- `POST /guides` — array de 1–100 guías, un solo INSERT (todas o ninguna)
- `PATCH /guides/:id/status` — `{ status }`; la DB valida la transición y registra el historial

No hay registro ni login en la API: el frontend usa `supabase-js` directamente.

Errores: `{ message, errors? }`. `errorHandler` traduce códigos de Postgres/PostgREST: `23505` → 409, `23514`/`22P02` → 400, `42501` → 403, `PGRST116` → 404. Validación Joi → 400 con todos los mensajes (en español).

## Comandos

Todo desde la raíz del repo. Docker debe estar corriendo; el CLI de Supabase se usa vía `npx`.

```bash
npx supabase start        # Postgres + Auth + Studio (http://127.0.0.1:54323)
npx supabase db reset     # reaplica migrations + seed (los tests asumen el seed)
npx supabase migration new <nombre>
npx supabase stop

cp api/.env.example api/.env   # rellenar con `npx supabase status`
npm --prefix api install
npm --prefix api run dev       # http://localhost:3000, recarga con --watch
npm --prefix api test          # requiere Supabase local levantado
npm --prefix api run lint      # ESLint + Prettier --check

cp web/.env.example web/.env
npm --prefix web install
npm --prefix web run dev       # http://localhost:5173 (necesita la API en :3000)
npm --prefix web test          # Vitest (lógica pura de lib/)
npm --prefix web run lint      # oxlint + Prettier --check
npm --prefix web run build     # tsc + vite build
```

## Variables de entorno

Nunca commitear `.env`. Mantener `.env.example` en `api/` y `web/`.

Supabase usa claves nuevas: **publishable** (`sb_publishable_…`, pública, sustituye a la anon) y **secret** (`sb_secret_…`, sustituye a la service-role). Los access tokens van firmados con ES256: se verifican con `supabase.auth.getClaims()` (JWKS), no con un JWT secret compartido.

- api: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `PORT`, `CORS_ORIGIN` (origen del frontend en producción; por defecto `*`).
- web: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_URL`. Nada secreto con prefijo `VITE_`.

## Convenciones

- Idioma: código y nombres técnicos en inglés; campos de dominio en español (`guia`, `ciudad_destino`…) por continuidad con el contrato original. Mensajes al usuario, docs y commits en español.
- API sin capa de services: los handlers usan el query builder de Supabase directamente y las reglas de negocio viven en la DB (constraints, triggers, RLS). Joi duplica las reglas solo para dar mensajes claros.
- Express 5: los errores async llegan solos al `errorHandler`; no envolver handlers en try/catch. Lanzar `HttpError(status, message)` o el `error` de Supabase.
- Cambios de esquema **solo** con una migración nueva. Nunca editar una migración ya aplicada.
- Tests: Vitest; en la API, integración real contra Supabase local (sin mocks de la DB). Cada endpoint con al menos un caso de éxito y uno de error.
- Lint: ESLint flat config (`@eslint/js` recommended) + Prettier (`singleQuote`, `printWidth: 100`).
- Node 24+.
- Frontend: sin router ni librerías de estado/datos/UI; `fetch` + estado de React, CSS plano con tokens en `index.css` (modo oscuro por `prefers-color-scheme`). Para trabajo visual, usar la skill `frontend-design`. Dirección visual: la guía como etiqueta de envío (Barlow Condensed para números y títulos, Barlow para texto, borde cartón en la etiqueta activa, un color por estado).
- Mínimo necesario: sin abstracciones especulativas ni dependencias nuevas si una existente o la plataforma lo resuelve. Los atajos deliberados se comentan con `// Límite conocido: …`, indicando el límite y cómo ampliarlo.

## Límites para agentes

- No hacer push, deploy, ni crear recursos en Supabase cloud / Vercel / Render / GHCR sin confirmación.
- Git: nunca añadir a la IA como autor o coautor (sin trailers `Co-Authored-By` ni firmas "Generated with…").
- Rama por fase, commits pequeños, PR a `main`.
