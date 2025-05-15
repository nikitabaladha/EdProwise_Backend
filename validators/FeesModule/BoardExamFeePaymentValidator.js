import Joi from 'joi';

export const BoardExamFeePaymentValidator = Joi.object({
  payments: Joi.array().items(
    Joi.object({
      studentId: Joi.string().required().messages({
        'string.empty': 'Student ID is required',
        'any.required': 'Student ID is required',
      }),
      admissionNumber: Joi.string().required().messages({
        'string.empty': 'Admission number is required',
        'any.required': 'Admission number is required',
      }),
      studentName: Joi.string().required().messages({
        'string.empty': 'Student name is required',
        'any.required': 'Student name is required',
      }),
      classId: Joi.string().required().messages({
        'string.empty': 'Class ID is required',
        'any.required': 'Class ID is required',
      }),
      sectionId: Joi.string().required().messages({
        'string.empty': 'Section ID is required',
        'any.required': 'Section ID is required',
      }),
      className: Joi.string().required().messages({
        'string.empty': 'Class name is required',
        'any.required': 'Class name is required',
      }),
      sectionName: Joi.string().required().messages({
        'string.empty': 'Section name is required',
        'any.required': 'Section name is required',
      }),
      amount: Joi.number().min(0).required().messages({
        'number.base': 'Amount must be a number',
        'number.min': 'Amount cannot be negative',
        'any.required': 'Amount is required',
      }),
      paymentMode: Joi.string().valid('Cash', 'Cheque', 'Online').required().messages({
        'any.only': 'Payment mode must be Cash, Cheque, or Online',
        'any.required': 'Payment mode is required',
      }),
      chequeNumber: Joi.string().when('paymentMode', {
        is: 'Cheque',
        then: Joi.string()
          .pattern(/^\d{6}$/)
          .required()
          .messages({
            'string.empty': 'Cheque number is required for cheque payments',
            'any.required': 'Cheque number is required for cheque payments',
            'string.pattern.base': 'Cheque number must be exactly 6 digits',
          }),
        otherwise: Joi.string().allow('').optional(),
      }),
      bankName: Joi.string().when('paymentMode', {
        is: 'Cheque',
        then: Joi.string().required().messages({
          'string.empty': 'Bank name is required for cheque payments',
          'any.required': 'Bank name is required for cheque payments',
        }),
        otherwise: Joi.string().allow('').optional(),
      }),
      status: Joi.string().valid('Pending', 'Paid').required().messages({
        'any.only': 'Status must be Pending or Paid',
        'any.required': 'Status is required',
      }),
      academicYear: Joi.string().required().messages({
        'string.empty': 'Academic year is required',
        'any.required': 'Academic year is required',
      }),
      schoolId: Joi.string().required().messages({
        'string.empty': 'School ID is required',
        'any.required': 'School ID is required',
      }),
    })
  ).min(1).required().messages({
    'array.min': 'At least one payment is required',
    'any.required': 'Payments array is required',
  }),
});
