const Joi = require('joi');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const batchUpdateSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  batchFees: Joi.number()
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

  timing: Joi.string()
    .trim()
    .max(50)
    .required(),

});

module.exports = { batchUpdateSchema };