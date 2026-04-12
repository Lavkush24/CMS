const Joi = require('joi');

const teacherSchema = Joi.object({
  email: Joi.string().email().required(),

  name: Joi.string().required(),

  subject: Joi.string().required(),

  sharePercent: Joi.number().min(0).max(100).required(),

  joinDate: Joi.string().required(),

  phone: Joi.string().required(),

  aadhar: Joi.string().required(),

  batchName: Joi.string().required(),

  fee: Joi.number().required(),

  timing: Joi.string().required()
});

module.exports = { teacherSchema };