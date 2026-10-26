import { STATUSES } from './schemas.js';

const json = (schema) => ({ content: { 'application/json': { schema } } });
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const error = (description) => ({ description, ...json(ref('Error')) });
const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

const guideFields = {
  guia: { type: 'string', minLength: 5, maxLength: 10, example: 'GU10001' },
  ubicacion: { type: 'string', example: 'Calle 10 # 43-12' },
  ciudad_destino: { type: 'string', example: 'Medellín' },
  departamento_destino: { type: 'string', example: 'Antioquia' },
  codigo_postal: { type: 'string', pattern: '^[0-9]{6}$', example: '050021' },
  telefono_contacto: { type: 'string', pattern: '^[0-9]{10}$', example: '3001234567' },
  valor_productos: { type: 'number', exclusiveMinimum: 0, example: 200000 },
  costo_envio: { type: 'number', exclusiveMinimum: 0, example: 8000 },
  id_proveedor: { type: 'string', pattern: '^[0-9]+$', example: '0123' },
  numero_cuenta: { type: 'string', pattern: '^[0-9]+$', example: '24500000123' },
  observaciones: { type: 'string', maxLength: 100 },
  linea_contacto: { type: 'string', maxLength: 50 },
};

export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'Confirm Deliveries API',
    version: '2.0.0',
    description:
      'Confirmación y seguimiento de guías de envío. Autenticación con Supabase Auth: ' +
      'envía el access token de la sesión como `Authorization: Bearer <token>`.',
  },
  servers: [{ url: '/api/v1' }],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Status: { type: 'string', enum: STATUSES },
      GuideInput: {
        type: 'object',
        additionalProperties: false,
        required: Object.keys(guideFields).filter(
          (k) => !['observaciones', 'linea_contacto'].includes(k),
        ),
        properties: guideFields,
      },
      Guide: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          ...guideFields,
          status: ref('Status'),
          created_by: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      HistoryEntry: {
        type: 'object',
        properties: {
          from_status: { oneOf: [ref('Status'), { type: 'null' }] },
          to_status: ref('Status'),
          changed_at: { type: 'string', format: 'date-time' },
          changed_by: { type: 'object', properties: { username: { type: 'string' } } },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  paths: {
    '/me': {
      get: {
        tags: ['Perfil'],
        summary: 'Perfil del usuario autenticado',
        responses: {
          200: {
            description: 'Perfil',
            ...json({
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                username: { type: 'string' },
                email: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
              },
            }),
          },
          401: error('Token ausente o inválido'),
        },
      },
    },
    '/guides': {
      get: {
        tags: ['Guías'],
        summary: 'Lista las guías (más recientes primero)',
        parameters: [{ name: 'status', in: 'query', schema: ref('Status') }],
        responses: {
          200: { description: 'Guías', ...json({ type: 'array', items: ref('Guide') }) },
          400: error('Filtro inválido'),
          401: error('Token ausente o inválido'),
        },
      },
      post: {
        tags: ['Guías'],
        summary: 'Confirma una o varias guías (todas o ninguna)',
        requestBody: {
          required: true,
          ...json({ type: 'array', minItems: 1, maxItems: 100, items: ref('GuideInput') }),
        },
        responses: {
          201: {
            description: 'Guías creadas con estado `confirmada`',
            ...json({ type: 'array', items: ref('Guide') }),
          },
          400: error('Datos inválidos'),
          401: error('Token ausente o inválido'),
          409: error('Alguna guía ya estaba registrada'),
        },
      },
    },
    '/guides/{id}': {
      get: {
        tags: ['Guías'],
        summary: 'Detalle de una guía con su historial de estados',
        parameters: [idParam],
        responses: {
          200: {
            description: 'Guía',
            ...json({
              allOf: [
                ref('Guide'),
                {
                  type: 'object',
                  properties: { history: { type: 'array', items: ref('HistoryEntry') } },
                },
              ],
            }),
          },
          400: error('Identificador inválido'),
          401: error('Token ausente o inválido'),
          404: error('No encontrada'),
        },
      },
    },
    '/guides/{id}/status': {
      patch: {
        tags: ['Guías'],
        summary: 'Cambia el estado de una guía',
        description:
          'Transiciones válidas: `confirmada` → `en_transito` | `cancelada`; `en_transito` → `entregada` | `devuelta`. ' +
          'Cada cambio queda en el historial.',
        parameters: [idParam],
        requestBody: {
          required: true,
          ...json({ type: 'object', required: ['status'], properties: { status: ref('Status') } }),
        },
        responses: {
          200: { description: 'Guía actualizada', ...json(ref('Guide')) },
          400: error('Estado o transición inválida'),
          401: error('Token ausente o inválido'),
          404: error('No encontrada'),
        },
      },
    },
  },
};
