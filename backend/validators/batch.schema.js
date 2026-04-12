const Joi = require('joi');

const batchSchema = Joi.object({
  email: Joi.string().email().required(),

  name: Joi.string().required(),

  teacherId: Joi.string().required(),

  fees: Joi.number().required(),

  startDate: Joi.string().required(),

  timing: Joi.string().required()
});

module.exports = { batchSchema };