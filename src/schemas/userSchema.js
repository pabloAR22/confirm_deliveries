const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string().required().messages({
        "string.empty": "El campo 'username' no puede estar vacío",
        "any.required": "El campo 'username' es obligatorio",
    }),
    password: Joi.string().required().messages({
        "string.empty": "El campo 'password' no puede estar vacío",
        "any.required": "El campo 'password' es obligatorio",
    }),
});

module.exports = userSchema;