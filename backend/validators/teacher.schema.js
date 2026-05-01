const Joi = require('joi');

const teacherSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  subject: Joi.string()
    .trim()
    .max(50)
    .required(),

  sharePercent: Joi.number()
    .min(0)
    .max(100)
    .required(),

  joinDate: Joi.date()
    .required(),

  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone must be 10-15 digits'
    }),

  aadhar: Joi.string()
    .pattern(/^\d{12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Aadhar must be 12 digits'
    }),

  // optional: assign teacher to batches
  batchIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
});

module.exports = { teacherSchema };