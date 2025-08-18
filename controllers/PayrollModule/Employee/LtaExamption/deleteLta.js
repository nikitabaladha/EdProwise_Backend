// import EmployeeltaDetails from "../../../../models/PayrollModule/Employee/EmployeeltaDetails.js";
// import fs from 'fs';

// const deleteLta = async (req, res) => {
//   try {
//     const lta = await EmployeeltaDetails.findById(req.params.id);
//     if (!lta) {
//       return res.status(404).json({
//         success: false,
//         message: 'LTA record not found'
//       });
//     }

//     // Delete associated file if exists
//     if (lta.billFile && fs.existsSync(lta.billFile)) {
//       fs.unlinkSync(lta.billFile);
//     }

//     await EmployeeltaDetails.findByIdAndDelete(req.params.id);
//     res.json({
//       success: true,
//       message: 'LTA record deleted successfully'
//     });
//   } catch (err) {
//     console.error('Error deleting LTA record:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete LTA record',
//       error: err.message
//     });
//   }
// };

import mongoose from 'mongoose';
import EmployeeltaDetails from "../../../../models/PayrollModule/Employee/EmployeeltaDetails.js";
import fs from 'fs';
import path from 'path';

const deleteLta = async (req, res) => {
  try {
    const { detailId } = req.params;
    const employeeId = req.query;
     console.log("detailId", detailId );
     console.log("employeeId", employeeId);
     
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
    const record = await EmployeeltaDetails.findOne({
      employeeId,
      "ltaDetails._id": detailId,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "LTA detail not found",
      });
    }

    // Find the detail to get the file path
    const detail = record.ltaDetails.find(
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
    record.ltaDetails = record.ltaDetails.filter(
      (detail) => detail._id.toString() !== detailId
    );

    // Update proofSubmitted
    record.proofSubmitted = record.ltaDetails.length;

    // If no details remain, delete the entire record
    if (record.ltaDetails.length === 0) {
      await EmployeeltaDetails.deleteOne({ _id: record._id });
      return res.status(200).json({
        success: true,
        message: "LTA record deleted as no details remain",
      });
    }

    // Save the updated record
    await record.save();

    return res.status(200).json({
      success: true,
      message: "LTA detail deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting LTA detail:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete LTA detail",
    });
  }
};

export default deleteLta;