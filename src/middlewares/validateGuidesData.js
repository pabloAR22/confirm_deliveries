const Joi = require('joi');
const guideSchema = require('../schemas/guidesSchema');

const validateJsonGuides = (guideSchema) => {
    return (req, res, next) => {
        const {error} = guideSchema.validate(req.body , { abortEarly: false });
        
        if(error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({errors});
        }

        next();
    }
}

module.exports = validateJsonGuides;