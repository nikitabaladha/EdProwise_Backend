

import Joi from 'joi';

const createOneTimeFeesValidator = Joi.object({
  academicYear: Joi.string().required(),
  classId: Joi.string().required(),
  sectionIds: Joi.array().items(Joi.string()).required(),
  oneTimeFees: Joi.array()
    .items(
      Joi.object({
        feesTypeId: Joi.string().required(),
        amount: Joi.number().required().min(0),
      })
    )
    .required(),
});

export default createOneTimeFeesValidator;
