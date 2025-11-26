import Joi from "joi";
import mongoose from "mongoose";

export const BoardExamFeesValidator = Joi.object({
  academicYear: Joi.string().required().label("Academic Year"),
  classId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid classId.");
      }
      return value;
    })
    .required()
    .label("Class ID"),

  sectionIds: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message("Invalid sectionId.");
        }
        return value;
      })
    )
    .min(1)
    .required()
    .label("Section IDs"),

  amount: Joi.number().min(0).required().label("Amount"),
});