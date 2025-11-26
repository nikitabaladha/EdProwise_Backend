import PayrollCtcComponents from "../../../../models/PayrollModule/AdminSettings/PayrollCtcComponents.js";

const getCtcComponentBySchoolId = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required.",
      });
    }

    const ctcComponents = await PayrollCtcComponents.find({ schoolId }).sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: ctcComponents.length ? "CTC Components fetched successfully." : "No CTC Components found.",
      data: ctcComponents,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error fetching ctc components.",
      error: error.message,
    });
  }
};

export default getCtcComponentBySchoolId;
