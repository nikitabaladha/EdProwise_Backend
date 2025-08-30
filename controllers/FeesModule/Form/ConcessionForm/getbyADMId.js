
// import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// import FeesType from "../../../../models/FeesModule/FeesType.js";
// import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import Fine from "../../../../models/FeesModule/Fine.js";
// import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";

// export const getAllFeesInstallmentsWithConcession = async (req, res) => {
//   try {
//     const { schoolId, admissionNumber } = req.query;
//     if (!schoolId || !admissionNumber) {
//       return res.status(400).json({
//         message: "schoolId and admissionNumber are required",
//       });
//     }

//     const admissionData = await AdmissionForm.findOne({
//       AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
//       schoolId,
//     });
//     if (!admissionData) {
//       return res.status(404).json({ message: "Admission data not found" });
//     }

//     const academicHistory = admissionData.academicHistory || [];
//     if (!academicHistory.length) {
//       return res.status(404).json({ message: "No academic history found for the student" });
//     }

//     const result = [];

//     for (const history of academicHistory) {
//       const { academicYear, masterDefineClass, section } = history;

//       const feeTypes = await FeesType.find({ academicYear });
//       const feeTypeMap = feeTypes.reduce((acc, type) => {
//         acc[type._id.toString()] = type.name;
//         return acc;
//       }, {});


//       const feesStructures = await FeesStructure.find({
//         schoolId,
//         classId: masterDefineClass,
//         sectionIds: { $in: [section] },
//         academicYear,
//       }).lean();

//       if (!feesStructures.length) continue;


//       const concessionForm = await ConcessionFormModel.findOne({
//         AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
//         academicYear,
//       });
//       const fineData = await Fine.findOne({ schoolId, academicYear });
//       const allPaidFeesData = await SchoolFees.find({
//         schoolId,
//         studentAdmissionNumber: admissionNumber,
//         academicYear,
//       }).lean();

//       let totalFeesAmount = 0;
//       let totalConcession = 0;
//       let totalFine = 0;
//       let totalFeesPayable = 0;
//       let totalPaidAmount = 0;
//       let totalRemainingAmount = 0;
//       const feeInstallments = [];
//       const paidInstallments = [];
//       let hasUnpaidFees = false;
//       const cumulativePaidMap = {};

//       for (const structure of feesStructures) {
//         for (let i = 0; i < structure.installments.length; i++) {
//           const inst = structure.installments[i];
//           const instNumber = inst.number !== undefined ? inst.number : i + 1;
//           let totalBalanceForInstallment = 0;

//           for (const fee of inst.fees) {
//             const feeAmount = fee.amount || 0;
//             let concessionAmount = 0;
//             let paidAmount = 0;

//             if (concessionForm?.concessionDetails?.length) {
//               const concessionMatch = concessionForm.concessionDetails.find(
//                 (c) =>
//                   c.installmentName === inst.name &&
//                   c.feesType.toString() === fee.feesTypeId.toString()
//               );
//               if (concessionMatch) {
//                 concessionAmount = concessionMatch.concessionAmount || 0;
//               }
//             }

//             allPaidFeesData.forEach((payment) => {
//               const matchingInst = payment?.installments?.find(
//                 (instData) => instData.installmentName === inst.name
//               );
//               const matchingFeeItem = matchingInst?.feeItems?.find(
//                 (item) => item.feeTypeId.toString() === fee.feesTypeId.toString()
//               );
//               if (matchingFeeItem) {
//                 paidAmount += matchingFeeItem.paid || 0;
//               }
//             });

//             const balanceAmount = feeAmount - concessionAmount - paidAmount;
//             totalBalanceForInstallment += balanceAmount;
//           }

//           for (const fee of inst.fees) {
//             const feeAmount = fee.amount || 0;
//             let concessionAmount = 0;
//             let fineAmount = 0;
//             let paidAmount = 0;

//             if (concessionForm?.concessionDetails?.length) {
//               const concessionMatch = concessionForm.concessionDetails.find(
//                 (c) =>
//                   c.installmentName === inst.name &&
//                   c.feesType.toString() === fee.feesTypeId.toString()
//               );
//               if (concessionMatch) {
//                 concessionAmount = concessionMatch.concessionAmount || 0;
//               }
//             }

//             // const dueDate = new Date(inst.dueDate);
//             // const today = new Date();
//             // if (totalBalanceForInstallment > 0 && today > dueDate && fineData) {
//             //   const { feeType, frequency, value, maxCapFee } = fineData;
//             //   const base = feeType === "percentage" ? (feeAmount * value) / 100 : value;
//             //   let multiplier = 0;
//             //   const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
//             //   const monthsLate =
//             //     today.getMonth() - dueDate.getMonth() +
//             //     12 * (today.getFullYear() - dueDate.getFullYear());
//             //   const yearsLate = today.getFullYear() - dueDate.getFullYear();
//             //   switch (frequency) {
//             //     case "Daily":
//             //       multiplier = daysLate;
//             //       break;
//             //     case "Monthly":
//             //       multiplier = monthsLate;
//             //       break;
//             //     case "Annually":
//             //       multiplier = yearsLate;
//             //       break;
//             //     case "Fixed":
//             //       multiplier = 1;
//             //       break;
//             //   }
//             //   fineAmount = base * multiplier;
//             //   if (maxCapFee) {
//             //     fineAmount = Math.min(fineAmount, maxCapFee);
//             //   }
//             // }

//             const dueDate = new Date(inst.dueDate);
//             const today = new Date();
//             if (totalBalanceForInstallment > 0 && today > dueDate && fineData) {
//               const { feeType, frequency, value, maxCapFee } = fineData;
//               const base = feeType === "percentage" ? (feeAmount * value) / 100 : value;
//               let multiplier = 0;
//               const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
//               const monthsLate =
//                 today.getMonth() - dueDate.getMonth() +
//                 12 * (today.getFullYear() - dueDate.getFullYear());
//               const yearsLate = today.getFullYear() - dueDate.getFullYear();
//               const weeksLate = Math.floor(daysLate / 7); 

//               switch (frequency) {
//                 case "Daily":
//                   multiplier = daysLate;
//                   break;
//                 case "Weekly":
//                   multiplier = weeksLate;
//                   break;
//                 case "Monthly":
//                   multiplier = monthsLate;
//                   break;
//                 case "Annually":
//                   multiplier = yearsLate;
//                   break;
//                 case "Fixed":
//                   multiplier = 1;
//                   break;
//               }
//               fineAmount = base * multiplier;
//               if (maxCapFee) {
//                 fineAmount = Math.min(fineAmount, maxCapFee);
//               }
//             }

//             allPaidFeesData.forEach((payment) => {
//               const matchingInst = payment?.installments?.find(
//                 (instData) => instData.installmentName === inst.name
//               );
//               const matchingFeeItem = matchingInst?.feeItems?.find(
//                 (item) => item.feeTypeId.toString() === fee.feesTypeId.toString()
//               );
              
//               if (matchingFeeItem) {
//                 const individualPaid = matchingFeeItem.paid || 0;
//                 paidAmount += individualPaid;
//                 const key = `${inst.name}_${fee.feesTypeId}`;
//                 cumulativePaidMap[key] = (cumulativePaidMap[key] || 0) + individualPaid;
//                 const totalPaidSoFar = cumulativePaidMap[key];
//                 paidInstallments.push({
//                   _id: matchingInst._id,
//                   feesTypeId: {
//                     _id: matchingFeeItem.feeTypeId,
//                     name: feeTypeMap[matchingFeeItem.feeTypeId.toString()],
//                   },
//                   installmentName: inst.name,
//                   paidAmount: individualPaid,
//                   receiptNumber: payment.receiptNumber,
//                   paymentDate: payment.paymentDate,
//                   collectorName: payment.collectorName,
//                   paymentMode: payment.paymentMode,
//                   chequeNumber: payment.chequeNumber,
//                   bankName: payment.bankName,
//                    status:payment.status,
//                   transactionNumber: payment.transactionNumber,
//                   amount: fee.amount || 0,
//                   concession: concessionAmount || 0,
//                   fineAmount: fineAmount || 0,
//                   excessAmount: matchingInst?.excessAmount || 0,
//                   paidFine: matchingInst?.fineAmount || 0,
//                   payable: (fee.amount || 0) - (concessionAmount || 0),
//                   paid: individualPaid,
//                   balance: ((fee.amount || 0) - (concessionAmount || 0)) - totalPaidSoFar,
                 
//                 });
//               }
//             });

//             const balanceAmount = feeAmount - concessionAmount - paidAmount;
//             if (balanceAmount > 0) {
//               hasUnpaidFees = true;
//             }

//             totalFeesAmount += feeAmount;
//             totalConcession += concessionAmount;
//             totalFine += fineAmount;
//             totalFeesPayable += balanceAmount;
//             totalPaidAmount += paidAmount;
//             totalRemainingAmount += balanceAmount;

//             feeInstallments.push({
//               feesTypeId: {
//                 _id: fee.feesTypeId,
//                 name: feeTypeMap[fee.feesTypeId.toString()],
//               },
//               installmentName: inst.name,
//               dueDate: inst.dueDate,
//               amount: feeAmount,
//               concessionAmount,
//               fineAmount,
//               paidAmount,
//               balanceAmount,
//             });
//           }
//         }
//       }

//       result.push({
//         academicYear,
//         classId: masterDefineClass,
//         sectionId: section,
//         feeInstallments,
//         finePolicy: fineData || null,
//         concession: concessionForm || null,
//         paidInstallments,
//         totals: {
//           totalFeesAmount,
//           totalConcession,
//           totalFine,
//           totalFeesPayable,
//           totalPaidAmount,
//           totalRemainingAmount,
//         },
//         installmentsPresent: Array.from(
//           new Set(feeInstallments.map((item) => item.installmentName))
//         ).sort(),
//       });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ message: "No fee data found for any academic year" });
//     }

//     res.status(200).json({
//       data: result,
//       admissionDetails: {
//         firstName: admissionData?.firstName,
//         lastName: admissionData?.lastName,
//         AdmissionNumber: admissionData?.AdmissionNumber,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export default getAllFeesInstallmentsWithConcession;


import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import Fine from "../../../../models/FeesModule/Fine.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";

export const getAllFeesInstallmentsWithConcession = async (req, res) => {
  try {
    const { schoolId, admissionNumber } = req.query;
    if (!schoolId || !admissionNumber) {
      return res.status(400).json({
        message: "schoolId and admissionNumber are required",
      });
    }

    const admissionData = await AdmissionForm.findOne({
      AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
      schoolId,
    });
    if (!admissionData) {
      return res.status(404).json({ message: "Admission data not found" });
    }

    const academicHistory = admissionData.academicHistory || [];
    if (!academicHistory.length) {
      return res.status(404).json({ message: "No academic history found for the student" });
    }

    const result = [];

    for (const history of academicHistory) {
      const { academicYear, masterDefineClass, section } = history;

      const feeTypes = await FeesType.find({ academicYear });
      const feeTypeMap = feeTypes.reduce((acc, type) => {
        acc[type._id.toString()] = type.name;
        return acc;
      }, {});

      const feesStructures = await FeesStructure.find({
        schoolId,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
        academicYear,
      }).lean();

      if (!feesStructures.length) continue;

      const concessionForm = await ConcessionFormModel.findOne({
        AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
        academicYear,
        status: "Approved",
      });
      const fineData = await Fine.findOne({ schoolId, academicYear });
      const allPaidFeesData = await SchoolFees.find({
        schoolId,
        studentAdmissionNumber: admissionNumber,
        academicYear,
      }).lean();

      let totalFeesAmount = 0;
      let totalConcession = 0;
      let totalFine = 0;
      let totalFeesPayable = 0;
      let totalPaidAmount = 0;
      let totalRemainingAmount = 0;
      const feeInstallments = [];
      const paidInstallments = [];
      let hasUnpaidFees = false;
      const cumulativePaidMap = {};

      for (const structure of feesStructures) {
        for (let i = 0; i < structure.installments.length; i++) {
          const inst = structure.installments[i];
          const instNumber = inst.number !== undefined ? inst.number : i + 1;
          let totalBalanceForInstallment = 0;

          for (const fee of inst.fees) {
            const feeAmount = fee.amount || 0;
            let concessionAmount = 0;
            let paidAmount = 0;

            if (concessionForm?.concessionDetails?.length) {
              const concessionMatch = concessionForm.concessionDetails.find(
                (c) =>
                  c.installmentName === inst.name &&
                  c.feesType.toString() === fee.feesTypeId.toString()
              );
              if (concessionMatch) {
                concessionAmount = concessionMatch.concessionAmount || 0;
              }
            }

            allPaidFeesData.forEach((payment) => {
              const matchingInst = payment?.installments?.find(
                (instData) => instData.installmentName === inst.name
              );
              const matchingFeeItem = matchingInst?.feeItems?.find(
                (item) => item.feeTypeId.toString() === fee.feesTypeId.toString()
              );
              if (matchingFeeItem) {
                const effectivePaid = (matchingFeeItem.paid || 0) - (matchingFeeItem.cancelledPaidAmount || 0);
                paidAmount += effectivePaid > 0 ? effectivePaid : 0;
              }
            });

            const balanceAmount = feeAmount - concessionAmount - paidAmount;
            totalBalanceForInstallment += balanceAmount;
          }

          // Second pass: Process fees with fine and payment details
          for (const fee of inst.fees) {
            const feeAmount = fee.amount || 0;
            let concessionAmount = 0;
            let fineAmount = 0;
            let paidAmount = 0;

            if (concessionForm?.concessionDetails?.length) {
              const concessionMatch = concessionForm.concessionDetails.find(
                (c) =>
                  c.installmentName === inst.name &&
                  c.feesType.toString() === fee.feesTypeId.toString()
              );
              if (concessionMatch) {
                concessionAmount = concessionMatch.concessionAmount || 0;
              }
            }

            // const dueDate = new Date(inst.dueDate);
            // const today = new Date();
            // if (totalBalanceForInstallment > 0 && fineData) {
            //   const fineStartDate = new Date(dueDate);
            //   fineStartDate.setDate(dueDate.getDate() + 1);

            //   if (today >= fineStartDate) {
            //     const { feeType, frequency, value, maxCapFee } = fineData;
            //     const base = feeType === "percentage" ? (feeAmount * value) / 100 : value;
            //     let multiplier = 0;

            //     const daysLate = Math.floor((today - fineStartDate) / (1000 * 60 * 60 * 24));
            //     const weeksLate = Math.floor(daysLate / 7);
            //     const monthsLate =
            //       today.getMonth() -
            //       fineStartDate.getMonth() +
            //       12 * (today.getFullYear() - fineStartDate.getFullYear());
            //     const yearsLate = today.getFullYear() - fineStartDate.getFullYear();

            //     switch (frequency) {
            //       case "Daily":
            //         multiplier = daysLate;
            //         break;
            //       case "Weekly":
            //         multiplier = weeksLate;
            //         break;
            //       case "Monthly":
            //         multiplier = monthsLate;
            //         break;
            //       case "Annually":
            //         multiplier = yearsLate;
            //         break;
            //       case "Fixed":
            //         multiplier = 1;
            //         break;
            //     }
            //     fineAmount = base * multiplier;
            //     if (maxCapFee) {
            //       fineAmount = Math.min(fineAmount, maxCapFee);
            //     }
            //   }
            // }

            const dueDate = new Date(inst.dueDate);
dueDate.setHours(0, 0, 0, 0); 
const fineStartDate = new Date(dueDate); 
const today = new Date();
today.setHours(0, 0, 0, 0); 
if (totalBalanceForInstallment > 0 && fineData) {
  if (today >= fineStartDate) {
    const { feeType, frequency, value, maxCapFee } = fineData;
    const base = feeType === "percentage" ? (feeAmount * value) / 100 : value;
    let multiplier = 0;

    const daysLate = Math.floor((today - fineStartDate) / (1000 * 60 * 60 * 24));
    const weeksLate = Math.floor(daysLate / 7);
    const monthsLate =
      today.getMonth() -
      fineStartDate.getMonth() +
      12 * (today.getFullYear() - fineStartDate.getFullYear());
    const yearsLate = today.getFullYear() - fineStartDate.getFullYear();

    switch (frequency) {
      case "Daily":
        multiplier = daysLate;
        break;
      case "Weekly":
        multiplier = weeksLate;
        break;
      case "Monthly":
        multiplier = monthsLate;
        break;
      case "Annually":
        multiplier = yearsLate;
        break;
      case "Fixed":
        multiplier = 1;
        break;
    }
    fineAmount = base * multiplier;
    if (maxCapFee) {
      fineAmount = Math.min(fineAmount, maxCapFee);
    }
  }
}

            allPaidFeesData.forEach((payment) => {
              const matchingInst = payment?.installments?.find(
                (instData) => instData.installmentName === inst.name
              );
              const matchingFeeItem = matchingInst?.feeItems?.find(
                (item) => item.feeTypeId.toString() === fee.feesTypeId.toString()
              );

              if (matchingFeeItem) {
                const individualPaid = (matchingFeeItem.paid || 0) -(matchingFeeItem.cancelledPaidAmount ||0);
                if (individualPaid > 0) {
                  paidAmount += individualPaid;
                  const key = `${inst.name}_${fee.feesTypeId}`;
                  cumulativePaidMap[key] = (cumulativePaidMap[key] || 0) + individualPaid;
                  const totalPaidSoFar = cumulativePaidMap[key];
                  paidInstallments.push({
                    _id: matchingInst._id,
                    feesTypeId: {
                      _id: matchingFeeItem.feeTypeId,
                      name: feeTypeMap[matchingFeeItem.feeTypeId.toString()],
                    },
                    installmentName: inst.name,
                    paidAmount: individualPaid,
                    receiptNumber: payment.receiptNumber,
                    paymentDate: payment.paymentDate,
                    collectorName: payment.collectorName,
                    paymentMode: payment.paymentMode,
                    chequeNumber: payment.chequeNumber,
                    bankName: payment.bankName,
                    status: payment.status,
                    transactionNumber: payment.transactionNumber,
                    amount: fee.amount || 0,
                    concession: concessionAmount || 0,
                    fineAmount: fineAmount || 0,
                    excessAmount: matchingInst?.excessAmount || 0,
                    paidFine: matchingInst?.fineAmount || 0,
                    payable: (fee.amount || 0) - (concessionAmount || 0),
                    paid: individualPaid,
                    balance: ((fee.amount || 0) - (concessionAmount || 0)) - totalPaidSoFar,
                    cancelledPaidAmount: matchingFeeItem.cancelledPaidAmount || 0,
                  });
                }
              }
            });

            const balanceAmount = feeAmount - concessionAmount - paidAmount;
            if (balanceAmount > 0) {
              hasUnpaidFees = true;
            }

            totalFeesAmount += feeAmount;
            totalConcession += concessionAmount;
            totalFine += fineAmount;
            totalFeesPayable += balanceAmount;
            totalPaidAmount += paidAmount;
            totalRemainingAmount += balanceAmount;

            feeInstallments.push({
              feesTypeId: {
                _id: fee.feesTypeId,
                name: feeTypeMap[fee.feesTypeId.toString()],
              },
              installmentName: inst.name,
              dueDate: inst.dueDate,
              amount: feeAmount,
              concessionAmount,
              fineAmount,
              paidAmount,
              balanceAmount,
              cancelledPaidAmount: fee.cancelledPaidAmount || 0, // Include for transparency
            });
          }
        }
      }

      result.push({
        academicYear,
        classId: masterDefineClass,
        sectionId: section,
        feeInstallments,
        finePolicy: fineData || null,
        concession: concessionForm || null,
        paidInstallments,
        totals: {
          totalFeesAmount,
          totalConcession,
          totalFine,
          totalFeesPayable,
          totalPaidAmount,
          totalRemainingAmount,
        },
        installmentsPresent: Array.from(
          new Set(feeInstallments.map((item) => item.installmentName))
        ).sort(),
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No fee data found for any academic year" });
    }

    res.status(200).json({
      data: result,
      admissionDetails: {
        firstName: admissionData?.firstName,
        lastName: admissionData?.lastName,
        AdmissionNumber: admissionData?.AdmissionNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getAllFeesInstallmentsWithConcession;