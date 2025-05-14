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
import SchoolFees from '../../../../models/FeesModule/SchoolFees.js';

const schoolFees = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
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
      receiptNumber,
      transactionNumber,
      paymentMode,
      collectorName,
      academicYear,
      bankName, 
      installments
    } = req.body;

    if (!Array.isArray(installments) || installments.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: 'Installments data is required and must be a non-empty array.'
      });
    }

   
    if (paymentMode === 'Cheque' && !bankName) {
      return res.status(400).json({
        hasError: true,
        message: 'Bank name is required for Cheque payments.'
      });
    }

    
    const processedInstallments = installments.map((inst, index) => {
      const uniqueFeeItems = [];
      const seenFeeTypeIds = new Set();

      inst.feeItems.forEach((feeItem) => {
        if (!seenFeeTypeIds.has(feeItem.feeTypeId)) {
          seenFeeTypeIds.add(feeItem.feeTypeId);
          uniqueFeeItems.push(feeItem);
        } else {
          console.warn(`Duplicate feeTypeId ${feeItem.feeTypeId} found in installment ${inst.number}`);
        }
      });

      return {
        ...inst,
        number: inst.number ?? index + 1,
        feeItems: uniqueFeeItems
      };
    });

   
    const existingReceipt = await SchoolFees.findOne({
      schoolId,
      studentAdmissionNumber,
      academicYear,
      receiptNumber
    });

    if (existingReceipt) {
      return res.status(400).json({
        hasError: true,
        message: 'Receipt with this number already exists for this academic year.'
      });
    }

 
    const existingYearRecord = await SchoolFees.findOne({
      schoolId,
      studentAdmissionNumber,
      academicYear
    });

    if (existingYearRecord) {
      processedInstallments.forEach((newInstallment) => {
        const existingInstallment = existingYearRecord.installments.find(
          (inst) => inst.number === newInstallment.number
        );

        if (existingInstallment) {
        
          const updatedFeeItems = [];
          const seenFeeTypeIds = new Set();

          
          newInstallment.feeItems.forEach((newFeeItem) => {
            const existingFeeItems = existingInstallment.feeItems.filter(
              (item) => item.feeTypeId.toString() === newFeeItem.feeTypeId
            );

            if (existingFeeItems.length > 0) {
       
              existingFeeItems[0].amount = newFeeItem.amount;
              existingFeeItems[0].concession = newFeeItem.concession;
              existingFeeItems[0].fineAmount = newFeeItem.fineAmount;
              existingFeeItems[0].payable = newFeeItem.payable;
              existingFeeItems[0].paid = newFeeItem.paid;
              existingFeeItems[0].balance = newFeeItem.balance;
              updatedFeeItems.push(existingFeeItems[0]);
              seenFeeTypeIds.add(newFeeItem.feeTypeId);

              
              if (existingFeeItems.length > 1) {
                console.warn(`Found ${existingFeeItems.length} duplicates for feeTypeId ${newFeeItem.feeTypeId} in installment ${newInstallment.number}`);
              }
            } else {
              
              updatedFeeItems.push(newFeeItem);
              seenFeeTypeIds.add(newFeeItem.feeTypeId);
            }
          });

         
          existingInstallment.feeItems.forEach((existingFeeItem) => {
            if (!seenFeeTypeIds.has(existingFeeItem.feeTypeId.toString())) {
              updatedFeeItems.push(existingFeeItem);
              seenFeeTypeIds.add(existingFeeItem.feeTypeId.toString());
            }
          });

          existingInstallment.feeItems = updatedFeeItems;
        } else {
         
          existingYearRecord.installments.push(newInstallment);
        }
      });

      existingYearRecord.receiptNumber = receiptNumber;
      existingYearRecord.transactionNumber = transactionNumber;
      existingYearRecord.paymentMode = paymentMode;
      existingYearRecord.collectorName = collectorName;
      existingYearRecord.bankName = bankName;

      await existingYearRecord.save();

      return res.status(200).json({
        hasError: false,
        message: 'School fee receipt updated successfully for this academic year.',
        receipt: existingYearRecord
      });
    }


    const newSchoolFees = new SchoolFees({
      schoolId,
      studentAdmissionNumber,
      studentName,
      className,
      section,
      receiptNumber,
      transactionNumber,
      paymentMode,
      collectorName,
      academicYear,
      bankName, 
      installments: processedInstallments
    });

    await newSchoolFees.save();

    return res.status(201).json({
      hasError: false,
      message: 'New school fee receipt created successfully for new academic year.',
      receipt: newSchoolFees
    });

  } catch (error) {
    console.error('Error saving school fee receipt:', error);
    res.status(500).json({
      hasError: true,
      message: 'Error saving school fee receipt',
      error: error.message
    });
  }
};

export default schoolFees;