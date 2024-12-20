import Joi from "joi";

const SubscriptionCreateValidator = Joi.object({
    schoolId: Joi.string().required().messages({
        "string.base": "School name must be a string.",
        "string.empty": "School name cannot be empty.",
        "any.required": "School name is required.",
      }),
      
  subscriptionFor: Joi.string()
    .valid(
      "Fees","Payroll","Finance","School Management",
    )
    .required()
    .messages({
      "string.base": "subscription Upto must be a string.",
      "any.only":
        "subscription  must be one of 'Fees','Payroll','Finance','School Management' ",
      "any.required": "subscriptionFor  is required.",
    }),

    subscriptionStartDate: Joi.date().required().messages({
        "date.base": "subscription Start Date must be a valid date.",
        "any.required": "subscription Start Date  is required.",
      }),

      subscriptionNoOfMonth: Joi.number().integer().required().messages({
        "number.base": "Subscription No Of Month must be a number.",
        "number.integer": "Subscription No Of Month must be an integer.",
        "any.required": "Subscription No Of Month is required.",
      }),
    
      monthlyRate: Joi.number().min(0).required().messages({
        "number.base": "Monthly Rate must be a number.",
        "number.min": "Monthly Rate cannot be negative.",
        "any.required": "Monthly Rate is required.",
      }),
});

const SubscriptionUpdateValidator = Joi.object({
    schoolId: Joi.string().required().messages({
        "string.base": "School name must be a string.",
        "string.empty": "School name cannot be empty.",
        "any.required": "School name is required.",
      }),
    
    subscriptionFor: Joi.string()
    .valid(
      "Fees","Payroll","Finance","School Management",
    )
    .required()
    .messages({
      "string.base": "subscription Upto must be a string.",
      "any.only":
        "subscription  must be one of 'Fees','Payroll','Finance','School Management' ",
      "any.required": "subscriptionFor  is required.",
    }),

    subscriptionStartDate: Joi.date().required().messages({
        "date.base": "subscription Start Date must be a valid date.",
        "any.required": "subscription Start Date  is required.",
      }),

      subscriptionNoOfMonth: Joi.number().integer().required().messages({
        "number.base": "Subscription No Of Month must be a number.",
        "number.integer": "Subscription No Of Month must be an integer.",
        "any.required": "Subscription No Of Month is required.",
      }),
    
      monthlyRate: Joi.number().min(0).required().messages({
        "number.base": "Monthly Rate must be a number.",
        "number.min": "Monthly Rate cannot be negative.",
        "any.required": "Monthly Rate is required.",
      }),
});

export default {
    SubscriptionCreateValidator,
    SubscriptionUpdateValidator,
};