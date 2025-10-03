// import EmployeeTelephoneAllowance from "../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js"
// import fs from 'fs';
// import path from 'path';

// const deleteTelephoneAllowance = async (req, res) => {
//   try {
//     const { employeeId, detailId } = req.params;

//     // Validate parameters
//     if (!employeeId || !detailId) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID and Detail ID are required",
//       });
//     }

//     // Find the record containing the detail
//     const record = await EmployeeTelephoneAllowance.findOne({
//       employeeId,
//       "telephoneAllowanceDetails._id": detailId,
//     });

//     if (!record) {
//       return res.status(404).json({
//         success: false,
//         message: "Telephone allowance detail not found",
//       });
//     }

//     // Find the detail to get the file path
//     const detail = record.telephoneAllowanceDetails.find(
//       (d) => d._id.toString() === detailId
//     );

//     // Delete the file from the filesystem if it exists
//     if (detail.billFile && fs.existsSync(detail.billFile)) {
//       try {
//         fs.unlinkSync(detail.billFile);
//       } catch (fileError) {
//         console.error("Error deleting file:", fileError);
//       }
//     }

//     // Remove the detail from the array
//     record.telephoneAllowanceDetails = record.telephoneAllowanceDetails.filter(
//       (detail) => detail._id.toString() !== detailId
//     );

//     // Update proofSubmitted
//     record.proofSubmitted = record.telephoneAllowanceDetails.length;

//     // If no details remain, optionally delete the entire record
//     if (record.telephoneAllowanceDetails.length === 0) {
//       await EmployeeTelephoneAllowance.deleteOne({ _id: record._id });
//       return res.status(200).json({
//         success: true,
//         message: "Telephone allowance record deleted as no details remain",
//       });
//     }

//     // Save the updated record
//     await record.save();

//     return res.status(200).json({
//       success: true,
//       message: "Telephone allowance detail deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting telephone allowance detail:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to delete telephone allowance detail",
//     });
//   }
// };

import mongoose from 'mongoose';
import EmployeeTelephoneAllowance from "../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js";
import fs from 'fs';
import path from 'path';

const deleteTelephoneAllowance = async (req, res) => {
  try {
    const { detailId } = req.params;
    const employeeId = req.query.employeeId;
    console.log("detailId", detailId);
    console.log("employeeId", employeeId);

    console.log("req.params:", req.params);
    console.log("req.query:", req.query);
    console.log("req.body:", req.body);
    // const { employeeId, detailId } = req.params;

    if (!employeeId || !detailId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and Detail ID are required",
      });
    }

    if (!mongoose.isValidObjectId(detailId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Detail ID format",
      });
    }

    const record = await EmployeeTelephoneAllowance.findOne({
      employeeId,
      "telephoneAllowanceDetails._id": detailId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Telephone allowance detail not found",
      });
    }

    const detail = record.telephoneAllowanceDetails.find(
      (d) => d._id.toString() === detailId
    );

    if (detail.billFile && fs.existsSync(detail.billFile)) {
      try {
        fs.unlinkSync(detail.billFile);
      } catch (fileError) {
        console.error("Error deleting file:", fileError);
      }
    }

    record.telephoneAllowanceDetails = record.telephoneAllowanceDetails.filter(
      (detail) => detail._id.toString() !== detailId
    );

   
    if (record.telephoneAllowanceDetails.length === 0) {
      await EmployeeTelephoneAllowance.deleteOne({ _id: record._id });
      return res.status(200).json({
        success: true,
        message: "Telephone allowance record deleted as no details remain",
      });
    }

     
record.proofSubmitted = record.telephoneAllowanceDetails.reduce(
  (sum, detail) => sum + detail.grossAmount,
  0
);
      
    await record.save();

    return res.status(200).json({
      success: true,
      message: "Telephone allowance detail deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting telephone allowance detail:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete telephone allowance detail",
    });
  }
};

export default deleteTelephoneAllowance;