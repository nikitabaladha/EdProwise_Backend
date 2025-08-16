import EmployeeDesignation from "../../../../models/PayrollModule/AdminSettings/EmployeeDesignation.js";

const getJobDesignationBySchoolId = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId is required.",
      });
    }

    const designation = await EmployeeDesignation.find({ schoolId }).sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: designation.length
        ? "Designation fetched successfully."
        : "No Designation found.",
      data: designation,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error fetching designation.",
      error: error.message,
    });
  }
};

export default getJobDesignationBySchoolId;
