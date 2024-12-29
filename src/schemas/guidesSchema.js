const Joi = require('joi');

const guideSchema = Joi.object({
    guia: Joi.string().required().min(5).max(10).messages({
        "string.empty": "El campo 'guia' no puede estar vacío",
        "any.required": "El campo 'guia' es obligatorio",
        "string.min": "El campo 'guia' debe tener al menos 5 caracteres",
        "string.max": "El campo 'guia' no puede tener más de 10 caracteres",
    }),
    ubicacion: Joi.string().required().messages({
        "string.empty": "El campo 'ubicacion' no puede estar vacío",
        "any.required": "El campo 'ubicacion' es obligatorio",
    }),
    ciudad_destino: Joi.string().required().messages({
        "string.empty": "El campo 'ciudad_destino' no puede estar vacío",
        "any.required": "El campo 'ciudad_destino' es obligatorio",
    }),
    departamento_destino: Joi.string().required().messages({
        "string.empty": "El campo 'departamento_destino' no puede estar vacío",
        "any.required": "El campo 'departamento_destino' es obligatorio",
    }),
    codigo_postal: Joi.string().required().length(6).messages({
        "string.empty": "El campo 'codigo_postal' no puede estar vacío",
        "any.required": "El campo 'codigo_postal' es obligatorio",
        "string.length": "El campo 'codigo_postal' debe tener 6 caracteres"
    }),
    telefono_contacto: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
        "string.empty": "El campo 'telefono_contacto' no puede estar vacío",
        "any.required": "El campo 'telefono_contacto' es obligatorio",
        "string.length": "El campo 'telefono_contacto' debe tener 10 caracteres",
        "string.pattern.base": "El campo 'telefono_contacto' solo puede contener números"
    }),
    valor_productos: Joi.number().min(1).required().messages({
        "number.base": "El campo 'valor_productos' debe ser un número",
        "any.required": "El campo 'valor_productos' es obligatorio",
        "number.min": "El campo 'valor_productos' debe ser un número mayor que 0"
    }),
    costo_envio: Joi.number().min(1).required().messages({
        "number.base": "El campo 'costo_envio' debe ser un número",
        "any.required": "El campo 'costo_envio' es obligatorio",
        "number.min": "El campo 'costo_envio' debe ser un número mayor que 0"
    }),
    observaciones: Joi.string().max(100).optional().messages({
        "string.max": "El campo 'observaciones' no puede tener más de 100 caracteres",
    }),
    id_proveedor: Joi.number().required().messages({
        "number.base": "El campo 'id_proveedor' debe ser un número",
        "any.required": "El campo 'id_proveedor' es obligatorio",
    }),
    numero_cuenta: Joi.number().required().messages({
        "number.base": "El campo 'numero_cuenta' debe ser un número",
        "any.required": "El campo 'numero_cuenta' es obligatorio",
    }),
    linea_contacto: Joi.string().max(50).optional().messages({
        "string.max": "El campo 'linea_contacto' no puede tener más de 50 caracteres",
    })
});

const requestSchema = Joi.array().items(guideSchema);

module.exports = requestSchema;