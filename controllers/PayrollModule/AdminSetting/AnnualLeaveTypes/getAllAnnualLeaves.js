import SchoolAnnualLeaveTypes from "../../../../models/PayrollModule/AdminSettings/SchoolAnnualLeaveTypes.js";

const getAllAnnualLeaves = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: "School ID and academic year are required.",
      });
    }

    const leaves = await SchoolAnnualLeaveTypes.find({
      schoolId,
      academicYear,
    });

    return res.status(200).json({
      hasError: false,
      data: { ctcComponent: leaves },
    });
  } catch (error) {
    console.error("Fetch Annual Leaves Error:", error);
    return res.status(500).json({
      hasError: true,
      message: "Server error while fetching leave types.",
    });
  }
};

export default getAllAnnualLeaves;
