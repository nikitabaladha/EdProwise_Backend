// // import Joi from 'joi';

// // export const TCFormValidator = Joi.object({
// //   schoolId: Joi.string().required().messages({
// //     'any.required': 'School ID is required.'
// //   }),
// //   academicYear: Joi.string().required(),
// //   AdmissionNumber: Joi.string().optional().allow(''),
// //   studentPhoto: Joi.string().allow(null).optional().messages({
// //     "any.required": "Student photo is required.",
// //   }),

// //   firstName: Joi.string().required().messages({
// //     'any.required': 'First name is required.'
// //   }),
// //   middleName: Joi.string().allow('').optional(),
// //   lastName: Joi.string().required().messages({
// //     'any.required': 'Last name is required.'
// //   }),
// //   dateOfBirth: Joi.date().required().messages({
// //     'any.required': 'Date of birth is required.'
// //   }),
// //   age: Joi.number().required().messages({
// //     'any.required': 'Age is required.'
// //   }),
// //   nationality: Joi.string().valid('India', 'International', 'SAARC Countries').required().messages({
// //     'any.required': 'Nationality is required.',
// //     'any.only': 'Nationality must be India, International or SAARC Countries.'
// //   }),
// //   fatherName: Joi.string().optional(),
// //   motherName: Joi.string().optional(),
// //   dateOfIssue: Joi.date().required().messages({
// //     'any.required': 'Date of issue is required.'
// //   }),
// //   dateOfAdmission: Joi.date().required().messages({
// //     'any.required': 'Date of admission is required.'
// //   }),
// //   masterDefineClass: Joi.string().required().messages({
// //     'any.required': 'Class is required.'
// //   }),
// //   percentageObtainInLastExam: Joi.string().required().messages({
// //     'any.required': 'Percentage obtained in last exam is required.'
// //   }),
// //   qualifiedPromotionInHigherClass: Joi.string().required().messages({
// //     'any.required': 'Promotion qualification info is required.'
// //   }),
// //   whetherFaildInAnyClass: Joi.string().required().messages({
// //     'any.required': 'Please specify if failed in any class.'
// //   }),
// //   anyOutstandingDues: Joi.string().required().messages({
// //     'any.required': 'Outstanding dues info is required.'
// //   }),
// //   moralBehaviour: Joi.string().required().messages({
// //     'any.required': 'Moral behavior info is required.'
// //   }),
// //   dateOfLastAttendanceAtSchool: Joi.date().required().messages({
// //     'any.required': 'Date of last attendance is required.'
// //   }),
// //   reasonForLeaving: Joi.string().allow('').optional(),
// // anyRemarks: Joi.string().allow('').optional(),
// //   agreementChecked: Joi.boolean().required().messages({
// //     'any.required': 'Agreement confirmation is required.'
// //   }),
// //   TCfees: Joi.number().required().messages({
// //     "number.base": "TC fees must be a valid number.",
// //     "any.required": "TC fees is required."
// //   }),
// //   concessionAmount: Joi.number().messages({
// //     "number.base": "Concession amount must be a valid number."
// //   }),
// //   finalAmount: Joi.number().required().messages({
// //     "number.base": "Final amount must be a valid number.",
// //     "any.required": "Final amount is required."
// //   }),
// //   name: Joi.string().required().messages({
// //     'any.required': 'Name is required.'
// //   }),
// //   paymentMode: Joi.string().valid("Cash", "Cheque", "Online").required().messages({
// //     "any.only": "Payment mode must be one of 'Cash', 'Cheque', or 'Online'.",
// //     "any.required": "Payment mode is required."
// //   }),
// //   chequeNumber: Joi.when('paymentMode', {
// //     is: 'Cheque',
// //     then: Joi.string().required().pattern(/^[0-9]{6,}$/).messages({
// //       "string.pattern.base": "Cheque number must be at least 6 digits",
// //       "any.required": "Cheque number is required for cheque payments"
// //     }),
// //     otherwise: Joi.string().allow(null, "").optional()
// //   }),
// //   bankName: Joi.when('paymentMode', {
// //     is: 'Cheque',
// //     then: Joi.string().required().min(3).messages({
// //       "string.min": "Bank name must be at least 3 characters",
// //       "any.required": "Bank name is required for cheque payments"
// //     }),
// //     otherwise: Joi.string().allow(null, "").optional()
// //   }),
// //   transactionNumber: Joi.string().optional(),
// //   receiptNumber: Joi.string().optional(),
// //   certificateNumber: Joi.string().optional(),
// //   status: Joi.string().valid('Pending', 'Approved', 'Rejected').optional(),
// //   ApplicationReceivedOn: Joi.date().optional()
// // });


// import Joi from 'joi';

// export const TCFormValidator = Joi.object({
//   schoolId: Joi.string().required().messages({
//     'any.required': 'School ID is required.',
//     'string.base': 'School ID must be a string.',
//   }),
//   academicYear: Joi.string().required().messages({
//     'any.required': 'Academic year is required.',
//     'string.base': 'Academic year must be a string.',
//   }),
//   AdmissionNumber: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Admission number must be a string.',
//   }),
//   studentPhoto: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Student photo must be a string.',
//   }),
//   firstName: Joi.string().required().messages({
//     'any.required': 'First name is required.',
//     'string.base': 'First name must be a string.',
//   }),
//   middleName: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Middle name must be a string.',
//   }),
//   lastName: Joi.string().required().messages({
//     'any.required': 'Last name is required.',
//     'string.base': 'Last name must be a string.',
//   }),
//   dateOfBirth: Joi.date().allow(null).optional().messages({
//     'date.base': 'Date of birth must be a valid date.',
//   }),
//   age: Joi.number().allow(null).optional().messages({
//     'number.base': 'Age must be a number.',
//   }),
//   nationality: Joi.string()
//     .valid('India', 'International', 'SAARC Countries')
//     .allow(null)
//     .optional()
//     .messages({
//       'any.only': 'Nationality must be one of India, International, or SAARC Countries.',
//     }),
//   fatherName: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Father name must be a string.',
//   }),
//   motherName: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Mother name must be a string.',
//   }),
//   dateOfIssue: Joi.date().allow(null).optional().messages({
//     'date.base': 'Date of issue must be a valid date.',
//   }),
//   dateOfAdmission: Joi.date().allow(null).optional().messages({
//     'date.base': 'Date of admission must be a valid date.',
//   }),
//   masterDefineClass: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null).optional().messages({
//     'string.base': 'Class must be a string.',
//     'string.pattern.base': 'Class must be a valid ObjectId.',
//   }),
//   percentageObtainInLastExam: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Percentage obtained in last exam must be a string.',
//   }),
//   qualifiedPromotionInHigherClass: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Promotion qualification info must be a string.',
//   }),
//   whetherFaildInAnyClass: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Failed in any class info must be a string.',
//   }),
//   anyOutstandingDues: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Outstanding dues info must be a string.',
//   }),
//   moralBehaviour: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Moral behavior info must be a string.',
//   }),
//   dateOfLastAttendanceAtSchool: Joi.date().allow(null).optional().messages({
//     'date.base': 'Date of last attendance must be a valid date.',
//   }),
//   reasonForLeaving: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Reason for leaving must be a string.',
//   }),
//   anyRemarks: Joi.string().allow('', null).optional().messages({
//     'string.base': 'Remarks must be a string.',
//   }),
//   agreementChecked: Joi.boolean().required().messages({
//     'any.required': 'Agreement confirmation is required.',
//     'boolean.base': 'Agreement checked must be a boolean.',
//   }),
//   TCfees: Joi.number().required().messages({
//     'any.required': 'TC fees is required.',
//     'number.base': 'TC fees must be a valid number.',
//   }),
//      concessionType: Joi.when('concessionAmount', {
//           is: Joi.number().greater(0),
//            then: Joi.string().valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other').required().messages({
//              "string.base": "Concession type must be a string.",
//              "any.only": "Concession type must be one of 'EWS', 'SC', 'ST', 'OBC', 'Staff Children', or 'Other'.",
//              "any.required": "Concession type is required when concession amount is greater than zero."
//            }),
//            otherwise: Joi.string().valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other').allow(null, "").optional()
//          }),
//   concessionAmount: Joi.number().allow(null).default(0).messages({
//     'number.base': 'Concession amount must be a valid number.',
//   }),
//   finalAmount: Joi.number().required().messages({
//     'any.required': 'Final amount is required.',
//     'number.base': 'Final amount must be a valid number.',
//   }),
//   name: Joi.string().required().messages({
//     'any.required': 'Name is required.',
//     'string.base': 'Name must be a string.',
//   }),
//   paymentMode: Joi.string()
//     .valid('Cash', 'Cheque', 'Online','null')
//     .required()
//     .messages({
//       'any.required': 'Payment mode is required.',
//       'any.only': 'Payment mode must be one of Cash, Cheque, or Online.',
//     }),
//   paymentDate: Joi.date().allow(null).optional().messages({
//     'date.base': 'Payment date must be a valid date.',
//   }),
//   chequeNumber: Joi.when('paymentMode', {
//     is: 'Cheque',
//     then: Joi.string()
//       .required()
//       .pattern(/^[0-9]{6,12}$/)
//       .messages({
//         'any.required': 'Cheque number is required for cheque payments.',
//         'string.pattern.base': 'Cheque number must be 6 to 12 digits.',
//       }),
//     otherwise: Joi.string().allow('', null).optional(),
//   }),
//   bankName: Joi.when('paymentMode', {
//     is: 'Cheque',
//     then: Joi.string()
//       .required()
//       .min(3)
//       .messages({
//         'any.required': 'Bank name is required for cheque payments.',
//         'string.min': 'Bank name must be at least 3 characters.',
//       }),
//     otherwise: Joi.string().allow('', null).optional(),
//   }),
//   transactionNumber: Joi.string()
//     .pattern(/^TRA[0-9]{5}$/)
//     .allow('', null)
//     .optional()
//     .messages({
//       'string.pattern.base': 'Transaction number must start with TRA followed by 5 digits.',
//     }),
//   receiptNumber: Joi.string()
//     .pattern(/^REC\/TC\/[0-9]{6}$/)
//     .allow('', null)
//     .optional()
//     .messages({
//       'string.pattern.base': 'Receipt number must follow the format REC/TC/ followed by 6 digits.',
//     }),
//   certificateNumber: Joi.string()
//     .pattern(/^TC[0-9]{5}$/)
//     .allow('', null)
//     .optional()
//     .messages({
//       'string.pattern.base': 'Certificate number must start with TC followed by 5 digits.',
//     }),
//   status: Joi.string()
//     .valid('Pending', 'Approved', 'Rejected')
//     .default('Pending')
//     .optional()
//     .messages({
//       'any.only': 'Status must be one of Pending, Approved, or Rejected.',
//     }),
//   ApplicationReceivedOn: Joi.date().allow(null).optional().messages({
//     'date.base': 'Application received date must be a valid date.',
//   }),
// });


import Joi from 'joi';

export const TCFormValidator = Joi.object({
  // TCForm fields
  schoolId: Joi.string().required().messages({
    'any.required': 'School ID is required.',
    'string.base': 'School ID must be a string.',
  }),
  academicYear: Joi.string().required().messages({
    'any.required': 'Academic year is required.',
    'string.base': 'Academic year must be a string.',
  }),
  AdmissionNumber: Joi.string().allow('', null).optional().messages({
    'string.base': 'Admission number must be a string.',
  }),
  studentPhoto: Joi.string().allow('', null).optional().messages({
    'string.base': 'Student photo must be a string.',
  }),
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required.',
    'string.base': 'First name must be a string.',
    'string.empty': 'First name cannot be empty.',
  }),
  middleName: Joi.string().allow('', null).optional().messages({
    'string.base': 'Middle name must be a string.',
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required.',
    'string.base': 'Last name must be a string.',
    'string.empty': 'Last name cannot be empty.',
  }),
  dateOfBirth: Joi.date().allow(null).optional().messages({
    'date.base': 'Date of birth must be a valid date.',
  }),
  age: Joi.number().integer().min(0).allow(null).optional().messages({
    'number.base': 'Age must be a number.',
    'number.min': 'Age cannot be negative.',
  }),
  nationality: Joi.string()
    .valid('India', 'International', 'SAARC Countries')
    .allow(null)
    .optional()
    .messages({
      'string.base': 'Nationality must be a string.',
      'any.only': "Nationality must be one of 'India', 'International', or 'SAARC Countries'.",
    }),
  fatherName: Joi.string().allow('', null).optional().messages({
    'string.base': "Father's name must be a string.",
  }),
  motherName: Joi.string().allow('', null).optional().messages({
    'string.base': "Mother's name must be a string.",
  }),
  dateOfIssue: Joi.date().allow(null).optional().messages({
    'date.base': 'Date of issue must be a valid date.',
  }),
  dateOfAdmission: Joi.date().allow(null).optional().messages({
    'date.base': 'Date of admission must be a valid date.',
  }),
  masterDefineClass: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null).optional().messages({
    'string.base': 'Class must be a string.',
    'string.pattern.base': 'Class must be a valid ObjectId.',
  }),
  percentageObtainInLastExam: Joi.string().allow('', null).optional().messages({
    'string.base': 'Percentage obtained in last exam must be a string.',
  }),
  qualifiedPromotionInHigherClass: Joi.string().allow('', null).optional().messages({
    'string.base': 'Promotion qualification info must be a string.',
  }),
  whetherFaildInAnyClass: Joi.string().allow('', null).optional().messages({
    'string.base': 'Failed in any class info must be a string.',
  }),
  anyOutstandingDues: Joi.string().allow('', null).optional().messages({
    'string.base': 'Outstanding dues info must be a string.',
  }),
  moralBehaviour: Joi.string().allow('', null).optional().messages({
    'string.base': 'Moral behavior info must be a string.',
  }),
  dateOfLastAttendanceAtSchool: Joi.date().allow(null).optional().messages({
    'date.base': 'Date of last attendance must be a valid date.',
  }),
  reasonForLeaving: Joi.string().allow('', null).optional().messages({
    'string.base': 'Reason for leaving must be a string.',
  }),
  anyRemarks: Joi.string().allow('', null).optional().messages({
    'string.base': 'Remarks must be a string.',
  }),
  agreementChecked: Joi.boolean().valid(true).required().messages({
    'any.required': 'Agreement confirmation is required.',
    'boolean.base': 'Agreement checked must be a boolean.',
    'any.only': 'Agreement must be checked.',
  }),
  certificateNumber: Joi.string()
    .pattern(/^TC[0-9]{5}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.base': 'Certificate number must be a string.',
      'string.pattern.base': 'Certificate number must start with TC followed by 5 digits.',
    }),
  status: Joi.string()
    .valid('Pending', 'Paid')
    .optional()
    .messages({
      'string.base': 'Status must be a string.',
      'any.only': "Status must be 'Pending' or 'Paid'.",
    }),
  applicationDate: Joi.date().allow(null).optional().messages({
    'date.base': 'Application date must be a valid date.',
  }),

  // Payment fields (optional)
  TCfees: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'TC fees must be a valid number.',
    'number.min': 'TC fees cannot be negative.',
  }),
  concessionType: Joi.when('concessionAmount', {
    is: Joi.number().greater(0),
    then: Joi.string()
      .valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other')
      .allow(null, '')
      .optional()
      .messages({
        'string.base': 'Concession type must be a string.',
        'any.only': "Concession type must be one of 'EWS', 'SC', 'ST', 'OBC', 'Staff Children', or 'Other'.",
      }),
    otherwise: Joi.string()
      .valid('EWS', 'SC', 'ST', 'OBC', 'Staff Children', 'Other')
      .allow(null, '')
      .optional()
      .messages({
        'string.base': 'Concession type must be a string.',
        'any.only': "Concession type must be one of 'EWS', 'SC', 'ST', 'OBC', 'Staff Children', or 'Other'.",
      }),
  }),
  concessionAmount: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Concession amount must be a valid number.',
    'number.min': 'Concession amount cannot be negative.',
  }),
  finalAmount: Joi.number().min(0).allow(null).optional().messages({
    'number.base': 'Final amount must be a valid number.',
    'number.min': 'Final amount cannot be negative.',
  }),
  name: Joi.string().allow(null, '').optional().messages({
    'string.base': 'Name must be a string.',
  }),
  paymentMode: Joi.string()
    .valid('Cash', 'Cheque', 'Online', 'null')
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'Payment mode must be a string.',
      'any.only': "Payment mode must be one of 'Cash', 'Cheque', 'Online', or 'null'.",
    }),
  chequeNumber: Joi.when('paymentMode', {
    is: 'Cheque',
    then: Joi.string()
      .required()
      .pattern(/^[0-9]{6,}$/)
      .messages({
        'string.base': 'Cheque number must be a string.',
        'string.pattern.base': 'Cheque number must be at least 6 digits.',
        'any.required': 'Cheque number is required for cheque payments.',
      }),
    otherwise: Joi.string().allow(null, '').optional(),
  }),
  bankName: Joi.when('paymentMode', {
    is: 'Cheque',
    then: Joi.string()
      .required()
      .min(3)
      .messages({
        'string.base': 'Bank name must be a string.',
        'string.min': 'Bank name must be at least 3 characters.',
        'any.required': 'Bank name is required for cheque payments.',
      }),
    otherwise: Joi.string().allow(null, '').optional(),
  }),
  transactionNumber: Joi.string()
    .pattern(/^TRA[0-9]{5}$/)
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'Transaction number must be a string.',
      'string.pattern.base': 'Transaction number must start with TRA followed by 5 digits.',
    }),
  receiptNumber: Joi.string()
    .pattern(/^REC\/TC\/[0-9]{6}$/)
    .allow(null, '')
    .optional()
    .messages({
      'string.base': 'Receipt number must be a string.',
      'string.pattern.base': 'Receipt number must follow the format REC/TC/ followed by 6 digits.',
    }),
});