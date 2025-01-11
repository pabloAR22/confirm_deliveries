const Joi = require('joi');

const guideSchema = Joi.object({
    guia: Joi.string().required().min(5).max(10).messages({
        "string.empty": "The field 'guia' can't be empty",
        "any.required": "The field 'guia' it is mandatory",
        "string.min": "The field 'guia' must be at least 5 characters",
        "string.max": "The field 'guia' cannot be more than 10 characters",
    }),
    ubicacion: Joi.string().required().messages({
        "string.empty": "The field 'ubicacion' can't be empty",
        "any.required": "The field 'ubicacion' it is mandatory",
    }),
    ciudad_destino: Joi.string().required().messages({
        "string.empty": "The field 'ciudad_destino' can't be empty",
        "any.required": "The field 'ciudad_destino' it is mandatory",
    }),
    departamento_destino: Joi.string().required().messages({
        "string.empty": "The field 'departamento_destino' can't be empty",
        "any.required": "The field 'departamento_destino' it is mandatory",
    }),
    codigo_postal: Joi.string().required().length(6).messages({
        "string.empty": "The field 'codigo_postal' can't be empty",
        "any.required": "The field 'codigo_postal' it is mandatory",
        "string.length": "The field 'codigo_postal' must be 6 characters"
    }),
    telefono_contacto: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
        "string.empty": "The field 'telefono_contacto' can't be empty",
        "any.required": "The field 'telefono_contacto' it is mandatory",
        "string.length": "The field 'telefono_contacto' must be 10 characters",
        "string.pattern.base": "The field 'telefono_contacto' can only contain numbers"
    }),
    valor_productos: Joi.number().min(1).required().messages({
        "number.base": "The field 'valor_productos' must be a number",
        "any.required": "The field 'valor_productos' it is mandatory",
        "number.min": "The field 'valor_productos' must be a number greater than 0"
    }),
    costo_envio: Joi.number().min(1).required().messages({
        "number.base": "The field 'costo_envio' must be a number",
        "any.required": "The field 'costo_envio' it is mandatory",
        "number.min": "The field 'costo_envio' must be a number greater than 0"
    }),
    observaciones: Joi.string().max(100).optional().messages({
        "string.max": "The field 'observaciones' cannot be more than 100 characters",
    }),
    id_proveedor: Joi.number().required().messages({
        "number.base": "The field 'id_proveedor' must be a number",
        "any.required": "The field 'id_proveedor' it is mandatory",
    }),
    numero_cuenta: Joi.number().required().messages({
        "number.base": "The field 'numero_cuenta' must be a number",
        "any.required": "The field 'numero_cuenta' it is mandatory",
    }),
    linea_contacto: Joi.string().max(50).optional().messages({
        "string.max": "The field 'linea_contacto' cannot be more than 50 characters",
    })
});

const requestSchema = Joi.array().items(guideSchema);

module.exports = requestSchema;