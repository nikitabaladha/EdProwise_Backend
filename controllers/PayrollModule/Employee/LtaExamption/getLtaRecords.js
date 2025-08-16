import EmployeeltaDetails from "../../../../models/PayrollModule/Employee/EmployeeltaDetails.js";

const getLtaRecords = async (req, res) => {
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
    const ltaRecords = await EmployeeltaDetails.find({
      schoolId,
      employeeId,
      academicYear,
    }).lean();

    // Flatten ltaDetails and sort by createdAt
    const responseData = ltaRecords.reduce((acc, record) => {
      const details = record.ltaDetails
        .filter(detail => detail._id)
        .map((detail) => ({
          _id: detail._id.toString(),
          employeeId: record.employeeId,
          employeeName: detail.NameOnBill, // Use NameOnBill as employeeName
          billNumber: detail.billNumber,
          billDate: detail.billDate,
          itemPurchased: detail.itemPurchased,
          vendorName: detail.vendorName,
          gstNumber: detail.gstNumber,
          grossAmount: detail.grossAmount,
          gstCharge: detail.gstCharge,
          totalAmount: detail.totalAmount,
          billFile: detail.billFile,
          billstatus: detail.billstatus,
          
          createdAt: detail.createdAt,
          parentId: record._id.toString(),
        }));
      return [...acc, ...details];
    }, [])

    if (responseData.length === 0) {
      console.warn('No valid LTA details found for the query');
    }

    return res.status(200).json({
      success: true,
      data: responseData,
      message: "LTA details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching LTA details:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch LTA details",
    });
  }
};

export default getLtaRecords;