import { authClient, clientFor } from './supabase.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function authenticate(req, res, next) {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Token no enviado');

  // getClaims lanza (en vez de devolver error) si el token ni siquiera es un JWT bien formado.
  const { data, error } = await authClient.auth.getClaims(token).catch((e) => ({ error: e }));
  if (error || !data) throw new HttpError(401, 'Token inválido o expirado');

  req.user = data.claims;
  req.db = clientFor(token);
  next();
}

const messages = {
  'any.required': '{#label} es obligatorio',
  'any.only': '{#label} debe ser uno de: {#valids}',
  'string.base': '{#label} debe ser texto',
  'string.empty': '{#label} no puede estar vacío',
  'string.min': '{#label} debe tener al menos {#limit} caracteres',
  'string.max': '{#label} no puede tener más de {#limit} caracteres',
  'string.length': '{#label} debe tener {#limit} caracteres',
  'string.pattern.base': '{#label} tiene un formato inválido',
  'number.base': '{#label} debe ser un número',
  'number.positive': '{#label} debe ser mayor que 0',
  'array.base': 'El body debe ser un array de guías',
  'array.min': 'Envía al menos {#limit} guía',
  'array.max': 'No se pueden enviar más de {#limit} guías a la vez',
  'object.unknown': '{#label} no está permitido',
};

// source: 'body' | 'query'. Reemplaza req[source] con el valor ya convertido por Joi.
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      messages,
      errors: { wrap: { label: "'" } },
    });
    if (error) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.details.map((d) => d.message),
      });
    }
    // req.query es un getter en Express 5: no se puede reasignar.
    if (source === 'query') Object.defineProperty(req, 'query', { value });
    else req[source] = value;
    next();
  };

const PG_STATUS = {
  23505: [409, 'La guía ya está registrada'], // unique_violation
  23514: [400, null], // check_violation (incluye transiciones de estado inválidas)
  '22P02': [400, 'Identificador inválido'], // invalid_text_representation (uuid mal formado)
  42501: [403, 'No tienes permiso para esta operación'],
  PGRST116: [404, 'No encontrado'], // .single() sin filas
};

// eslint-disable-next-line no-unused-vars -- Express identifica el error handler por sus 4 parámetros
export function errorHandler(err, req, res, next) {
  const [status, message] = PG_STATUS[err.code] ?? [err.status ?? 500];
  if (status === 500) console.error(err);
  res.status(status).json({
    message: message ?? (status === 500 ? 'Error interno del servidor' : err.message),
  });
}
