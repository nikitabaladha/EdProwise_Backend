// import EmployeeInternetAllowance from "../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js";
// import fs from 'fs';
// import path from 'path';

// const createInternetAllowance = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const {
//       employeeName,
//       billNumber,
//       billDate,
//       supplierName,
//       gstNumber,
//       grossAmount,
//       status,
//       schoolId,
//       academicYear,
//     } = req.body;

//     // Validate required fields
//     if (!employeeId || !schoolId || !academicYear || !employeeName || !billNumber || !billDate || !supplierName || !gstNumber || !grossAmount) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be provided",
//       });
//     }

//     // Validate GST number format
//     const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//     if (!gstRegex.test(gstNumber)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid GST Number format",
//       });
//     }

//     // Validate grossAmount
//     const grossAmt = parseFloat(grossAmount);
//     if (grossAmt <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Gross Amount must be a positive number",
//       });
//     }

//     // Validate billDate
//     const selectedDate = new Date(billDate);
//     const today = new Date();
//     if (selectedDate > today) {
//       return res.status(400).json({
//         success: false,
//         message: "Bill date cannot be in the future",
//       });
//     }

//     // Prepare internet allowance detail
//     const internetDetail = {
//       billNumber,
//       billDate: selectedDate,
//       supplierName,
//       gstNumber,
//       grossAmount: grossAmt,
//       billStatus: status || 'Pending',
//       billFile: req.files?.[0]?.path,
//       createdAt: new Date(),
//     };

//     // Find or create the record
//     let record = await EmployeeInternetAllowance.findOne({
//       schoolId,
//       employeeId,
//       academicYear,
//     });

//     if (record) {
//       record.internetAllowanceDetails.push(internetDetail);
//       record.proofSubmitted = record.internetAllowanceDetails.length;
//       await record.save();
//     } else {
//       record = new EmployeeInternetAllowance({
//         schoolId,
//         employeeId,
//         academicYear,
//         internetAllowanceDetails: [internetDetail],
//         proofSubmitted: 1,
//         status: 'Pending',
//       });
//       await record.save();
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Internet allowance detail added successfully",
//       data: record,
//     });
//   } catch (error) {
//     console.error("Error creating internet allowance detail:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create internet allowance detail",
//     });
//   }
// };

// export default createInternetAllowance;

import mongoose from 'mongoose';
import EmployeeInternetAllowance from "../../../../models/PayrollModule/Employee/EmployeeInternetAllowance.js";
import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import fs from 'fs';
import path from 'path';

const createInternetAllowance = async (req, res) => {
  const session = await mongoose.startSession(); 
  session.startTransaction(); 

  try {
    const { employeeId } = req.params;
    const {
      employeeName,
      billNumber,
      billDate,
      supplierName,
      gstNumber,
      grossAmount,
      status,
      schoolId,
      academicYear,
      categoryLimit,
    } = req.body;

    // Validate required fields
    if (!employeeId || !schoolId || !academicYear || !employeeName || !billNumber || !billDate || !supplierName || !gstNumber || !grossAmount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate GST number format
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid GST Number format",
      });
    }

    // Validate grossAmount
    const grossAmt = parseFloat(grossAmount);
    if (grossAmt <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Gross Amount must be a positive number",
      });
    }

    // Validate billDate
    const selectedDate = new Date(billDate);
    const today = new Date();
    if (selectedDate > today) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Bill date cannot be in the future",
      });
    }

    // Prepare internet allowance detail
    const internetDetail = {
      billNumber,
      billDate: selectedDate,
      supplierName,
      gstNumber,
      grossAmount: grossAmt,
      billStatus: status || 'Pending',
      billFile: req.files?.[0]?.path,
      createdAt: new Date(),
    };

    // Find or create the record
    let record = await EmployeeInternetAllowance.findOne(
      { schoolId, employeeId, academicYear },
      null,
      { session }
    );

    if (record) {
      record.internetAllowanceDetails.push(internetDetail);
      // Calculate proofSubmitted as sum of grossAmount in internetAllowanceDetails
      record.proofSubmitted = record.internetAllowanceDetails.reduce((sum, detail) => sum + detail.grossAmount, 0);
      // Calculate categoryFinalDeduction as minimum of categoryLimit and proofSubmitted
      record.categoryFinalDeduction = Math.min(record.proofSubmitted, categoryLimit || record.categoryLimit || 0);
      await record.save({ session });
    } else {
      // Calculate proofSubmitted for new record (only the current internetDetail)
      const proofSubmitted = grossAmt;
      // Calculate categoryFinalDeduction as minimum of categoryLimit and proofSubmitted
      const categoryFinalDeduction = Math.min(proofSubmitted, categoryLimit || 0);
      record = new EmployeeInternetAllowance({
        schoolId,
        employeeId,
        academicYear,
        employeeName,
        categoryLimit,
        internetAllowanceDetails: [internetDetail],
        proofSubmitted,
        categoryFinalDeduction,
        status: 'Pending',
      });
      await record.save({ session });
    }

    // Update ItDeclaration with internetAllowanceDetailsId
    let itDeclaration = await ItDeclaration.findOne(
      { schoolId, employeeId, academicYear },
      null,
      { session }
    );

    if (!itDeclaration) {
      // Create a new ItDeclaration if it doesn't exist
      itDeclaration = new ItDeclaration({
        schoolId,
        employeeId,
        status: 'Verification Pending',
        otherExemption: {
          internetAllowance: {
            internetAllowanceDetailsId: record._id,
            status: 'Pending',
          },
        },
      });
    } else {
      // Update existing ItDeclaration
      itDeclaration.otherExemption.internetAllowance.internetAllowanceDetailsId = record._id;
      itDeclaration.otherExemption.internetAllowance.status = record.status || 'Pending';
    }

    await itDeclaration.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Internet allowance detail added and IT Declaration updated successfully",
      data: record,
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating internet allowance detail:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create internet allowance detail",
    });
  }
};

export default createInternetAllowance;