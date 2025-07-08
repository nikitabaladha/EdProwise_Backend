// import Joi from "joi";
// import mongoose from "mongoose";

// const isValidObjectId = (value, helpers, field) =>
//   mongoose.Types.ObjectId.isValid(value)
//     ? value
//     : helpers.message(`Invalid ${field}`);

// const createFeesStructureValidator = Joi.object({
//   academicYear: Joi.string().required(),
//   classId: Joi.string()
//     .custom((value, helpers) => isValidObjectId(value, helpers, "classId"))
//     .required(),

//   sectionIds: Joi.array()
//     .items(Joi.string().custom((value, helpers) => isValidObjectId(value, helpers, "sectionId")))
//     .min(1)
//     .required(),

//   installments: Joi.array()
//     .items(
//       Joi.object({
//         name: Joi.string().required(),
//         dueDate: Joi.date().required(),
//         fees: Joi.array()
//           .items(
//             Joi.object({
//               feesTypeId: Joi.string()
//                 .custom((value, helpers) => isValidObjectId(value, helpers, "feesTypeId"))
//                 .required(),
//               amount: Joi.number().required(),
//             })
//           )
//           .min(1)
//           .required(),
//       })
//     )
//     .min(1)
//     .required()
//     .custom((installments, helpers) => {
//       const today = new Date();
//       for (let i = 0; i < installments.length; i++) {
//         const due = new Date(installments[i].dueDate);
//         if (due < today.setHours(0, 0, 0, 0)) {
//           return helpers.message(`Installment ${i + 1} has a due date in the past.`);
//         }
//         if (i > 0) {
//           const prev = new Date(installments[i - 1].dueDate);
//           if (due <= prev) {
//             return helpers.message(`Installment ${i + 1} due date must be later than installment ${i}.`);
//           }
//         }
//       }
//       return installments;
//     }),
// });

// export default createFeesStructureValidator;

import Joi from "joi";
import mongoose from "mongoose";

const isValidObjectId = (value, helpers, field) =>
  mongoose.Types.ObjectId.isValid(value)
    ? value
    : helpers.message(`Invalid ${field}`);

const createFeesStructureValidator = Joi.object({
  academicYear: Joi.string().required(),
  classId: Joi.string()
    .custom((value, helpers) => isValidObjectId(value, helpers, "classId"))
    .required(),
  sectionIds: Joi.array()
    .items(Joi.string().custom((value, helpers) => isValidObjectId(value, helpers, "sectionId")))
    .min(1)
    .required(),
  installments: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        dueDate: Joi.date().required(),
        fees: Joi.array()
          .items(
            Joi.object({
              feesTypeId: Joi.string()
                .custom((value, helpers) => isValidObjectId(value, helpers, "feesTypeId"))
                .required(),
              amount: Joi.number().required(),
            })
          )
          .min(1)
          .required(),
      })
    )
    .min(1)
    .required()
    .custom((installments, helpers) => {
      for (let i = 0; i < installments.length; i++) {
        if (i > 0) {
          const prev = new Date(installments[i - 1].dueDate);
          const due = new Date(installments[i].dueDate);
          if (due <= prev) {
            return helpers.message(`Installment ${i + 1} due date must be later than installment ${i}.`);
          }
        }
      }
      return installments;
    }),
});

export default createFeesStructureValidator;
