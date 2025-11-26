// import PayrollCtcComponents from "../../../../models/PayrollModule/AdminSetting/PayrollCtcComponents.js";
// const deleteCtcComponent = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deleted = await PayrollCtcComponents.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({
//         hasError: true,
//         message: "CTC Component not found.",
//       });
//     }

//     return res.status(200).json({
//       hasError: false,
//       message: "CTC Component deleted successfully.",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       hasError: true,
//       message: "Error deleting CTC Component.",
//       error: error.message,
//     });
//   }
// };

// export default deleteCtcComponent;

import PayrollCtcComponents from "../../../../models/PayrollModule/AdminSettings/PayrollCtcComponents.js";

const deleteCtcComponent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PayrollCtcComponents.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        hasError: true,
        message: "CTC Component not found.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "CTC Component deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error deleting CTC Component.",
      error: error.message,
    });
  }
};

export default deleteCtcComponent;