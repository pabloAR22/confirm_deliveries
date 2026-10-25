# AGENTS.md — confirm-deliveries

Guía para agentes de IA (Claude Code, Codex, Copilot, etc.). Fuente única de verdad: `CLAUDE.md` importa este archivo.

## Qué es

API para **confirmar guías de envío** (entregas): un usuario autenticado registra guías (dirección, ciudad, valor, costo de envío, proveedor…) y consulta las confirmadas. Proyecto de portafolio.

Documentación detallada del estado actual (legacy): `docs/legacy-firestore-api.md`.

## Estado: migración en curso

| | Hoy (legacy, `src/`) | Objetivo |
|---|---|---|
| Runtime | Express envuelto en GCP Cloud Function (`@google-cloud/functions-framework`) | Express standalone en contenedor Docker |
| Datos | Firestore (`users`, `guides`) | Supabase PostgreSQL con tablas relacionales — **esquema listo (fase 1)** |
| Auth | JWT propio + bcrypt (`/auth/register`, `/auth/login`) | Supabase Auth; la API solo verifica el token |
| Frontend | — | React + TypeScript + Vite |
| CI/CD | — | GitHub Actions: lint, tests, imagen Docker en GHCR, frontend en Vercel |
| Demo en vivo | — | web → Vercel · api → Render free (imagen de GHCR) · DB/Auth → Supabase free |
| Costo | — | Cero: Supabase CLI en local con Docker, planes gratuitos para la demo |

Limitaciones aceptadas de la demo: Render free duerme la API tras inactividad (cold start ~30–50 s; el frontend debe mostrar un estado de carga claro) y Supabase free pausa proyectos inactivos ~1 semana. El README debe avisarlo.

Alcance mínimo: modelo Firestore → tablas, API REST, login con Supabase Auth y vista de entregas con su historial de estados.

Por qué PostgreSQL: pedidos, estados e historial de cambios son relacionales. (MongoDB se muestra en otro proyecto del portafolio; no proponerlo aquí.)

## Estructura objetivo

```
api/            Node + Express (código migrado desde src/)
  src/
  test/
  Dockerfile
web/            React + TS + Vite (deploy en Vercel, root dir = web)
supabase/       generado por `supabase init`
  migrations/   SQL versionado: única fuente del esquema
  seed.sql
.github/workflows/
```

`src/`, `firebase.json`, `firestore.*`, `.firebaserc`, `.gcloudignore` y las dependencias de Firebase/GCP/bcrypt/jsonwebtoken se **eliminan** cuando su reemplazo funcione. No mantener ambos caminos en paralelo.

## Modelo de datos (fase 1 ✅)

Fuente de verdad: `supabase/migrations/`. Resumen:

- `profiles` — PK → `auth.users(id)`, `username` único. Se crea por trigger al registrarse (`username` desde `options.data` del signUp; si falta, el email).
- `guides` — campos del legacy con las reglas de Joi como `check` constraints; `guia` único; `status`, `created_by` (default `auth.uid()`), `created_at`, `updated_at`. `numero_cuenta` e `id_proveedor` son `text` (ceros a la izquierda).
- `delivery_status` — `confirmada` (al crear) → `en_transito` | `cancelada`; `en_transito` → `entregada` | `devuelta`. Los demás son finales. Transición inválida → error `23514`.
- `guide_status_history` — una fila por creación y por cambio de estado, escrita **solo** por trigger (`changed_by = auth.uid()`).

Seguridad: RLS en todas las tablas + privilegios por columna. `authenticated` puede leer todo, insertar guías (sin `status`/`created_by`) y actualizar **solo** `status`; `anon` no accede a nada. Así la DB se protege aunque se llame a PostgREST directamente con la anon key pública.

Implicación para la API: debe llamar a Supabase **con el token del usuario** (cliente con anon key + header `Authorization`), no con la service-role key; si no, `auth.uid()` es null y se pierden RLS, `created_by` y `changed_by`.

Seed local: usuario `demo@confirm-deliveries.dev` / `demo1234` con 5 guías en distintos estados.

## API objetivo

Prefijo `/api/v1`, header `Authorization: Bearer <access_token de Supabase>`.

- `GET /guides` — lista (filtros por estado/fecha cuando hagan falta)
- `GET /guides/:id` — detalle + historial
- `POST /guides` — crea una o varias (array, igual que hoy `confirmGuides`)
- `PATCH /guides/:id/status` — cambia estado (genera historial vía trigger)
- `GET /me` — perfil del usuario actual

Se eliminan `/auth/register`, `/auth/login` (el frontend usa `supabase-js` directamente) y `GET /users` (exponía hashes de password). Validación de entrada con Joi (ya instalado; reusar los mensajes de `src/schemas/`). Swagger: una sola config, sin el `src/swagger.js` muerto.

## Comandos

Legacy (hoy):
```bash
npm install
npm run dev     # nodemon src/app.js (Function Framework)
node src/server.js   # Express local en :3000
```
Requiere `.env` con `JWT_SECRET_KEY` y ADC de GCP. **No hay tests todavía.**

Supabase local (requiere Docker; el CLI se usa vía `npx supabase` si no está instalado):
```bash
npx supabase start        # Postgres + Auth + Studio locales
npx supabase db reset     # aplica migrations + seed
npx supabase migration new <nombre>
```

Objetivo (actualizar esta sección al crearlos):
```bash
npm --prefix api run dev | test | lint
npm --prefix web run dev | test | lint | build
```

## Variables de entorno

Nunca commitear `.env`. Mantener `.env.example` en `api/` y `web/`.

- api: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (o la que corresponda para verificar JWT), `PORT`. La service-role key solo en el backend y solo si es imprescindible.
- web: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`. Nada secreto con prefijo `VITE_`.

## Convenciones

- Idioma: código y nombres técnicos en inglés; campos de dominio existentes en español (`guia`, `ciudad_destino`…) se conservan para no romper el contrato. Docs y commits en español.
- Capas de la API: `routes → middlewares → controllers → services`. Los services hablan con Supabase; los controllers no.
- Errores: un middleware de errores central; mapear códigos de Postgres (`23505` unique → 409, `23514` check → 400) en vez de comparar strings de mensaje como hace el legacy.
- Cambios de esquema **solo** mediante nueva migración en `supabase/migrations/` (`supabase migration new <nombre>`). Nunca editar una migración ya aplicada.
- Tests: Vitest (+ Supertest en api). Cada endpoint nuevo con al menos un test de éxito y uno de error.
- Lint: ESLint 9 flat config + Prettier (ya en devDependencies).
- Node 20+ (el `engines: 18.x` actual se actualiza en la migración).
- Mínimo necesario: sin abstracciones especulativas ni dependencias nuevas si una existente o la plataforma lo resuelve.

## Deuda conocida del legacy (no replicar)

- Login y registro comparten el mismo middleware de validación montado en todo `/auth`.
- `GET /users` devuelve el hash de password.
- `authMiddleware` lee el header sin quitar `Bearer `.
- `for (guideData of guides)` sin `const` → global implícita.
- Errores detectados comparando `error.message` con strings.
- Swagger duplicado (`src/swagger.js` sin usar) y `POST /auth/register` documentado dos veces; `console.log` de debug en `swaggerRoutes.js`.
- Unicidad de `username`/`guia` con consulta previa → condición de carrera.

## Límites para agentes

- No hacer push, deploy, ni crear recursos en Supabase cloud / Vercel / Render / GHCR sin confirmación.
- Git: nunca añadir a la IA como autor o coautor (sin trailers `Co-Authored-By` ni firmas "Generated with…").
- No borrar código legacy hasta que exista y funcione su reemplazo.
- Commits pequeños por fase; rama por fase, PR a `main`.
