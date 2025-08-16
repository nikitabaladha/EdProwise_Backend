// import EmployeeltaDetails from "../../../../models/PayrollModule/Employee/EmployeeltaDetails.js";
// import fs from 'fs';

// const createLta = async (req, res) => {
//   try {
//     const {
//       schoolId,
//       employeeName,
//       academicYear,
//       billNumber,
//       billDate,
//       itemPurchased,
//       vendorName,
//       gstNumber,
//       grossAmount,
//       gstCharge,
//       totalAmount,
//       status
//     } = req.body;

//     // Validate required fields
//     if (!schoolId || !employeeName || !academicYear || !billNumber || !billDate ||
//         !itemPurchased || !vendorName || !gstNumber || !grossAmount || !gstCharge || !totalAmount) {
//       return res.status(400).json({
//         success: false,
//         message: 'All required fields must be provided'
//       });
//     }

//     // Validate numeric fields
//     if (isNaN(grossAmount) || isNaN(gstCharge) || isNaN(totalAmount)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Amount fields must be valid numbers'
//       });
//     }

//     // Check for file
//     const billFile = req.files && req.files.length > 0 ? req.files[0].path : null;
//     if (!billFile) {
//       return res.status(400).json({
//         success: false,
//         message: 'Bill file is required'
//       });
//     }

//     const lta = new EmployeeltaDetails({
//       schoolId,
//       employeeId: req.params.employeeId,
//       employeeName,
//       academicYear,
//       billNumber,
//       billDate: new Date(billDate),
//       itemPurchased,
//       vendorName,
//       gstNumber,
//       grossAmount: Number(grossAmount),
//       gstCharge: Number(gstCharge),
//       totalAmount: Number(totalAmount),
//       status,
//       billFile
//     });

//     const newLta = await lta.save();
//     res.status(201).json({
//       success: true,
//       data: newLta,
//       message: 'LTA record created successfully'
//     });
//   } catch (err) {
//     console.error('Error creating LTA record:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create LTA record',
//       error: err.message
//     });
//   }
// };

// const createLta = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const {
//       employeeName,
//       billNumber,
//       billDate,
//       itemPurchased,
//       vendorName,
//       gstNumber,
//       grossAmount,
//       gstCharge,
//       totalAmount,
//       status,
//       schoolId,
//       academicYear,
//     } = req.body;

//     // Validate required fields
//     if (!employeeId || !schoolId || !academicYear || !employeeName || !billNumber || !billDate || !itemPurchased || !vendorName || !gstNumber || !grossAmount || !gstCharge || !totalAmount) {
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

//     // Validate amounts
//     const grossAmt = parseFloat(grossAmount);
//     const gstAmt = parseFloat(gstCharge);
//     const totalAmt = parseFloat(totalAmount);
//     if (grossAmt <= 0 || gstAmt < 0 || totalAmt <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Amounts must be positive numbers",
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

//     // Prepare LTA detail
//     const ltaDetail = {
//       NameOnBill: employeeName,
//       billNumber,
//       billDate: selectedDate,
//       itemPurchased,
//       vendorName,
//       gstNumber,
//       grossAmount: grossAmt,
//       gstCharge: gstAmt,
//       totalAmount: totalAmt,
//       billstatus: status || 'Pending',
//       billFile: req.files?.[0]?.path,
//       createdAt: new Date(),
//     };

//     // Find or create the record
//     let record = await EmployeeltaDetails.findOne({
//       schoolId,
//       employeeId,
//       academicYear,
//     });

//     if (record) {
//       record.ltaDetails.push(ltaDetail);
//       record.proofSubmitted = record.ltaDetails.length;
//       await record.save();
//     } else {
//       record = new EmployeeltaDetails({
//         schoolId,
//         employeeId,
//         academicYear,
//         ltaDetails: [ltaDetail],
//         proofSubmitted: 1,
//         status: 'Pending',
//       });
//       await record.save();
//     }

//     return res.status(201).json({
//       success: true,
//       message: "LTA detail added successfully",
//       data: record,
//     });
//   } catch (error) {
//     console.error("Error creating LTA detail:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create LTA detail",
//     });
//   }
// };

// export default createLta;


// import mongoose from 'mongoose';
// import EmployeeltaDetails from "../../../../models/PayrollModule/Employee/EmployeeltaDetails.js";
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
// import EmployeeCTC from '../../../../models/PayrollModule/Employeer/EmployeeCTC.js';
// import fs from 'fs';

// const createLta = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { employeeId } = req.params;
//     const {
//       employeeName,
//       billNumber,
//       billDate,
//       itemPurchased,
//       vendorName,
//       gstNumber,
//       grossAmount,
//       gstCharge,
//       totalAmount,
//       status,
//       schoolId,
//       academicYear,
//       categoryLimit,
//     } = req.body;

//     // Validate required fields
//     if (!employeeId || !schoolId || !academicYear || !employeeName || !billNumber || !billDate || !itemPurchased || !vendorName || !gstNumber || !grossAmount || !gstCharge || !totalAmount) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be provided",
//       });
//     }

//     // Validate GST number format
//     const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//     if (!gstRegex.test(gstNumber)) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Invalid GST Number format",
//       });
//     }

//     // Validate amounts
//     const grossAmt = parseFloat(grossAmount);
//     const gstAmt = parseFloat(gstCharge);
//     const totalAmt = parseFloat(totalAmount);
//     if (grossAmt <= 0 || gstAmt < 0 || totalAmt <= 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Amounts must be positive numbers",
//       });
//     }

//     // Validate billDate
//     const selectedDate = new Date(billDate);
//     const today = new Date();
//     if (selectedDate > today) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Bill date cannot be in the future",
//       });
//     }

//     // Prepare LTA detail
//     const ltaDetail = {
//       NameOnBill: employeeName,
//       billNumber,
//       billDate: selectedDate,
//       itemPurchased,
//       vendorName,
//       gstNumber,
//       grossAmount: grossAmt,
//       gstCharge: gstAmt,
//       totalAmount: totalAmt,
//       billstatus: status || 'Pending',
//       billFile: req.files?.[0]?.path,
//       createdAt: new Date(),
//     };

//     // Find or create the LTA record
//     let ltaRecord = await EmployeeltaDetails.findOne(
//       { schoolId, employeeId, academicYear },
//       null,
//       { session }
//     );

//     if (ltaRecord) {
//       ltaRecord.ltaDetails.push(ltaDetail);
//       ltaRecord.finalDeduction = ltaRecord.finalDeduction;
//       await ltaRecord.save({ session });
//     } else {
//       ltaRecord = new EmployeeltaDetails({
//         schoolId,
//         employeeId,
//         academicYear,
//         categoryLimit,
//         ltaDetails: [ltaDetail],
//         status: 'Pending',
//       });
//       await ltaRecord.save({ session });
//     }

//     // Update ItDeclaration with ltaDetailsId
//     let itDeclaration = await ItDeclaration.findOne(
//       { schoolId, employeeId, academicYear },
//       null,
//       { session }
//     );

//     if (!itDeclaration) {
//       // Create a new ItDeclaration if it doesn't exist
//       itDeclaration = new ItDeclaration({
//         schoolId,
//         employeeId,
//         status: 'Verification Pending',
//         otherExemption: {
//           ltaExemption: {
//             ltaDetailsId: ltaRecord._id,
//             status: 'Pending',
//           },  
//         },
//       });
//     } else {
//       // Update existing ItDeclaration
//       itDeclaration.otherExemption.ltaExemption.ltaDetailsId = ltaRecord._id;
//       itDeclaration.otherExemption.ltaExemption.status = ltaRecord.status || 'Pending';
//     }

//     await itDeclaration.save({ session });

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       success: true,
//       message: "LTA detail added and IT Declaration updated successfully",
//       data: ltaRecord,
//     });
//   } catch (error) {
//     // Rollback transaction on error
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error creating LTA detail:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create LTA detail",
//     });
//   }
// };

// export default createLta;

import mongoose from 'mongoose';
import EmployeeltaDetails from "../../../../models/PayrollModule/Employee/EmployeeltaDetails.js";
import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';
import EmployeeCTC from '../../../../models/PayrollModule/Employer/EmployeeCTC.js';
import fs from 'fs';

const createLta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { employeeId } = req.params;
    const {
      employeeName,
      billNumber,
      billDate,
      itemPurchased,
      vendorName,
      gstNumber,
      grossAmount,
      gstCharge,
      totalAmount,
      status,
      schoolId,
      academicYear,
      categoryLimit,
    } = req.body;

    // Validate required fields
    if (!employeeId || !schoolId || !academicYear || !employeeName || !billNumber || !billDate || !itemPurchased || !vendorName || !gstNumber || !grossAmount || !gstCharge || !totalAmount) {
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

    // Validate amounts
    const grossAmt = parseFloat(grossAmount);
    const gstAmt = parseFloat(gstCharge);
    const totalAmt = parseFloat(totalAmount);
    if (grossAmt <= 0 || gstAmt < 0 || totalAmt <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Amounts must be positive numbers",
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

    // Prepare LTA detail
    const ltaDetail = {
      NameOnBill: employeeName,
      billNumber,
      billDate: selectedDate,
      itemPurchased,
      vendorName,
      gstNumber,
      grossAmount: grossAmt,
      gstCharge: gstAmt,
      totalAmount: totalAmt,
      billstatus: status || 'Pending',
      billFile: req.files?.[0]?.path,
      createdAt: new Date(),
    };

    // Find or create the LTA record
    let ltaRecord = await EmployeeltaDetails.findOne(
      { schoolId, employeeId, academicYear },
      null,
      { session }
    );

    if (ltaRecord) {
      ltaRecord.ltaDetails.push(ltaDetail);
      // Calculate proofSubmitted as sum of totalAmount in ltaDetails
      ltaRecord.proofSubmitted = ltaRecord.ltaDetails.reduce((sum, detail) => sum + detail.totalAmount, 0);
      // Calculate categoryFinalDeduction as minimum of categoryLimit and proofSubmitted
      ltaRecord.categoryFinalDeduction = Math.min(ltaRecord.proofSubmitted, categoryLimit || ltaRecord.categoryLimit || 0);
      await ltaRecord.save({ session });
    } else {
      const proofSubmitted = totalAmt;
      const categoryFinalDeduction = Math.min(proofSubmitted, categoryLimit || 0);
      ltaRecord = new EmployeeltaDetails({
        schoolId,
        employeeId,
        academicYear,
        categoryLimit,
        ltaDetails: [ltaDetail],
        proofSubmitted,
        categoryFinalDeduction,
        status: 'Pending',
      });
      await ltaRecord.save({ session });
    }

    let itDeclaration = await ItDeclaration.findOne(
      { schoolId, employeeId, academicYear },
      null,
      { session }
    );

    if (!itDeclaration) {
      itDeclaration = new ItDeclaration({
        schoolId,
        employeeId,
        otherExemption: {
          ltaExemption: {
            ltaDetailsId: ltaRecord._id,
            status: 'Pending',
          },  
        },
      });
    } else {
      itDeclaration.otherExemption.ltaExemption.ltaDetailsId = ltaRecord._id;
      itDeclaration.otherExemption.ltaExemption.status = ltaRecord.status || 'Pending';
    }

    await itDeclaration.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "LTA detail added and IT Declaration updated successfully",
      data: ltaRecord,
    });
  } catch (error) {
    
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating LTA detail:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create LTA detail",
    });
  }
};

export default createLta;