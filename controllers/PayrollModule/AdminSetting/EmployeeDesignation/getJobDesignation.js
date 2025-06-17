import EmployeeDesignation from "../../../../models/PayrollModule/AdminSetting/EmployeeDesignation.js";

const getJobDesignation = async (req, res) => {
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

    const designation = await EmployeeDesignation.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      hasError: false,
      message: designation.length ? "Designation fetched successfully." : "No Designation found.",
      designation,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error fetching designation.",
      error: error.message,
    });
  }
};

export default getJobDesignation;