import EmployeeTelephoneAllowance from "../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js"
// Controller to fetch telephone allowance records
const getTelephoneAllowances = async (req, res) => {
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
    const telephoneAllowances = await EmployeeTelephoneAllowance.find({
      schoolId,
      employeeId,
      academicYear,
    }).lean();

    // Flatten telephoneAllowanceDetails for frontend compatibility
    const responseData = telephoneAllowances.reduce((acc, record) => {
      const details = record.telephoneAllowanceDetails.map((detail) => ({
        _id: detail._id,
        employeeId: record.employeeId,
        employeeName: record.employeeName || "Unknown", // Adjust based on your schema
        billNumber: detail.billNumber,
        billDate: detail.billDate,
        supplierName: detail.supplierName,
        gstNumber: detail.gstNumber,
        grossAmount: detail.grossAmount,
        billFile: detail.billFile,
        billStatus: detail.billStatus, 
        parentId: record._id, // Include parent ID for deletion
      }));
      return [...acc, ...details];
    }, []);

    return res.status(200).json({
      success: true,
      data: responseData,
      message: "Telephone allowance details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching telephone allowance details:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch telephone allowance details",
    });
  }
};

export default getTelephoneAllowances;