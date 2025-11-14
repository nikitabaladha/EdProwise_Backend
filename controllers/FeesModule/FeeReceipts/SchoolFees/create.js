
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
//       firstName,
//       lastName,
//       className,
//       section,
//       transactionNumber,
//       paymentMode,
//       collectorName,
//       academicYear,
//       installments,
//       chequeNumber,
//       bankName,
//       paymentDate
//     } = req.body;


//     if (!studentAdmissionNumber || !firstName  || !lastName || !className || !section || !paymentMode || !collectorName || !academicYear) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         hasError: true,
//         message: 'Missing required fields: studentAdmissionNumber, firstName,lastName, className, section, paymentMode, collectorName, or academicYear.'
//       });
//     }


//     if (!Array.isArray(installments) || installments.length === 0) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         hasError: true,
//         message: 'Installments data is required and must be a non-empty array.'
//       });
//     }


//     for (const inst of installments) {
//       if (!inst.installmentName || !inst.dueDate || !Array.isArray(inst.feeItems) || inst.feeItems.length === 0) {
//         await session.abortTransaction();
//         return res.status(400).json({
//           hasError: true,
//           message: 'Each installment must have installmentName, dueDate, and a non-empty feeItems array.'
//         });
//       }

//       if (isNaN(new Date(inst.dueDate).getTime())) {
//         await session.abortTransaction();
//         return res.status(400).json({
//           hasError: true,
//           message: `Invalid dueDate in installment ${inst.installmentName}.`
//         });
//       }

//       for (const feeItem of inst.feeItems) {
//         if (!feeItem.feeTypeId || typeof feeItem.amount !== 'number' || typeof feeItem.payable !== 'number' || typeof feeItem.balance !== 'number') {
//           await session.abortTransaction();
//           return res.status(400).json({
//             hasError: true,
//             message: `Invalid feeItem in installment ${inst.installmentName}: feeTypeId, amount, payable, and balance are required.`
//           });
//         }
//       }
//     }

//     const newReceiptNumber = await getNextReceiptNumber(schoolId, session);

//     const processedInstallments = await Promise.all(
//       installments.map(async (inst, index) => {
//         const feeItems = await Promise.all(
//           inst.feeItems.map(async (feeItem) => {
//             const existingReceipt = await SchoolFees.findOne(
//               {
//                 schoolId,
//                 studentAdmissionNumber,
//                 academicYear,
//                 'installments.installmentName': inst.installmentName,
//                 'installments.feeItems.feeTypeId': feeItem.feeTypeId
//               },
//               { 'installments.$': 1 },
//               { session }
//             );

//             const concession = existingReceipt ? 0 : (feeItem.concession ?? 0);

//             return {
//               feeTypeId: feeItem.feeTypeId,
//               amount: feeItem.amount,
//               concession,
//               payable: feeItem.payable,
//               paid: feeItem.paid ?? 0,
//               balance: feeItem.balance,
//               cancelledPaidAmount: feeItem.cancelledPaidAmount ?? 0
//             };
//           })
//         );

//         return {
//           number: inst.number ?? index + 1,
//           installmentName: inst.installmentName,
//           dueDate: new Date(inst.dueDate),
//           excessAmount: inst.excessAmount ?? 0,
//           fineAmount: inst.fineAmount ?? 0,
//           feeItems
//         };
//       })
//     );

//     const newSchoolFees = new SchoolFees({
//       schoolId,
//       studentAdmissionNumber,
//       firstName,
//       lastName,
//       className,
//       section,
//       receiptNumber: newReceiptNumber,
//       transactionNumber,
//       paymentMode,
//       collectorName,
//       academicYear,
//       chequeNumber,
//       bankName,
//       paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
//       installments: processedInstallments
//     });

//     await newSchoolFees.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       hasError: false,
//       message: 'New school fee record created successfully.',
//       receipt: newSchoolFees
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error('Error in school fee API:', error);
//     return res.status(500).json({
//       hasError: true,
//       message: 'Internal server error while saving fee receipt.',
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
      firstName,
      lastName,
      className,
      section,
      transactionNumber,
      paymentMode,
      collectorName,
      academicYear,
      installments,
      chequeNumber,
      bankName,
      paymentDate
    } = req.body;

    // --- Validations ---
    if (!studentAdmissionNumber || !firstName || !lastName || !className || !section || !paymentMode || !collectorName || !academicYear) {
      await session.abortTransaction();
      return res.status(400).json({
        hasError: true,
        message: 'Missing required fields: studentAdmissionNumber, firstName, lastName, className, section, paymentMode, collectorName, or academicYear.'
      });
    }

    if (!Array.isArray(installments) || installments.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        hasError: true,
        message: 'Installments data is required and must be a non-empty array.'
      });
    }

    const receipts = [];

    // --- Process each installment separately ---
    for (const [index, inst] of installments.entries()) {
      if (!inst.installmentName || !inst.dueDate || !Array.isArray(inst.feeItems) || inst.feeItems.length === 0) {
        await session.abortTransaction();
        return res.status(400).json({
          hasError: true,
          message: `Invalid installment at position ${index + 1}. Each must have installmentName, dueDate, and feeItems array.`
        });
      }

      const newReceiptNumber = await getNextReceiptNumber(schoolId, session);

      const feeItems = inst.feeItems.map((feeItem) => ({
        feeTypeId: feeItem.feeTypeId,
        amount: feeItem.amount,
        concession: feeItem.concession ?? 0,
        payable: feeItem.payable,
        paid: feeItem.paid ?? 0,
        balance: feeItem.balance,
        cancelledPaidAmount: feeItem.cancelledPaidAmount ?? 0
      }));

      const newSchoolFees = new SchoolFees({
        schoolId,
        studentAdmissionNumber,
        firstName,
        lastName,
        className,
        section,
        receiptNumber: newReceiptNumber,
        transactionNumber,
        paymentMode,
        collectorName,
        academicYear,
        chequeNumber,
        bankName,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        installments: [
          {
            number: inst.number ?? index + 1,
            installmentName: inst.installmentName,
            dueDate: new Date(inst.dueDate),
            excessAmount: inst.excessAmount ?? 0,
            fineAmount: inst.fineAmount ?? 0,
            feeItems
          }
        ]
      });

      await newSchoolFees.save({ session });
      receipts.push(newSchoolFees);
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: 'Fee receipts created successfully for all installments.',
      receipts
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in school fee API:', error);
    return res.status(500).json({
      hasError: true,
      message: 'Internal server error while saving fee receipts.',
      error: error.message
    });
  }
};

export default schoolFees;
