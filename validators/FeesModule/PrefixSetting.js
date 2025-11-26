import Joi from 'joi';

export const validatePrefixSetting = (data) => {
  return Joi.object({
    type: Joi.string().valid('numeric', 'alphanumeric').required(),

    value: Joi.when('type', {
      is: 'numeric',
      then: Joi.string().required().label('Numeric value'),
      otherwise: Joi.forbidden()
    }),

    prefix: Joi.when('type', {
      is: 'alphanumeric',
      then: Joi.string().required().label('Prefix'),
      otherwise: Joi.forbidden()
    }),

    number: Joi.when('type', {
      is: 'alphanumeric',
      then: Joi.number().required().label('Number'),
      otherwise: Joi.forbidden()
    }),

    academicYear: Joi.string().required().label('Academic Year'),
  }).validate(data);
};

export default validatePrefixSetting;
