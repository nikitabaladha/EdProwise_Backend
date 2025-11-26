// import EmployeeTelephoneAllowance from "../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js"

// const createTelephoneAllowance = async (req, res) => {
//   try {
//     const { employeeId } = req.params;
//     const {
//       schoolId,
//       academicYear,
//       employeeName,
//       billNumber,
//       billDate,
//       supplierName,
//       gstNumber,
//       grossAmount,
//       status,
//     } = req.body;

//     // Validate required fields
//     if (!schoolId || !employeeId || !academicYear || !billNumber || !billDate || !supplierName || !gstNumber || !grossAmount) {
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
//         message: "Invalid GST number format",
//       });
//     }

//     // Validate grossAmount
//     const grossAmountNum = parseFloat(grossAmount);
//     if (isNaN(grossAmountNum) || grossAmountNum <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Gross amount must be a positive number",
//       });
//     }

//     // Validate billDate
//     const parsedBillDate = new Date(billDate);
//     if (isNaN(parsedBillDate.getTime()) || parsedBillDate > new Date()) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid bill date or bill date cannot be in the future",
//       });
//     }

//     // Check if a file was uploaded
//     let billFilePath = null;
//     if (req.files && req.files.length > 0) {
//       const file = req.files.find((f) => f.fieldname === "billFile");
//       if (file) {
//         billFilePath = file.path;
//       } else {
//         return res.status(400).json({
//           success: false,
//           message: "Bill file is required",
//         });
//       }
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Bill file is required",
//       });
//     }

//     // Check if a record exists for the employee, school, and academic year
//     let existingRecord = await EmployeeTelephoneAllowance.findOne({
//       schoolId,
//       employeeId,
//       academicYear,
//     });

//     const newTelephoneDetail = {
//       billNumber,
//       billDate: parsedBillDate,
//       supplierName,
//       gstNumber,
//       grossAmount: grossAmountNum,
//       billFile: billFilePath,
//       billStatus: status || "Pending",
//     };

//     if (existingRecord) {
//       // Append to existing telephoneAllowanceDetails array
//       existingRecord.telephoneAllowanceDetails.push(newTelephoneDetail);
//       existingRecord.proofSubmitted = (existingRecord.proofSubmitted || 0) + 1;
//       existingRecord.employeeName = employeeName || existingRecord.employeeName; // Update if provided
//       await existingRecord.save();
//       return res.status(201).json({
//         success: true,
//         message: "Telephone Allowance detail added successfully",
//         data: existingRecord,
//       });
//     } else {
//       // Create new record
//       const newRecord = new EmployeeTelephoneAllowance({
//         schoolId,
//         employeeId,
//         academicYear,
//         employeeName,
//         categoryLimit: 0, 
//         categoryFinalDeduction: 0,
//         proofSubmitted: 1,
//         telephoneAllowanceDetails: [newTelephoneDetail],
//         status: "Pending",
//       });
//       await newRecord.save();
//       return res.status(201).json({
//         success: true,
//         message: "Telephone Allowance record created successfully",
//         data: newRecord,
//       });
//     }
//   } catch (error) {
//     console.error("Error creating telephone allowance:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to add Telephone Allowance record",
//     });
//   }
// };

// export default createTelephoneAllowance;

// import mongoose from 'mongoose';
// import EmployeeTelephoneAllowance from "../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js";
// import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';

// const createTelephoneAllowance = async (req, res) => {
//   const session = await mongoose.startSession(); // Start a session
//   session.startTransaction(); // Begin transaction

//   try {
//     const { employeeId } = req.params;
//     const {
//       schoolId,
//       academicYear,
//       employeeName,
//       billNumber,
//       billDate,
//       supplierName,
//       gstNumber,
//       grossAmount,
//       status,
//       categoryLimit,
//     } = req.body;

//     // Validate required fields
//     if (!schoolId || !employeeId || !academicYear || !billNumber || !billDate || !supplierName || !gstNumber || !grossAmount) {
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
//         message: "Invalid GST number format",
//       });
//     }

//     // Validate grossAmount
//     const grossAmountNum = parseFloat(grossAmount);
//     if (isNaN(grossAmountNum) || grossAmountNum <= 0) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Gross amount must be a positive number",
//       });
//     }

//     // Validate billDate
//     const parsedBillDate = new Date(billDate);
//     if (isNaN(parsedBillDate.getTime()) || parsedBillDate > new Date()) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Invalid bill date or bill date cannot be in the future",
//       });
//     }

//     // Check if a file was uploaded
//     let billFilePath = null;
//     if (req.files && req.files.length > 0) {
//       const file = req.files.find((f) => f.fieldname === "billFile");
//       if (file) {
//         billFilePath = file.path;
//       } else {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({
//           success: false,
//           message: "Bill file is required",
//         });
//       }
//     } else {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         success: false,
//         message: "Bill file is required",
//       });
//     }

//     let existingRecord = await EmployeeTelephoneAllowance.findOne(
//       { schoolId, employeeId, academicYear },
//       null,
//       { session }
//     );

//     const newTelephoneDetail = {
//       billNumber,
//       billDate: parsedBillDate,
//       supplierName,
//       gstNumber,
//       grossAmount: grossAmountNum,
//       billFile: billFilePath,
//       billStatus: status || "Pending",
//     };

//     if (existingRecord) {
//       // Append to existing telephoneAllowanceDetails array
//       existingRecord.telephoneAllowanceDetails.push(newTelephoneDetail);
//       await existingRecord.save({ session });
//     } else {
//       // Create new record
//       existingRecord = new EmployeeTelephoneAllowance({
//         schoolId,
//         employeeId,
//         academicYear,
//         employeeName,
//         categoryLimit,
//         categoryFinalDeduction: 0,
//         proofSubmitted: 0,
//         telephoneAllowanceDetails: [newTelephoneDetail],
//         status: "Pending",
//       });
//       await existingRecord.save({ session });
//     }

//     // Update ItDeclaration with telephoneAllowanceDetailsId
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
//           telephoneAllowance: {
//             telephoneAllowanceDetailsId: existingRecord._id,
//             status: 'Pending',
//           },
//         },
//       });
//     } else {
//       // Update it if already present ItDeclaration
//       itDeclaration.otherExemption.telephoneAllowance.telephoneAllowanceDetailsId = existingRecord._id;
//       itDeclaration.otherExemption.telephoneAllowance.status = existingRecord.status || 'Pending';
//     }

//     await itDeclaration.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       success: true,
//       message: "Telephone Allowance detail added and IT Declaration updated successfully",
//       data: existingRecord,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error creating telephone allowance:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to add Telephone Allowance record",
//     });
//   }
// };

// export default createTelephoneAllowance;

import mongoose from 'mongoose';
import EmployeeTelephoneAllowance from "../../../../models/PayrollModule/Employee/EmployeeTelephoneAllowance.js";
import ItDeclaration from '../../../../models/PayrollModule/Employee/ItDeclaration.js';

const createTelephoneAllowance = async (req, res) => {
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Begin transaction

  try {
    const { employeeId } = req.params;
    const {
      schoolId,
      academicYear,
      employeeName,
      billNumber,
      billDate,
      supplierName,
      gstNumber,
      grossAmount,
      status,
      categoryLimit,
    } = req.body;

    // Validate required fields
    if (!schoolId || !employeeId || !academicYear || !billNumber || !billDate || !supplierName || !gstNumber || !grossAmount) {
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
        message: "Invalid GST number format",
      });
    }

    // Validate grossAmount
    const grossAmountNum = parseFloat(grossAmount);
    if (isNaN(grossAmountNum) || grossAmountNum <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Gross amount must be a positive number",
      });
    }

    // Validate billDate
    const parsedBillDate = new Date(billDate);
    if (isNaN(parsedBillDate.getTime()) || parsedBillDate > new Date()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid bill date or bill date cannot be in the future",
      });
    }

    // Check if a file was uploaded
    let billFilePath = null;
    if (req.files && req.files.length > 0) {
      const file = req.files.find((f) => f.fieldname === "billFile");
      if (file) {
        billFilePath = file.path;
      } else {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Bill file is required",
        });
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Bill file is required",
      });
    }

    let existingRecord = await EmployeeTelephoneAllowance.findOne(
      { schoolId, employeeId, academicYear },
      null,
      { session }
    );

    const newTelephoneDetail = {
      billNumber,
      billDate: parsedBillDate,
      supplierName,
      gstNumber,
      grossAmount: grossAmountNum,
      billFile: billFilePath,
      billStatus: status || "Pending",
    };

    if (existingRecord) {
      // Append to existing telephoneAllowanceDetails array
      existingRecord.telephoneAllowanceDetails.push(newTelephoneDetail);
      // Calculate proofSubmitted as sum of grossAmount in telephoneAllowanceDetails
      existingRecord.proofSubmitted = existingRecord.telephoneAllowanceDetails.reduce((sum, detail) => sum + detail.grossAmount, 0);
      // Calculate categoryFinalDeduction as minimum of categoryLimit and proofSubmitted
      existingRecord.categoryFinalDeduction = Math.min(existingRecord.proofSubmitted, categoryLimit || existingRecord.categoryLimit || 0);
      await existingRecord.save({ session });
    } else {
      // Calculate proofSubmitted for new record (only the current telephoneDetail)
      const proofSubmitted = grossAmountNum;
      // Calculate categoryFinalDeduction as minimum of categoryLimit and proofSubmitted
      const categoryFinalDeduction = Math.min(proofSubmitted, categoryLimit || 0);
      existingRecord = new EmployeeTelephoneAllowance({
        schoolId,
        employeeId,
        academicYear,
        employeeName,
        categoryLimit,
        categoryFinalDeduction,
        proofSubmitted,
        telephoneAllowanceDetails: [newTelephoneDetail],
        status: "Pending",
      });
      await existingRecord.save({ session });
    }

    // Update ItDeclaration with telephoneAllowanceDetailsId
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
          telephoneAllowance: {
            telephoneAllowanceDetailsId: existingRecord._id,
            status: 'Pending',
          },
        },
      });
    } else {
      // Update it if already present ItDeclaration
      itDeclaration.otherExemption.telephoneAllowance.telephoneAllowanceDetailsId = existingRecord._id;
      itDeclaration.otherExemption.telephoneAllowance.status = existingRecord.status || 'Pending';
    }

    await itDeclaration.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Telephone Allowance detail added and IT Declaration updated successfully",
      data: existingRecord,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating telephone allowance:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add Telephone Allowance record",
    });
  }
};

export default createTelephoneAllowance;