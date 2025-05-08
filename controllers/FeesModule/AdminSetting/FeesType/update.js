// import FeesType from "../../../../models/FeesModule/FeesType.js";
// import FeesTypeValidator from "../../../../validators/FeesModule/FeesType.js";

// async function update(req, res) {
//   try {
//     const { error } = FeesTypeValidator.FeesTypeUpdate.validate(req.body);
//     if (error?.details?.length) {
//       const errorMessages = error.details.map((err) => err.message).join(", ");
//       return res.status(400).json({ hasError: true, message: errorMessages });
//     }

//     const schoolId = req.user?.schoolId;
//     if (!schoolId) {
//       return res.status(401).json({
//         hasError: true,
//         message:
//           "Access denied: You do not have permission to update Fees Type.",
//       });
//     }

//     const { id } = req.params;
//     const { feesTypeName } = req.body;

//     const feesType = await FeesType.findOne({ _id: id, schoolId });
//     if (!feesType) {
//       return res.status(404).json({
//         hasError: true,
//         message: "Fees Type not found.",
//       });
//     }

//     const existingFeesType = await FeesType.findOne({
//       feesTypeName,
//       schoolId,
//       _id: { $ne: id },
//     });

//     if (existingFeesType) {
//       return res.status(400).json({
//         hasError: true,
//         message: `Fees Type with name "${feesTypeName}" already exists.`,
//       });
//     }

//     feesType.feesTypeName = feesTypeName || feesType.feesTypeName;

//     await feesType.save();

//     return res.status(200).json({
//       hasError: false,
//       message: "Fees Type updated successfully.",
//       data: feesType,
//     });
//   } catch (error) {
//     console.error("Error updating Fees Type:", error);
//     return res.status(500).json({
//       hasError: true,
//       message: "Failed to update Fees Type.",
//       error: error.message,
//     });
//   }
// }

// export default update;


import FeesType from "../../../../models/FeesModule/FeesType.js";
import FeesTypeValidator from "../../../../validators/FeesModule/FeesType.js";

async function update(req, res) {
  try {
    const { error } = FeesTypeValidator.FeesTypeUpdate.validate(req.body);
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to update Fees Type.",
      });
    }

    const { id } = req.params;
    const { feesTypeName, groupOfFees } = req.body;

    const feesType = await FeesType.findOne({ _id: id, schoolId });
    if (!feesType) {
      return res.status(404).json({
        hasError: true,
        message: "Fees Type not found.",
      });
    }

    const existingFeesType = await FeesType.findOne({
      feesTypeName,
      schoolId,
      _id: { $ne: id },
    });

    if (existingFeesType) {
      return res.status(400).json({
        hasError: true,
        message: `Fees Type with name "${feesTypeName}" already exists.`,
      });
    }


    feesType.feesTypeName = feesTypeName || feesType.feesTypeName;
    feesType.groupOfFees = groupOfFees || feesType.groupOfFees;

    await feesType.save();

    return res.status(200).json({
      hasError: false,
      message: "Fees Type updated successfully.",
      data: feesType,
    });
  } catch (error) {
    console.error("Error updating Fees Type:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to update Fees Type.",
      error: error.message,
    });
  }
}

export default update;




