const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const studentUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50),

  subject: Joi.string()
    .trim()
    .max(50),

  aadhar: Joi.string()
    .pattern(/^\d{12}$/)
    .messages({
      'string.pattern.base': 'Aadhar must be 12 digits'
    }),

  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .messages({
      'string.pattern.base': 'Phone must be 10-15 digits'
    }),  

}).min(1); // at least one field required

module.exports = { studentUpdateSchema };