// import PayrollCtcComponents from "../../../../models/PayrollModule/AdminSetting/PayrollCtcComponents.js";

// const getCtcComponent = async (req, res) => {
//   try {
//     const { schoolId } = req.params;
//     const { academicYear } = req.query;

//     if (!schoolId) {
//       return res.status(400).json({
//         hasError: true,
//         message: "schoolId is required.",
//       });
//     }

//     const query = { schoolId };
//     if (academicYear) query.academicYear = academicYear;

//     const ctcComponent = await PayrollCtcComponents.find(query).sort({ createdAt: -1 });

//     return res.status(200).json({
//       hasError: false,
//       message: ctcComponent.length ? "CTC Component fetched successfully." : "No ctc Component found.",
//       ctcComponent,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       hasError: true,
//       message: "Error fetching CTC Component.",
//       error: error.message,
//     });
//   }
// };

// export default getCtcComponent;

import PayrollCtcComponents from "../../../../models/PayrollModule/AdminSettings/PayrollCtcComponents.js";

const getCtcComponent = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required.",
      });
    }

    const query = { schoolId };
    if (academicYear) query.academicYear = academicYear;

    const ctcComponent = await PayrollCtcComponents.find(query).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      hasError: false,
      message: ctcComponent.length
        ? "CTC Component fetched successfully."
        : "No CTC Component found.",
      ctcComponent,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error fetching CTC Component.",
      error: error.message,
    });
  }
};

export default getCtcComponent;
