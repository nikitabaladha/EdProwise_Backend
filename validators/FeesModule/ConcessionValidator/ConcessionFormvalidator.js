import Joi from 'joi';
import mongoose from 'mongoose';

const objectId = () =>
  Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'ObjectId validation');

const concessionDetailSchema = Joi.object({
  installmentName: Joi.string().required().messages({
    'string.base': 'Installment name must be a string.',
    'any.required': 'Installment name is required.'
  }),
  feesType: objectId().required().messages({
    'any.invalid': 'Invalid Fee Type ID.',
    'any.required': 'Fee Type is required.'
  }),
  totalFees: Joi.number().min(0).required().messages({
    'number.base': 'Total fees must be a number.',
    'number.min': 'Total fees cannot be negative.',
    'any.required': 'Total fees is required.'
  }),
  concessionPercentage: Joi.number().min(0).max(100).required().messages({
    'number.base': 'Concession percentage must be a number.',
    'number.min': 'Concession percentage cannot be less than 0.',
    'number.max': 'Concession percentage cannot be more than 100.',
    'any.required': 'Concession percentage is required.'
  }),
  concessionAmount: Joi.number().min(0).required().messages({
    'number.base': 'Concession amount must be a number.',
    'number.min': 'Concession amount cannot be negative.',
    'any.required': 'Concession amount is required.'
  }),
  balancePayable: Joi.number().min(0).required().messages({
    'number.base': 'Balance payable must be a number.',
    'number.min': 'Balance payable cannot be negative.',
    'any.required': 'Balance payable is required.'
  }),
});

export const ConcessionFormValidator = Joi.object({
  schoolId: Joi.string().required().messages({
    'any.invalid': 'Invalid School ID.',
    'any.required': 'School ID is required.'
  }),
  academicYear: Joi.string().required(),
  AdmissionNumber: Joi.string().required().messages({
    'string.base': 'Admission number must be a string.',
    'any.required': 'Admission number is required.'
  }),
   studentPhoto: Joi.string().optional().messages({
          "any.required": "Studentphoto is required."
        }),
  firstName: Joi.string().required().messages({
    'string.base': 'First name must be a string.',
    'any.required': 'First name is required.'
  }),
  middleName: Joi.string().allow('', null),
  lastName: Joi.string().required().messages({
    'string.base': 'Last name must be a string.',
    'any.required': 'Last name is required.'
  }),
  masterDefineClass: objectId().required().messages({
    'any.invalid': 'Invalid Class ID.',
    'any.required': 'Class is required.'
  }),
  section: objectId().required().messages({
    'any.invalid': 'Invalid Section ID.',
    'any.required': 'Section is required.'
  }),
  concessionType: Joi.string()
    .valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other')
    .required()
    .messages({
      'any.only': 'Concession type must be one of EWS, SC, ST, OBC, Staff Children, or Other.',
      'any.required': 'Concession type is required.'
    }),
    castOrIncomeCertificate: Joi.string()
    .optional()
    .messages({
      'string.base': 'Cast or income certificate must be a string.'
    }),  
  // applicableAcademicYear: Joi.string().required().messages({
  //   'string.base': 'Academic year must be a string.',
  //   'any.required': 'Applicable academic year is required.'
  // }),
  concessionDetails: Joi.array().items(concessionDetailSchema).min(1).required().messages({
    'array.min': 'At least one concession detail is required.',
    'any.required': 'Concession details are required.'
  }),
});
