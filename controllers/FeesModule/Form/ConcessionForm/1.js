



  // import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
  // import FeesType from "../../../../models/FeesModule/FeesType.js";
  // import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
  // import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
  // import Fine from "../../../../models/FeesModule/Fine.js";
  // import SchoolFees from "../../../../models/FeesModule/SchoolFees.js";
  
  // export const getAllFeesInstallmentsWithConcession = async (req, res) => {
  //   try {
  //     const { classId, sectionIds, schoolId, admissionNumber } = req.query;
  
    
  //     if (!classId || !sectionIds || !schoolId || !admissionNumber) {
  //       return res.status(400).json({
  //         message: "classId, sectionIds, schoolId, and admissionNumber are required",
  //       });
  //     }
  
 
  //     const sectionIdArray = Array.isArray(sectionIds) ? sectionIds : [sectionIds];
  

  //     const feeTypes = await FeesType.find();
  //     const feeTypeMap = feeTypes.reduce((acc, type) => {
  //       acc[type._id.toString()] = type.name;
  //       return acc;
  //     }, {});
  

  //     const feesStructures = await FeesStructure.find({
  //       schoolId,
  //       classId,
  //       sectionIds: { $in: sectionIdArray },
  //     }).lean();
  
  //     if (!feesStructures.length) {
  //       return res.status(404).json({ message: "No fee structure found." });
  //     }

  //     const concessionForm = await ConcessionFormModel.findOne({
  //       AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
  //     });
  

  //     const admissionData = await AdmissionForm.findOne({ AdmissionNumber: admissionNumber }).lean();
  

  //     const fineData = await Fine.findOne({ schoolId });
  
  //     const today = new Date();
  
  //     let totalFeesAmount = 0;
  //     let totalConcession = 0;
  //     let totalFine = 0;
  //     let totalFeesPayable = 0;
  //     const feeInstallments = [];
  
   
  //     const paidFeesData = await SchoolFees.findOne({ schoolId, studentAdmissionNumber: admissionNumber }).lean();
  
   
  

  //     for (const structure of feesStructures) {
  //       for (let i = 0; i < structure.installments.length; i++) {
  //         const inst = structure.installments[i];
  //         const instNumber = inst.number ?? (i + 1); 
  
     
  //         for (const fee of inst.fees) {
  //           const feeAmount = fee.amount || 0;
  //           let concessionAmount = 0;
  //           let fineAmount = 0;
  

  //           if (concessionForm?.concessionDetails?.length) {
  //             const concessionMatch = concessionForm.concessionDetails.find(
  //               (c) =>
  //                 c.installmentName === inst.name &&
  //                 c.feesType.toString() === fee.feesTypeId.toString()
  //             );
  //             if (concessionMatch) {
  //               concessionAmount = concessionMatch.concessionAmount || 0;
  //             }
  //           }
  
  //           const dueDate = new Date(inst.dueDate);
  //           if (today > dueDate && fineData) {
  //             const { feeType, frequency, value, maxCapFee } = fineData;
  
  //             const base = feeType === "percentage" ? (feeAmount * value) / 100 : value;
  
  //             let multiplier = 0;
  //             const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  //             const monthsLate =
  //               today.getMonth() - dueDate.getMonth() + 12 * (today.getFullYear() - dueDate.getFullYear());
  //             const yearsLate = today.getFullYear() - dueDate.getFullYear();
  
  //             switch (frequency) {
  //               case "Daily":
  //                 multiplier = daysLate;
  //                 break;
  //               case "Monthly":
  //                 multiplier = monthsLate;
  //                 break;
  //               case "Annually":
  //                 multiplier = yearsLate;
  //                 break;
  //               case "Fixed":
  //                 multiplier = 1;
  //                 break;
  //             }
  
  //             fineAmount = base * multiplier;
  //             if (maxCapFee) {
  //               fineAmount = Math.min(fineAmount, maxCapFee);
  //             }
  //           }
  
 
  //           const paidAmount = paidFeesData?.installments
  //             ?.find(instData => instData.number === instNumber) 
  //             ?.feeItems
  //             ?.find(feeItem => feeItem.feeTypeId.toString() === fee.feesTypeId.toString())?.paid || 0;
  
  
      
  //           const balanceAmount = feeAmount - concessionAmount + fineAmount - paidAmount;
  
          
  
  //           totalFeesAmount += feeAmount;
  //           totalConcession += concessionAmount;
  //           totalFine += fineAmount;
  //           totalFeesPayable += balanceAmount;
  
  //           if (balanceAmount <= 0) continue; 
  //           feeInstallments.push({
  //             feesTypeId: {
  //               _id: fee.feesTypeId,
  //               name: feeTypeMap[fee.feesTypeId.toString()],
  //             },
  //             installmentName: inst.name,
  //             dueDate: inst.dueDate,
  //             amount: feeAmount,
  //             concessionAmount,
  //             fineAmount,
  //             paidAmount,
  //             balanceAmount,
  //           });
  //         }
  //       }
  //     }
  
 
  //     res.status(200).json({
  //       data: {
  //         admissionDetails: {
  //           firstName: admissionData?.firstName,
  //           lastName: admissionData?.lastName,
  //           applicationDate: admissionData?.applicationDate,
  //           AdmissionNumber: admissionData?.AdmissionNumber,
  //         },
  //         feeInstallments,
  //         finePolicy: fineData || null,
  //         concession: concessionForm || null,
  //         totals: {
  //           totalFeesAmount,
  //           totalConcession,
  //           totalFine,
  //           totalFeesPayable,
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     res.status(500).json({ message: "Server error" });
  //   }
  // };
  
  // export default getAllFeesInstallmentsWithConcession;
  
// import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// import FeesType from "../../../../models/FeesModule/FeesType.js";
// import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import Fine from "../../../../models/FeesModule/Fine.js";
// import {SchoolFees} from "../../../../models/FeesModule/SchoolFees.js";

// export const getAllFeesInstallmentsWithConcession = async (req, res) => {
//   try {
//     const { classId, sectionIds, schoolId, admissionNumber } = req.query;

//     if (!classId || !sectionIds || !schoolId || !admissionNumber) {
//       return res.status(400).json({
//         message: "classId, sectionIds, schoolId, and admissionNumber are required",
//       });
//     }

//     const sectionIdArray = Array.isArray(sectionIds) ? sectionIds : [sectionIds];

  
//     const admissionData = await AdmissionForm.findOne({
//       AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
//       schoolId,
//     });

//     if (!admissionData) {
//       return res.status(404).json({ message: "Admission data not found" });
//     }

//     const allAcademicYears = await FeesStructure.distinct("academicYear", {
//       schoolId,
//       classId,
//       sectionIds: { $in: sectionIdArray },
//     });

//     const result = [];

//     for (const academicYear of allAcademicYears) {
//       const feeTypes = await FeesType.find({ academicYear });
//       const feeTypeMap = feeTypes.reduce((acc, type) => {
//         acc[type._id.toString()] = type.name;
//         return acc;
//       }, {});

//       const feesStructures = await FeesStructure.find({
//         schoolId,
//         classId,
//         sectionIds: { $in: sectionIdArray },
//         academicYear
//       }).lean();

//       if (!feesStructures.length) continue;

//       const concessionForm = await ConcessionFormModel.findOne({
//         AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
//         academicYear
//       });

//       const fineData = await Fine.findOne({ schoolId, academicYear });

//       const paidFeesData = await SchoolFees.findOne({
//         schoolId,
//         studentAdmissionNumber: admissionNumber,
//         academicYear
//       }).lean();

//       let totalFeesAmount = 0;
//       let totalConcession = 0;
//       let totalFine = 0;
//       let totalFeesPayable = 0;
//       const feeInstallments = [];
//       let hasUnpaidFees = false;

//       for (const structure of feesStructures) {
//         for (let i = 0; i < structure.installments.length; i++) {
//           const inst = structure.installments[i];
//           const instNumber = inst.number ?? (i + 1);

//           for (const fee of inst.fees) {
//             const feeAmount = fee.amount || 0;
//             let concessionAmount = 0;
//             let fineAmount = 0;

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

//             const dueDate = new Date(inst.dueDate);
//             const today = new Date();
//             if (today > dueDate && fineData) {
//               const { feeType, frequency, value, maxCapFee } = fineData;

//               const base = feeType === "percentage"
//                 ? (feeAmount * value) / 100
//                 : value;

//               let multiplier = 0;
//               const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
//               const monthsLate =
//                 today.getMonth() - dueDate.getMonth() +
//                 12 * (today.getFullYear() - dueDate.getFullYear());
//               const yearsLate = today.getFullYear() - dueDate.getFullYear();

//               switch (frequency) {
//                 case "Daily":
//                   multiplier = daysLate;
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

//             const paidAmount =
//               paidFeesData?.installments
//                 ?.find(instData => instData.number === instNumber)
//                 ?.feeItems
//                 ?.find(feeItem => feeItem.feeTypeId.toString() === fee.feesTypeId.toString())?.paid || 0;

//             const balanceAmount = feeAmount - concessionAmount + fineAmount - paidAmount;

//             if (balanceAmount > 0) {
//               hasUnpaidFees = true;
//             }

//             totalFeesAmount += feeAmount;
//             totalConcession += concessionAmount;
//             totalFine += fineAmount;
//             totalFeesPayable += balanceAmount;

//             if (balanceAmount <= 0) continue;

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

//       if (hasUnpaidFees) {
//         result.push({
//           academicYear,
//           feeInstallments,
//           finePolicy: fineData || null,
//           concession: concessionForm || null,
//           totals: {
//             totalFeesAmount,
//             totalConcession,
//             totalFine,
//             totalFeesPayable,
//           },
//           installmentsPresent: Array.from(
//             new Set(feeInstallments.map(item =>
//               parseInt(item.installmentName?.split(" ")[1]))
//             )
//           ).sort((a, b) => a - b)
//         });
//       }
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ message: "All fees are paid for all academic years" });
//     }

//     res.status(200).json({
//       data: result,
//       admissionDetails: {
//         firstName: admissionData?.firstName,
//         lastName: admissionData?.lastName,
//         AdmissionNumber: admissionData?.AdmissionNumber,
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export default getAllFeesInstallmentsWithConcession;
// import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// import FeesType from "../../../../models/FeesModule/FeesType.js";
// import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import Fine from "../../../../models/FeesModule/Fine.js";
// import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";

// export const getAllFeesInstallmentsWithConcession = async (req, res) => {
//   try {
//     const { classId, sectionIds, schoolId, admissionNumber } = req.query;

//     if (!classId || !sectionIds || !schoolId || !admissionNumber) {
//       return res.status(400).json({
//         message: "classId, sectionIds, schoolId, and admissionNumber are required",
//       });
//     }

//     const sectionIdArray = Array.isArray(sectionIds) ? sectionIds : [sectionIds];

//     const admissionData = await AdmissionForm.findOne({
//       AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
//       schoolId,
//     });

//     if (!admissionData) {
//       return res.status(404).json({ message: "Admission data not found" });
//     }

//     const allAcademicYears = await FeesStructure.distinct("academicYear", {
//       schoolId,
//       classId,
//       sectionIds: { $in: sectionIdArray },
//     });

//     const result = [];

//     for (const academicYear of allAcademicYears) {
//       const feeTypes = await FeesType.find({ academicYear });
//       const feeTypeMap = feeTypes.reduce((acc, type) => {
//         acc[type._id.toString()] = type.name;
//         return acc;
//       }, {});

//       const feesStructures = await FeesStructure.find({
//         schoolId,
//         classId,
//         sectionIds: { $in: sectionIdArray },
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
//       // Track paid installments to determine fine eligibility
//       const paidInstallmentNames = new Set();

//       // Collect paid installment names
//       allPaidFeesData.forEach((payment) => {
//         payment.installments?.forEach((instData) => {
//           if (instData.feeItems?.some((item) => item.paid > 0)) {
//             paidInstallmentNames.add(instData.installmentName);
//           }
//         });
//       });

//       // Debug: Log FeesStructure installments
//       console.log(`FeesStructure for ${academicYear}:`, feesStructures.map(s => s.installments));

//       for (const structure of feesStructures) {
//         for (let i = 0; i < structure.installments.length; i++) {
//           const inst = structure.installments[i];
//           const instNumber = inst.number !== undefined ? inst.number : i + 1;

//           // Calculate fine at the installment level
//           let fineAmount = 0;
//           const isPaid = paidInstallmentNames.has(inst.name);
//           if (!isPaid && fineData) {
//             const dueDate = new Date(inst.dueDate);
//             const today = new Date();
//             if (today > dueDate) {
//               const { feeType, frequency, value, maxCapFee } = fineData;
//               const base = feeType === "percentage" ? (inst.fees.reduce((sum, fee) => sum + (fee.amount || 0), 0) * value) / 100 : value;
//               let multiplier = 0;
//               const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
//               const monthsLate =
//                 today.getMonth() - dueDate.getMonth() +
//                 12 * (today.getFullYear() - dueDate.getFullYear());
//               const yearsLate = today.getFullYear() - dueDate.getFullYear();

//               switch (frequency) {
//                 case "Daily":
//                   multiplier = daysLate;
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
//           }

//           for (const fee of inst.fees) {
//             const feeAmount = fee.amount || 0;
//             let concessionAmount = 0;

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

//             let paidAmount = 0;

//             // Debug: Log SchoolFees installments
//             console.log(`SchoolFees for ${academicYear}:`, allPaidFeesData.map(p => p.installments));

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
//                   feesTypeId: {
//                     _id: matchingFeeItem.feeTypeId,
//                     name: feeTypeMap[matchingFeeItem.feeTypeId.toString()],
//                   },
//                   installmentNumber: instNumber,
//                   paidAmount: individualPaid,
//                   receiptNumber: payment.receiptNumber,
//                   paymentDate: payment.paymentDate,
//                   collectorName: payment.collectorName,
//                   paymentMode: payment.paymentMode,
//                   amount: fee.amount || 0,
//                   concession: concessionAmount || 0,
//                   fineAmount: isPaid ? 0 : fineAmount, // Set fine to 0 if paid
//                   excessAmount: matchingInst?.excessAmount || 0,
//                   paidFine: matchingInst?.fineAmount || 0,
//                   payable: (fee.amount || 0) - (concessionAmount || 0),
//                   paid: individualPaid,
//                   balance:
//                     ((fee.amount || 0) - (concessionAmount || 0)) -
//                     totalPaidSoFar,
//                 });
//               }
//             });

//             const balanceAmount = feeAmount - concessionAmount - paidAmount;

//             if (balanceAmount > 0) {
//               hasUnpaidFees = true;
//             }

//             totalFeesAmount += feeAmount;
//             totalConcession += concessionAmount;
//             totalFeesPayable += balanceAmount;
//             totalPaidAmount += paidAmount;
//             totalRemainingAmount += balanceAmount;

//             if (balanceAmount <= 0) continue;

//             feeInstallments.push({
//               feesTypeId: {
//                 _id: fee.feesTypeId,
//                 name: feeTypeMap[fee.feesTypeId.toString()],
//               },
//               installmentName: inst.name,
//               dueDate: inst.dueDate,
//               amount: feeAmount,
//               concessionAmount,
//               fineAmount: isPaid ? 0 : fineAmount, 
//               paidAmount,
//               balanceAmount,
//             });
//           }

        
//           if (!isPaid) {
//             totalFine += fineAmount;
//           }
//         }
//       }

//       if (hasUnpaidFees || paidInstallments.length > 0) {
//         result.push({
//           academicYear,
//           feeInstallments,
//           finePolicy: fineData || null,
//           concession: concessionForm || null,
//           paidInstallments,
//           totals: {
//             totalFeesAmount,
//             totalConcession,
//             totalFine,
//             totalFeesPayable,
//             totalPaidAmount,
//             totalRemainingAmount,
//           },
//           installmentsPresent: Array.from(
//             new Set(
//               feeInstallments.map((item) => item.installmentName)
//             )
//           ).sort(),
//         });
//       }
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ message: "All fees are paid for all academic years" });
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
    const { classId, sectionIds, schoolId, admissionNumber } = req.query;
    if (!classId || !sectionIds || !schoolId || !admissionNumber) {
      return res.status(400).json({
        message: "classId, sectionIds, schoolId, and admissionNumber are required",
      });
    }
    const sectionIdArray = Array.isArray(sectionIds) ? sectionIds : [sectionIds];
    const admissionData = await AdmissionForm.findOne({
      AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
      schoolId,
    });
    if (!admissionData) {
      return res.status(404).json({ message: "Admission data not found" });
    }
    const allAcademicYears = await FeesStructure.distinct("academicYear", {
      schoolId,
      classId,
      sectionIds: { $in: sectionIdArray },
    });
    const result = [];
    for (const academicYear of allAcademicYears) {
      const feeTypes = await FeesType.find({ academicYear });
      const feeTypeMap = feeTypes.reduce((acc, type) => {
        acc[type._id.toString()] = type.name;
        return acc;
      }, {});
      const feesStructures = await FeesStructure.find({
        schoolId,
        classId,
        sectionIds: { $in: sectionIdArray },
        academicYear,
      }).lean();
      if (!feesStructures.length) continue;
      const concessionForm = await ConcessionFormModel.findOne({
        AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
        academicYear,
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
                paidAmount += matchingFeeItem.paid || 0;
              }
            });
            const balanceAmount = feeAmount - concessionAmount - paidAmount;
            totalBalanceForInstallment += balanceAmount;
          }
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
            const dueDate = new Date(inst.dueDate);
            const today = new Date();
            if (totalBalanceForInstallment > 0 && today > dueDate && fineData) {
              const { feeType, frequency, value, maxCapFee } = fineData;
              const base = feeType === "percentage" ? (feeAmount * value) / 100 : value;
              let multiplier = 0;
              const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
              const monthsLate =
                today.getMonth() - dueDate.getMonth() +
                12 * (today.getFullYear() - dueDate.getFullYear());
              const yearsLate = today.getFullYear() - dueDate.getFullYear();
              switch (frequency) {
                case "Daily":
                  multiplier = daysLate;
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
            allPaidFeesData.forEach((payment) => {
              const matchingInst = payment?.installments?.find(
                (instData) => instData.installmentName === inst.name
              );
              const matchingFeeItem = matchingInst?.feeItems?.find(
                (item) => item.feeTypeId.toString() === fee.feesTypeId.toString()
              );
              if (matchingFeeItem) {
                const individualPaid = matchingFeeItem.paid || 0;
                paidAmount += individualPaid;
                const key = `${inst.name}_${fee.feesTypeId}`;
                cumulativePaidMap[key] = (cumulativePaidMap[key] || 0) + individualPaid;
                const totalPaidSoFar = cumulativePaidMap[key];
                paidInstallments.push({
                  feesTypeId: {
                    _id: matchingFeeItem.feeTypeId,
                    name: feeTypeMap[matchingFeeItem.feeTypeId.toString()],
                  },
                  installmentNumber: instNumber,
                  paidAmount: individualPaid,
                  receiptNumber: payment.receiptNumber,
                  paymentDate: payment.paymentDate,
                  collectorName: payment.collectorName,
                  paymentMode: payment.paymentMode,
                  amount: fee.amount || 0,
                  concession: concessionAmount || 0,
                  fineAmount: fineAmount || 0,
                  excessAmount: matchingInst?.excessAmount || 0,
                  paidFine: matchingInst?.fineAmount || 0,
                  payable: (fee.amount || 0) - (concessionAmount || 0),
                  paid: individualPaid,
                  balance:
                    ((fee.amount || 0) - (concessionAmount || 0)) -
                    totalPaidSoFar,
                });
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
            if (balanceAmount <= 0) continue;
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
            });
          }
        }
      }
      if (hasUnpaidFees || paidInstallments.length > 0) {
        result.push({
          academicYear,
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
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "All fees are paid for all academic years" });
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



  
