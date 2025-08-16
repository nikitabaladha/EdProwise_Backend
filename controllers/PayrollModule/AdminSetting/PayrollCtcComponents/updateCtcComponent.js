// import PayrollCtcComponents from "../../../../models/PayrollModule/AdminSetting/PayrollCtcComponents.js";

// const updateCtcComponent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { ctcComponentName, academicYear, schoolId } = req.body;

//     if (!ctcComponentName || !academicYear || !schoolId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "ctcComponentName, academicYear, and schoolId are required.",
//       });
//     }

//     // Ensure uniqueness on update
//     const duplicate = await PayrollCtcComponents.findOne({
//       _id: { $ne: id },
//       ctcComponentName,
//       academicYear,
//       schoolId,
//     });

//     if (duplicate) {
//       return res.status(409).json({
//         hasError: true,
//         message: "Another Ctc Components with the same name already exists for the selected year and school.",
//       });
//     }

//     const updated = await PayrollCtcComponents.findByIdAndUpdate(
//       id,
//       { ctcComponentName, academicYear, schoolId },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({
//         hasError: true,
//         message: "CTC Component not found.",
//       });
//     }

//     return res.status(200).json({
//       hasError: false,
//       message: "CTC Component updated successfully.",
//       component: updated,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       hasError: true,
//       message: "Error updating ctc component.",
//       error: error.message,
//     });
//   }
// };

// export default updateCtcComponent;

import PayrollCtcComponents from "../../../../models/PayrollModule/AdminSettings/PayrollCtcComponents.js";

const updateCtcComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { ctcComponentName, academicYear, schoolId, isActive } = req.body;

    if (!ctcComponentName || !academicYear || !schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "ctcComponentName, academicYear, and schoolId are required.",
      });
    }

    // Ensure uniqueness on update
    const duplicate = await PayrollCtcComponents.findOne({
      _id: { $ne: id },
      ctcComponentName,
      academicYear,
      schoolId,
    });

    if (duplicate) {
      return res.status(409).json({
        hasError: true,
        message: "Another CTC Component with the same name already exists for the selected year and school.",
      });
    }

    const updated = await PayrollCtcComponents.findByIdAndUpdate(
      id,
      { ctcComponentName, academicYear, schoolId, isActive },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        hasError: true,
        message: "CTC Component not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "CTC Component updated successfully.",
      component: updated,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error updating CTC component.",
      error: error.message,
    });
  }
};

export default updateCtcComponent;