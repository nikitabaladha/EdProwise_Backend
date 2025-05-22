// import SchoolFees from '../../../../models/FeesModule/SchoolFees.js';

// const schoolFees = async (req, res) => {
//   try {
//     const schoolId = req.user?.schoolId;
//     if (!schoolId) {
//       return res.status(401).json({
//         hasError: true,
//         message: 'Access denied: School ID missing.'
//       });
//     }

//     const {
//       studentAdmissionNumber,
//       studentName,
//       className,
//       section,
//       receiptNumber,
//       transactionNumber,
//       paymentMode,
//       collectorName,
//       academicYear,
//       installments
//     } = req.body;

//     if (!Array.isArray(installments) || installments.length === 0) {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Installments data is required and must be a non-empty array.'
//       });
//     }

//     const processedInstallments = installments.map((inst, index) => ({
//       ...inst,
//       number: inst.number ?? index + 1
//     }));

//     const existingRecord = await SchoolFees.findOne({ schoolId, studentAdmissionNumber });

//     if (existingRecord) {

//       processedInstallments.forEach((newInstallment) => {
//         const existingInstallment = existingRecord.installments.find(
//           (inst) => inst.number === newInstallment.number
//         );

//         if (existingInstallment) {
  
//           newInstallment.feeItems.forEach((newFeeItem) => {
//             const existingFeeItem = existingInstallment.feeItems.find(
//               (item) => item.feeTypeId === newFeeItem.feeTypeId
//             );

//             if (existingFeeItem) {
            
//               existingFeeItem.amount = newFeeItem.amount;
//               existingFeeItem.concession = newFeeItem.concession;
//               existingFeeItem.fineAmount = newFeeItem.fineAmount;
//               existingFeeItem.payable = newFeeItem.payable;
//               existingFeeItem.paid = newFeeItem.paid;
//               existingFeeItem.balance = newFeeItem.balance;
//             } else {
            
//               existingInstallment.feeItems.push(newFeeItem);
//             }
//           });
//         } else {
     
//           existingRecord.installments.push(newInstallment);
//         }
//       });

   
//       await existingRecord.save();

//       return res.status(200).json({
//         hasError: false,
//         message: 'School fee receipt updated successfully.',
//         receipt: existingRecord
//       });
//     } else {
//       const newSchoolFees = new SchoolFees({
//         schoolId,
//         studentAdmissionNumber,
//         studentName,
//         className,
//         section,
//         receiptNumber,
//         transactionNumber,
//         paymentMode,
//         collectorName,
//         academicYear,
//         installments: processedInstallments
//       });

//       await newSchoolFees.save();

//       return res.status(201).json({
//         hasError: false,
//         message: 'School fee receipt saved successfully.',
//         receipt: newSchoolFees
//       });
//     }

//   } catch (error) {
//     console.error('Error saving school fee receipt:', error);
//     res.status(500).json({
//       hasError: true,
//       message: 'Error saving school fee receipt',
//       error: error.message
//     });
//   }
// };

// export default schoolFees;
// import mongoose from 'mongoose';
// import { SchoolFees, SchoolFeesCounter } from '../../../../models/FeesModule/SchoolFees.js';

// const schoolFeesAPI = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const schoolId = req.user?.schoolId;
//     if (!schoolId) {
//       return res.status(401).json({
//         hasError: true,
//         message: 'Access denied: School ID missing.'
//       });
//     }

//     const {
//       studentAdmissionNumber,
//       studentName,
//       className,
//       section,
//       transactionNumber,
//       paymentMode,
//       collectorName,
//       academicYear,
//       bankName,
//       installments,
//       existingReceiptId 
//     } = req.body;




//     const processInstallments = (insts) => {
//       return insts.map((inst, index) => {
//         const seenFeeTypeIds = new Set();
//         const uniqueFeeItems = [];

//         inst.feeItems.forEach((feeItem) => {
//           if (!seenFeeTypeIds.has(feeItem.feeTypeId)) {
//             seenFeeTypeIds.add(feeItem.feeTypeId);
//             uniqueFeeItems.push(feeItem);
//           }
//         });

//         return {
//           ...inst,
//           number: inst.number ?? index + 1,
//           feeItems: uniqueFeeItems
//         };
//       });
//     };

//     const processedInstallments = processInstallments(installments);

  
//     const generateReceiptNumber = async (schoolId) => {
//       const counter = await SchoolFeesCounter.findOneAndUpdate(
//         { schoolId },
//         { $inc: { receiptSeq: 1 } },
//         { new: true, upsert: true, session }
//       );
//       const padded = counter.receiptSeq.toString().padStart(6, '0');
//       return `FEE/${padded}`;
//     };


//     if (existingReceiptId) {

//       const existingReceipt = await SchoolFees.findById(existingReceiptId).session(session);
//       if (!existingReceipt) {
//         return res.status(404).json({
//           hasError: true,
//           message: 'Existing receipt not found.'
//         });
//       }

   
//       const newReceiptNumber = await generateReceiptNumber(schoolId);

    
//       const newReceipt = new SchoolFees({
//         ...existingReceipt.toObject(), 
//         _id: undefined, 
//         receiptNumber: newReceiptNumber, 
//         previousReceipt: existingReceipt._id, 
//         date: new Date(), 
//         isActive: true,
//         studentAdmissionNumber,
//         studentName,
//         className,
//         section,
//         transactionNumber,
//         paymentMode,
//         collectorName,
//         academicYear,
//         bankName,
//         installments: processedInstallments
//       });


//       existingReceipt.isActive = false;
//       await existingReceipt.save({ session });


//       await newReceipt.save({ session });

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(201).json({
//         hasError: false,
//         message: 'Receipt updated with new receipt number.',
//         receipt: newReceipt,
//         previousReceiptId: existingReceipt._id
//       });
//     }

  
//     const receiptNumber = await generateReceiptNumber(schoolId);
//     const newSchoolFees = new SchoolFees({
//       schoolId,
//       studentAdmissionNumber,
//       studentName,
//       className,
//       section,
//       receiptNumber,
//       transactionNumber,
//       paymentMode,
//       collectorName,
//       academicYear,
//       bankName,
//       installments: processedInstallments
//     });

//     await newSchoolFees.save({ session });
//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       hasError: false,
//       message: 'New receipt created successfully.',
//       receipt: newSchoolFees
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error('Error processing school fee receipt:', error);

//     if (error.code === 11000) {
//       return res.status(409).json({
//         hasError: true,
//         message: 'Duplicate receipt error occurred.'
//       });
//     }

//     return res.status(500).json({
//       hasError: true,
//       message: 'Error processing school fee receipt',
//       error: error.message
//     });
//   }
// };

// export default schoolFeesAPI;

// import mongoose from 'mongoose';
// import { SchoolFees, SchoolFeesCounter } from '../../../../models/FeesModule/SchoolFees.js';

// const getNextReceiptNumber = async (schoolId, session) => {
//   const counter = await SchoolFeesCounter.findOneAndUpdate(
//     { schoolId },
//     { $inc: { receiptSeq: 1 } },
//     { new: true, upsert: true, session }
//   );
//   return `REC-${counter.receiptSeq.toString().padStart(5, '0')}`;
// };

// const schoolFees = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const schoolId = req.user?.schoolId;
//     if (!schoolId) {
//       await session.abortTransaction();
//       return res.status(401).json({
//         hasError: true,
//         message: 'Access denied: School ID missing.'
//       });
//     }

//     const {
//       studentAdmissionNumber,
//       studentName,
//       className,
//       section,
//       transactionNumber,
//       paymentMode,
//       collectorName,
//       academicYear,
//       installments
//     } = req.body;

//     if (!Array.isArray(installments) || installments.length === 0) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         hasError: true,
//         message: 'Installments data is required and must be a non-empty array.'
//       });
//     }

//     const processedInstallments = installments.map((inst, index) => ({
//       ...inst,
//       number: inst.number ?? index + 1
//     }));

//     const existingRecord = await SchoolFees.findOne({
//       schoolId,
//       studentAdmissionNumber,
//       academicYear
//     }).session(session);

//     if (existingRecord) {
//       processedInstallments.forEach((newInstallment) => {
//         const existingInstallment = existingRecord.installments.find(
//           (inst) => inst.number === newInstallment.number
//         );

//         if (existingInstallment) {
//           newInstallment.feeItems.forEach((newFeeItem) => {
//             const existingFeeItem = existingInstallment.feeItems.find(
//               (item) => item.feeTypeId === newFeeItem.feeTypeId
//             );

//             if (existingFeeItem) {
//               existingFeeItem.amount = newFeeItem.amount;
//               existingFeeItem.concession = newFeeItem.concession;
//               existingFeeItem.fineAmount = newFeeItem.fineAmount;
//               existingFeeItem.payable = newFeeItem.payable;
//               existingFeeItem.paid = newFeeItem.paid;
//               existingFeeItem.balance = newFeeItem.balance;
//             } else {
//               existingInstallment.feeItems.push(newFeeItem);
//             }
//           });
//         } else {
//           existingRecord.installments.push(newInstallment);
//         }
//       });

//       await existingRecord.save({ session });

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(200).json({
//         hasError: false,
//         message: 'School fee receipt updated successfully.',
//         receipt: existingRecord
//       });
//     } else {
//       const receiptNumber = await getNextReceiptNumber(schoolId, session);

//       const newSchoolFees = new SchoolFees({
//         schoolId,
//         studentAdmissionNumber,
//         studentName,
//         className,
//         section,
//         receiptNumber,
//         transactionNumber,
//         paymentMode,
//         collectorName,
//         academicYear,
//         installments: processedInstallments
//       });

//       await newSchoolFees.save({ session });

//       await session.commitTransaction();
//       session.endSession();

//       return res.status(201).json({
//         hasError: false,
//         message: 'School fee receipt saved successfully.',
//         receipt: newSchoolFees
//       });
//     }
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error('Error saving school fee receipt:', error);
//     res.status(500).json({
//       hasError: true,
//       message: 'Error saving school fee receipt',
//       error: error.message
//     });
//   }
// };

// export default schoolFees;

import mongoose from 'mongoose';
import { SchoolFees, SchoolFeesCounter } from '../../../../models/FeesModule/SchoolFees.js';

const getNextReceiptNumber = async (schoolId, session) => {
  const counter = await SchoolFeesCounter.findOneAndUpdate(
    { schoolId },
    { $inc: { receiptSeq: 1 } },
    { new: true, upsert: true, session }
  );
  return `REC-${counter.receiptSeq.toString().padStart(5, '0')}`;
};

const schoolFees = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      await session.abortTransaction();
      return res.status(401).json({
        hasError: true,
        message: 'Access denied: School ID missing.'
      });
    }

    const {
      studentAdmissionNumber,
      studentName,
      className,
      section,
      transactionNumber,
      paymentMode,
      collectorName,
      academicYear,
      installments
    } = req.body;

    if (!Array.isArray(installments) || installments.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        hasError: true,
        message: 'Installments data is required and must be a non-empty array.'
      });
    }

    const existingRecord = await SchoolFees.findOne({
      schoolId,
      studentAdmissionNumber,
      academicYear
    }).session(session);

    const newReceiptNumber = await getNextReceiptNumber(schoolId, session);

    if (existingRecord) {
      // ✅ Only update receipt number
      existingRecord.receiptNumber = newReceiptNumber;
      await existingRecord.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        hasError: false,
        message: 'Existing record found. Receipt number updated.',
        receipt: existingRecord
      });
    } else {
      // Create new record if not found
      const processedInstallments = installments.map((inst, index) => ({
        ...inst,
        number: inst.number ?? index + 1
      }));

      const newSchoolFees = new SchoolFees({
        schoolId,
        studentAdmissionNumber,
        studentName,
        className,
        section,
        receiptNumber: newReceiptNumber,
        transactionNumber,
        paymentMode,
        collectorName,
        academicYear,
        installments: processedInstallments
      });

      await newSchoolFees.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        hasError: false,
        message: 'New school fee record created.',
        receipt: newSchoolFees
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error in school fee API:', error);
    res.status(500).json({
      hasError: true,
      message: 'Error processing school fee data',
      error: error.message
    });
  }
};

export default schoolFees;


