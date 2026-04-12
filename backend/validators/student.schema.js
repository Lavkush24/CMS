const Joi = require('joi');

const studentSchema = Joi.object({
  name: Joi.string().min(2).required(),

  standard: Joi.string().required(),

  aadhar: Joi.string().length(12).required(),

  phone: Joi.string().min(10).max(15).required(),

  batchId: Joi.string().required(),

  feePaid: Joi.number().min(0).required()
});

module.exports = { studentSchema };