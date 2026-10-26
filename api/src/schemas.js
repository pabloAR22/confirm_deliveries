import Joi from 'joi';

// Mismas reglas que los check constraints de la DB: Joi da mensajes claros,
// la DB es la garantía final.

export const STATUSES = ['confirmada', 'en_transito', 'entregada', 'devuelta', 'cancelada'];

const digits = (label) =>
  Joi.string()
    .pattern(/^[0-9]+$/)
    .label(label);

const guide = Joi.object({
  guia: Joi.string().trim().min(5).max(10).required(),
  ubicacion: Joi.string().trim().required(),
  ciudad_destino: Joi.string().trim().required(),
  departamento_destino: Joi.string().trim().required(),
  codigo_postal: digits('codigo_postal').length(6).required(),
  telefono_contacto: digits('telefono_contacto').length(10).required(),
  valor_productos: Joi.number().positive().precision(2).required(),
  costo_envio: Joi.number().positive().precision(2).required(),
  id_proveedor: digits('id_proveedor').required(),
  numero_cuenta: digits('numero_cuenta').required(),
  observaciones: Joi.string().trim().max(100).allow(''),
  linea_contacto: Joi.string().trim().max(50).allow(''),
});

export const createGuides = Joi.array().items(guide).min(1).max(100);

export const updateStatus = Joi.object({
  status: Joi.string()
    .valid(...STATUSES)
    .required(),
});

export const listQuery = Joi.object({
  status: Joi.string().valid(...STATUSES),
});
