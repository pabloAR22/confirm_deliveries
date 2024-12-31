const Joi = require('joi');
const userSchema = require('../schemas/userSchema');

const validateDataUsers = (userSchema) => {
    return (req, res, next) => {
        const {error} = userSchema.validate(req.body , { abortEarly: false });
        
        if(error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({errors});
        }

        next();
    }
}

module.exports = validateDataUsers;