const Joi = require('joi');

const studentUpdateSchema = Joi.object({
  name: Joi.string(),
  standard: Joi.string(),
  aadhar: Joi.string().length(12),
  phone: Joi.string(),
  batchId: Joi.string(),
  feePaid: Joi.number()
}).min(1); // at least one field required

module.exports = { studentUpdateSchema };