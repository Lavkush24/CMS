const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const batchSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  fees: Joi.number()
    .min(0)
    .required(),
  
  standard: Joi.string()
    .trim()
    .max(20)
    .required(),
  
  subject: Joi.string()
    .trim()
    .max(50)
    .required(),

  startDate: Joi.date()
    .required(),

  timing: Joi.string()
    .trim()
    .max(50)
    .required(),

  // optional: assign teachers during creation
  teacherIds: Joi.array()
    .items(Joi.string().pattern(objectIdRegex))
    .optional()
});

module.exports = { batchSchema };