import EmployeeInternetAllowance from "../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js";

const getInternetAllowances = async (req, res) => {
  try {
    const { schoolId, employeeId } = req.params;
    const { academicYear } = req.query;

    console.log("schoolId, employeeId, academicYear", schoolId, employeeId, academicYear);

    // Validate required parameters
    if (!schoolId || !employeeId || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "School ID, Employee ID, and Academic Year are required",
      });
    }

    // Fetch records
    const internetAllowances = await EmployeeInternetAllowance.find({
      schoolId,
      employeeId,
      academicYear,
    }).lean();

    // Flatten internetAllowanceDetails and sort by createdAt
    const responseData = internetAllowances.reduce((acc, record) => {
      const details = record.internetAllowanceDetails
        .filter(detail => detail._id) // Ensure _id exists
        .map((detail) => ({
          _id: detail._id.toString(),
          employeeId: record.employeeId,
          employeeName: record.employeeName || "Unknown", // Fallback if not provided
          billNumber: detail.billNumber,
          billDate: detail.billDate,
          supplierName: detail.supplierName,
          gstNumber: detail.gstNumber,
          grossAmount: detail.grossAmount,
          billFile: detail.billFile,
          billStatus: detail.billStatus,
          createdAt: detail.createdAt,
          parentId: record._id.toString(),
        }));
      return [...acc, ...details];
    }, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (responseData.length === 0) {
      console.warn('No valid internet allowance details found for the query');
    }

    return res.status(200).json({
      success: true,
      data: responseData,
      message: "Internet allowance details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching internet allowance details:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch internet allowance details",
    });
  }
};

export default getInternetAllowances;