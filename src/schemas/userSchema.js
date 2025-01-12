const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string().required().messages({
        "string.empty": "The field 'username' can't be empty",
        "any.required": "The field 'username' it is mandatory",
    }),
    password: Joi.string().required().messages({
        "string.empty": "The field 'password' can't be empty",
        "any.required": "The field 'password' it is mandatory",
    }),
});

module.exports = userSchema;