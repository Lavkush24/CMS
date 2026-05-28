const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const studentSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  standard: Joi.string()
    .trim()
    .max(20)
    .required(),

  aadhar: Joi.string()
    .pattern(/^\d{12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Aadhar must be 12 digits'
    }),

  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone must be 10-15 digits'
    }),

  batches: Joi.array().items(
    Joi.object({
      batchId: Joi.string().required(),
      name: Joi.string().required(),
      batchFees: Joi.number().min(0).optional()
    })
  ).min(0).required()
});

module.exports = { studentSchema };