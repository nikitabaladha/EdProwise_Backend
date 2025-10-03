// import EmployeeInternetAllowance from "../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js";
// import fs from 'fs';
// import path from 'path';

// const deleteInternetAllowance = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const record = await EmployeeInternetAllowance.findById(id);
//     if (!record) {
//       return res.status(404).json({
//         success: false,
//         message: 'Internet allowance record not found'
//       });
//     }

//     // Delete associated file
//     if (record.billFile && fs.existsSync(record.billFile)) {
//       fs.unlinkSync(record.billFile);
//     }

//     await EmployeeInternetAllowance.findByIdAndDelete(id);

//     return res.status(200).json({
//       success: true,
//       message: 'Internet allowance record deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting internet allowance record:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to delete internet allowance record'
//     });
//   }
// };
import mongoose from 'mongoose';
import EmployeeInternetAllowance from "../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js";
import fs from 'fs';
import path from 'path';

const deleteInternetAllowance = async (req, res) => {
  try {
    const { detailId } = req.params;
    const employeeId = req.query.employeeId;
    console.log("detailId", detailId);
    console.log("employeeId", employeeId);

    console.log("req.params:", req.params);
    console.log("req.query:", req.query);
    console.log("req.body:", req.body);


    // Validate parameters
    if (!employeeId || !detailId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and Detail ID are required",
      });
    }

    // Validate detailId is a valid ObjectId
    if (!mongoose.isValidObjectId(detailId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Detail ID format",
      });
    }

    // Find the record containing the detail
    const record = await EmployeeInternetAllowance.findOne({
      employeeId,
      "internetAllowanceDetails._id": detailId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Internet allowance detail not found",
      });
    }

    // Find the detail to get the file path
    const detail = record.internetAllowanceDetails.find(
      (d) => d._id.toString() === detailId
    );

    // Delete the file from the filesystem if it exists
    if (detail.billFile && fs.existsSync(detail.billFile)) {
      try {
        fs.unlinkSync(detail.billFile);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
      }
    }

    // Remove the detail from the array
    record.internetAllowanceDetails = record.internetAllowanceDetails.filter(
      (detail) => detail._id.toString() !== detailId
    );

   
    // If no details remain, delete the entire record
    if (record.internetAllowanceDetails.length === 0) {
      await EmployeeInternetAllowance.deleteOne({ _id: record._id });
      return res.status(200).json({
        success: true,
        message: "Internet allowance record deleted as no details remain",
      });
    }


     record.proofSubmitted = record.internetAllowanceDetails.reduce(
       (sum, detail) => sum + detail.grossAmount,
       0
     );
     
    // Save the updated record
    await record.save();

    return res.status(200).json({
      success: true,
      message: "Internet allowance detail deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting internet allowance detail:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete internet allowance detail",
    });
  }
};

// export default deleteInternetAllowance;
export default deleteInternetAllowance;