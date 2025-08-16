
import OvertimeApplications from "../../../../models/PayrollModule/Employee/OvertimeApplications.js";

const getOvertimeDetails = async (req, res) => {
  try {
    const { schoolId, employeeId, academicYear } = req.params;

    if (!schoolId || !employeeId) {
      return res.status(400).json({
        hasError: true,
        message: "schoolId and employeeId are required",
      });
    }

    const records = await OvertimeApplications.find({
      schoolId,
      employeeId,
      academicYear,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      hasError: false,
      data: records,
    });
  } catch (err) {
    console.error("Error fetching employee overtime applications:", err);
    res.status(500).json({
      hasError: true,
      message: "Internal server error",
    });
  }
};

export default getOvertimeDetails;
