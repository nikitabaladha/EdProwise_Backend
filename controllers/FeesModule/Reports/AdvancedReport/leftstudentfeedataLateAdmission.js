// import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// import FeesType from "../../../../models/FeesModule/FeesType.js";
// import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
// import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

// export const LossoffeeduetoLateAdmission = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;
//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         message: "schoolId and academicYear are required",
//       });
//     }

//     // Fetch students
//     const students = await AdmissionForm.find({ schoolId }).lean();
//     if (!students.length) {
//       return res.status(404).json({ message: "No students found for the school" });
//     }

//     // Fetch class and section mappings
//     const classAndSections = await ClassAndSection.find({ schoolId, academicYear }).lean();
//     const classMap = classAndSections.reduce((acc, item) => {
//       acc[item._id.toString()] = item.className;
//       return acc;
//     }, {});
//     const sectionMap = classAndSections.reduce((acc, item) => {
//       item.sections.forEach((section) => {
//         acc[section._id.toString()] = section.name;
//       });
//       return acc;
//     }, {});

//     // Fetch fee types
//     const feeTypes = await FeesType.find({ academicYear }).lean();
//     const feeTypeMap = feeTypes.reduce((acc, type) => {
//       acc[type._id.toString()] = type.name || "Unknown";
//       return acc;
//     }, {});

//     const result = [];
//     const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

//     for (const student of students) {
//       const admissionNumber = student.AdmissionNumber;
//       const academicHistory = student.academicHistory.find(
//         (history) => history.academicYear === academicYear
//       );

//       if (!academicHistory) continue;

//       const { masterDefineClass, section } = academicHistory;

//       // Fetch fees structures
//       const feesStructures = await FeesStructure.find({
//         schoolId,
//         classId: masterDefineClass,
//         sectionIds: { $in: [section] },
//         academicYear,
//       }).lean();

//       if (!feesStructures.length) continue;

//       // Fetch concession form
//       const concessionForm = await ConcessionFormModel.findOne({
//         AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
//         academicYear,
//       }).lean();

//       // Fetch all paid fees data
//       const allPaidFeesData = await SchoolFees.find({
//         schoolId,
//         studentAdmissionNumber: admissionNumber,
//         academicYear,
//       }).lean();

//       const installments = [];
//       const paymentsByInstallment = allPaidFeesData
//         .flatMap((payment) =>
//           payment.installments.map((inst) => ({
//             ...inst,
//             paymentDate: payment.paymentDate,
//             paymentMode: payment.paymentMode || "-",
//             reportStatus: payment.reportStatus || [],
//             cancelledDate: payment.cancelledDate,
//           }))
//         )
//         .reduce((acc, inst) => {
//           const instName = inst.installmentName;
//           if (!acc[instName]) {
//             acc[instName] = [];
//           }
//           acc[instName].push(inst);
//           return acc;
//         }, {});

//       // Track payment status for filtering
//       let hasUnpaidFirstInstallment = false;
//       let hasPartiallyPaidInstallment = false;
//       let hasFullyPaidLaterInstallment = false;
//       let hasMissedEarlierInstallment = false;
//       const allInstallments = feesStructures.flatMap((structure) => structure.installments);
//       const installmentNames = [...new Set(allInstallments.map((inst) => inst.name))].sort(
//         (a, b) => {
//           const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
//           const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
//           return dueDateA && dueDateB ? new Date(dueDateA) - new Date(dueDateB) : 0;
//         }
//       );

//       for (const instName of installmentNames) {
//         const structureInst = allInstallments.find((inst) => inst.name === instName);
//         if (!structureInst) continue;

//         // Calculate initial fees due
//         let initialFeesDue = 0;
//         for (const fee of structureInst.fees) {
//           initialFeesDue += fee.amount || 0;
//         }

//         let concession = 0;
//         if (concessionForm?.concessionDetails?.length) {
//           for (const fee of structureInst.fees) {
//             const concessionMatch = concessionForm.concessionDetails.find(
//               (c) =>
//                 c.installmentName === instName &&
//                 c.feesType.toString() === fee.feesTypeId.toString()
//             );
//             if (concessionMatch) {
//               concession += concessionMatch.concessionAmount || 0;
//             }
//           }
//         }

//         const netFeesDue = initialFeesDue - concession;
//         let currentFeesDue = netFeesDue;
//         let installmentFeesPaid = 0;

//         const payments = paymentsByInstallment[instName] || [];
//         const sortedPayments = payments.sort(
//           (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
//         );

//         for (const payment of sortedPayments) {
//           let feesPaid = 0;
//           for (const feeItem of payment.feeItems) {
//             feesPaid += feeItem.paid || 0;
//           }
//           if (!payment.cancelledDate) {
//             installmentFeesPaid += feesPaid;
//           }

//           const installmentBalance = currentFeesDue - feesPaid;
//           const formattedPaymentDate = payment.paymentDate
//             ? new Date(payment.paymentDate).toLocaleDateString("en-GB")
//             : null;
//           const formattedCancelledDate = payment.cancelledDate
//             ? new Date(payment.cancelledDate).toLocaleDateString("en-GB")
//             : null;

//           installments.push({
//             paymentDate: formattedPaymentDate,
//             cancelledDate: formattedCancelledDate,
//             reportStatus: payment.reportStatus || [],
//             paymentMode: payment.paymentMode,
//             installmentName: instName,
//             dueDate: structureInst.dueDate
//               ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
//               : null,
//             feesDue: currentFeesDue,
//             feesPaid,
//             concession,
//             balance: installmentBalance,
//             feeTypes: structureInst.fees.reduce((acc, curr) => {
//               const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
//               acc[feeTypeName] = curr.amount || 0;
//               return acc;
//             }, {}),
//           });

//           currentFeesDue = installmentBalance;
//         }

//         // Check payment status
//         const isFirstInstallment = instName === installmentNames[0];
//         const dueDate = structureInst.dueDate ? new Date(structureInst.dueDate) : null;
//         const today = new Date();

//         // Check if first installment is unpaid or partially paid and past due
//         if (isFirstInstallment && dueDate && today > dueDate) {
//           if (installmentFeesPaid === 0) {
//             hasUnpaidFirstInstallment = true;
//           } else if (installmentFeesPaid < netFeesDue) {
//             hasPartiallyPaidInstallment = true;
//           }
//         } else if (!payments.length && dueDate && today > dueDate) {
//           // Unpaid installment (no payments recorded)
//           hasUnpaidFirstInstallment = isFirstInstallment;
//           installments.push({
//             paymentDate: null,
//             cancelledDate: null,
//             reportStatus: [],
//             paymentMode: "-",
//             installmentName: instName,
//             dueDate: structureInst.dueDate
//               ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
//               : null,
//             feesDue: netFeesDue,
//             feesPaid: 0,
//             concession,
//             balance: netFeesDue,
//             feeTypes: structureInst.fees.reduce((acc, curr) => {
//               const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
//               acc[feeTypeName] = curr.amount || 0;
//               return acc;
//             }, {}),
//           });
//         }

//         // Check for partially paid installment
//         if (installmentFeesPaid > 0 && installmentFeesPaid < netFeesDue) {
//           hasPartiallyPaidInstallment = true;
//         }

//         // Check for fully paid later installments with missed earlier ones
//         if (installmentFeesPaid >= netFeesDue && !sortedPayments.some((p) => p.cancelledDate)) {
//           const installmentIndex = installmentNames.indexOf(instName);
//           if (installmentIndex > 0) {
//             for (let i = 0; i < installmentIndex; i++) {
//               const earlierInstName = installmentNames[i];
//               const earlierPayments = paymentsByInstallment[earlierInstName] || [];
//               let earlierFeesPaid = 0;
//               for (const p of earlierPayments) {
//                 if (!p.cancelledDate) {
//                   for (const feeItem of p.feeItems) {
//                     earlierFeesPaid += feeItem.paid || 0;
//                   }
//                 }
//               }
//               const earlierStructure = allInstallments.find((inst) => inst.name === earlierInstName);
//               let earlierFeesDue = 0;
//               if (earlierStructure) {
//                 for (const fee of earlierStructure.fees) {
//                   earlierFeesDue += fee.amount || 0;
//                 }
//                 let earlierConcession = 0;
//                 if (concessionForm?.concessionDetails?.length) {
//                   for (const fee of earlierStructure.fees) {
//                     const concessionMatch = concessionForm.concessionDetails.find(
//                       (c) =>
//                         c.installmentName === earlierInstName &&
//                         c.feesType.toString() === fee.feesTypeId.toString()
//                     );
//                     if (concessionMatch) {
//                       earlierConcession += concessionMatch.concessionAmount || 0;
//                     }
//                   }
//                 }
//                 const earlierNetDue = earlierFeesDue - earlierConcession;
//                 if (earlierFeesPaid < earlierNetDue || earlierPayments.length === 0) {
//                   hasFullyPaidLaterInstallment = true;
//                   hasMissedEarlierInstallment = true;
//                   break;
//                 }
//               }
//             }
//           }
//         }
//       }

//       // Include student only if they meet the criteria
//       if (
//         hasUnpaidFirstInstallment ||
//         hasPartiallyPaidInstallment ||
//         (hasFullyPaidLaterInstallment && hasMissedEarlierInstallment)
//       ) {
//         const uniqueInstallments = [...new Set(installments.map((inst) => inst.installmentName))];
//         let totalFeesDue = 0;
//         let totalFeesPaid = 0;
//         let totalConcession = 0;
//         let totalBalance = 0;

//         for (const instName of uniqueInstallments) {
//           const instPayments = installments.filter((inst) => inst.installmentName === instName);
//           const firstPayment = instPayments[0];
//           totalFeesDue += firstPayment.feesDue;
//           totalFeesPaid += instPayments.reduce((sum, inst) => sum + inst.feesPaid, 0);
//           totalConcession += instPayments.reduce((sum, inst) => sum + inst.concession, 0);
//           totalBalance += instPayments[instPayments.length - 1].balance;
//         }

//         result.push({
//           admissionNumber,
//           studentName: `${student.firstName} ${student.lastName || ''}`,
//           className: classMap[masterDefineClass] || masterDefineClass,
//           sectionName: sectionMap[section] || section,
//           academicYear,
//           installments,
//           totals: {
//             totalFeesDue,
//             totalFeesPaid,
//             totalConcession,
//             totalBalance,
//           },
//         });
//       }
//     }

//     if (!result.length) {
//       return res.status(404).json({ message: "No students found matching the payment criteria" });
//     }

//     // Generate filter options
//     const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
//       value: name,
//       label: name,
//     }));
//     const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
//       value: name,
//       label: name,
//     }));
//     const installmentOptions = Array.from(
//       new Set(result.flatMap((item) => item.installments.map((inst) => inst.installmentName)))
//     ).map((inst) => ({ value: inst, label: inst }));
//     const paymentModeOptions = Array.from(
//       new Set(
//         (await SchoolFees.find({ schoolId, academicYear }).lean()).map((fee) => fee.paymentMode)
//       )
//     )
//       .filter(Boolean)
//       .map((mode) => ({ value: mode, label: mode }));

//     res.status(200).json({
//       data: result,
//       feeTypes: allFeeTypes,
//       filterOptions: {
//         classOptions,
//         sectionOptions,
//         installmentOptions,
//         paymentModeOptions,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching student fees due:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export default LossoffeeduetoLateAdmission;

import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

// export const LateAdmissionUnpaidEarlierInstallments = async (req, res) => {
//   try {
//     const { schoolId, academicYear } = req.query;
//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         message: "schoolId and academicYear are required",
//       });
//     }


//     const today = new Date();
    
//     const students = await AdmissionForm.find({ schoolId }).lean();
//     if (!students.length) {
//       console.log("No students found for the school");
//       return res.status(404).json({ message: "No students found for the school" });
//     }
//     console.log(`Found ${students.length} students for schoolId: ${schoolId}`);


//     const classAndSections = await ClassAndSection.find({ schoolId, academicYear }).lean();
//     const classMap = classAndSections.reduce((acc, item) => {
//       acc[item._id.toString()] = item.className;
//       return acc;
//     }, {});
//     const sectionMap = classAndSections.reduce((acc, item) => {
//       item.sections.forEach((section) => {
//         acc[section._id.toString()] = section.name;
//       });
//       return acc;
//     }, {});


//     const feeTypes = await FeesType.find({ academicYear }).lean();
//     const feeTypeMap = feeTypes.reduce((acc, type) => {
//       acc[type._id.toString()] = type.name || "Unknown";
//       return acc;
//     }, {});
//     console.log(`Fee types mapping:`, JSON.stringify(feeTypeMap, null, 2));

//     const result = [];
//     const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

//     for (const student of students) {
//       const admissionNumber = student.AdmissionNumber;
//       console.log(`Processing student: ${admissionNumber}, Name: ${student.firstName} ${student.lastName || ''}`);

//       const academicHistory = student.academicHistory?.find(
//         (history) => history.academicYear === academicYear
//       );

//       if (!academicHistory) {
//         console.log(`No academic history for ${admissionNumber} in ${academicYear}`);
//         continue;
//       }

//       const { masterDefineClass, section } = academicHistory;


//       const feesStructures = await FeesStructure.find({
//         schoolId,
//         classId: masterDefineClass,
//         sectionIds: { $in: [section] },
//         academicYear,
//       }).lean();

//       if (!feesStructures.length) {
//         console.log(`No fees structures for ${admissionNumber}, class: ${masterDefineClass}, section: ${section}`);
//         continue;
//       }
//       console.log(`Found ${feesStructures.length} fees structures for ${admissionNumber}`);

    
//       const concessionForm = await ConcessionFormModel.findOne({
//         AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
//         academicYear,
//       }).lean();


//       const allPaidFeesData = await SchoolFees.find({
//         schoolId,
//         studentAdmissionNumber: admissionNumber,
//         academicYear,
//       }).lean();

//       console.log(`Payments for ${admissionNumber}:`, JSON.stringify(allPaidFeesData, null, 2));

//       const paymentsByInstallment = allPaidFeesData
//         .flatMap((payment) =>
//           payment.installments.map((inst) => ({
//             ...inst,
//             paymentDate: payment.paymentDate,
//             paymentMode: payment.paymentMode || "-",
//             reportStatus: payment.reportStatus || [],
//             cancelledDate: payment.cancelledDate,
//           }))
//         )
//         .reduce((acc, inst) => {
//           const instName = inst.installmentName;
//           if (!acc[instName]) {
//             acc[instName] = [];
//           }
//           acc[instName].push(inst);
//           return acc;
//         }, {});

  
//       const allInstallments = feesStructures.flatMap((structure) => structure.installments);
//       const installmentNames = [...new Set(allInstallments.map((inst) => inst.name))].sort(
//         (a, b) => {
//           const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
//           const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
//           return dueDateA && dueDateB ? new Date(dueDateA) - new Date(dueDateB) : 0;
//         }
//       );
//       console.log(`Installment names for ${admissionNumber}:`, installmentNames);

//       let hasFullyPaidLaterInstallment = false;
//       let latestFullyPaidDueDate = null;
//       const unpaidOrPartiallyPaidInstallments = [];

 
//       for (const instName of installmentNames) {
//         const structureInst = allInstallments.find((inst) => inst.name === instName);
//         if (!structureInst || !structureInst.dueDate) {
//           console.log(`Skipping ${instName} for ${admissionNumber}: no due date or structure`);
//           continue;
//         }

//         let initialFeesDue = 0;
//         for (const fee of structureInst.fees) {
//           initialFeesDue += fee.amount || 0;
//         }

//         let concession = 0;
//         if (concessionForm?.concessionDetails?.length) {
//           for (const fee of structureInst.fes) {
//             const concessionMatch = concessionForm.concessionDetails.find(
//               (c) =>
//                 c.installmentName === instName &&
//                 c.feesType.toString() === fee.feesTypeId.toString()
//             );
//             if (concessionMatch) {
//               concession += concessionMatch.concessionAmount || 0;
//             }
//           }
//         }

//         const netFeesDue = initialFeesDue - concession;
//         let installmentFeesPaid = 0;

//         const payments = paymentsByInstallment[instName] || [];
//         for (const payment of payments) {
//           if (!payment.cancelledDate) {
//             for (const feeItem of payment.feeItems) {
//               installmentFeesPaid += feeItem.paid || 0;
//             }
//           }
//         }

//         const installmentIndex = installmentNames.indexOf(instName);
//         if (installmentFeesPaid >= netFeesDue && installmentIndex > 0 && !payments.some((p) => p.cancelledDate)) {
//           hasFullyPaidLaterInstallment = true;
//           const dueDate = new Date(structureInst.dueDate);
//           if (!latestFullyPaidDueDate || dueDate > latestFullyPaidDueDate) {
//             latestFullyPaidDueDate = dueDate;
//           }
//           console.log(`Detected fully paid later installment ${instName} for ${admissionNumber}: feesPaid=${installmentFeesPaid}, dueDate=${dueDate.toISOString()}`);
//         }
//       }

    
//       if (hasFullyPaidLaterInstallment && latestFullyPaidDueDate) {
//         for (const instName of installmentNames) {
//           const structureInst = allInstallments.find((inst) => inst.name === instName);
//           if (!structureInst || !structureInst.dueDate) {
//             console.log(`Skipping ${instName} for ${admissionNumber}: no due date or structure`);
//             continue;
//           }

//           const dueDate = new Date(structureInst.dueDate);
//           if (dueDate >= latestFullyPaidDueDate) {
//             console.log(`Skipping ${instName} for ${admissionNumber}: due date ${dueDate.toISOString()} is not before latest fully paid due date ${latestFullyPaidDueDate.toISOString()}`);
//             continue;
//           }

//           let initialFeesDue = 0;
//           for (const fee of structureInst.fees) {
//             initialFeesDue += fee.amount || 0;
//           }

//           let concession = 0;
//           if (concessionForm?.concessionDetails?.length) {
//             for (const fee of structureInst.fees) {
//               const concessionMatch = concessionForm.concessionDetails.find(
//                 (c) =>
//                   c.installmentName === instName &&
//                   c.feesType.toString() === fee.feesTypeId.toString()
//               );
//               if (concessionMatch) {
//                 concession += concessionMatch.concessionAmount || 0;
//               }
//             }
//           }

//           const netFeesDue = initialFeesDue - concession;
//           let currentFeesDue = netFeesDue;
//           let installmentFeesPaid = 0;

//           const payments = paymentsByInstallment[instName] || [];
//           const sortedPayments = payments.sort(
//             (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
//           );

//           for (const payment of sortedPayments) {
//             let feesPaid = 0;
//             for (const feeItem of payment.feeItems) {
//               feesPaid += feeItem.paid || 0;
//             }
//             if (!payment.cancelledDate) {
//               installmentFeesPaid += feesPaid;
//             }

//             const installmentBalance = currentFeesDue - feesPaid;
//             const formattedPaymentDate = payment.paymentDate
//               ? new Date(payment.paymentDate).toLocaleDateString("en-GB")
//               : null;
//             const formattedCancelledDate = payment.cancelledDate
//               ? new Date(payment.cancelledDate).toLocaleDateString("en-GB")
//               : null;

//             if (installmentBalance > 0 || feesPaid === 0) {
//               const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
//                 (inst) => inst.installmentName === instName && inst.feesPaid === feesPaid
//               );
//               if (!existingInstallment) {
//                 unpaidOrPartiallyPaidInstallments.push({
//                   paymentDate: formattedPaymentDate,
//                   cancelledDate: formattedCancelledDate,
//                   reportStatus: payment.reportStatus || [],
//                   paymentMode: payment.paymentMode,
//                   installmentName: instName,
//                   dueDate: structureInst.dueDate
//                     ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
//                     : null,
//                   feesDue: currentFeesDue,
//                   feesPaid,
//                   concession,
//                   balance: installmentBalance,
//                   feeTypes: structureInst.fees.reduce((acc, curr) => {
//                     const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
//                     acc[feeTypeName] = curr.amount || 0;
//                     return acc;
//                   }, {}),
//                 });
//                 console.log(`Added unpaid/partially paid installment ${instName} for ${admissionNumber}: feesDue=${currentFeesDue}, feesPaid=${feesPaid}, balance=${installmentBalance}`);
//               }
//             }

//             currentFeesDue = installmentBalance;
//           }

//           if (!payments.length && dueDate < today) {
//             const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
//               (inst) => inst.installmentName === instName && inst.feesPaid === 0
//             );
//             if (!existingInstallment) {
//               unpaidOrPartiallyPaidInstallments.push({
//                 paymentDate: null,
//                 cancelledDate: null,
//                 reportStatus: [],
//                 paymentMode: "-",
//                 installmentName: instName,
//                 dueDate: structureInst.dueDate
//                   ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
//                   : null,
//                 feesDue: netFeesDue,
//                 feesPaid: 0,
//                 concession,
//                 balance: netFeesDue,
//                 feeTypes: structureInst.fees.reduce((acc, curr) => {
//                   const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
//                   acc[feeTypeName] = curr.amount || 0;
//                   return acc;
//                 }, {}),
//               });
//               console.log(`Added unpaid past-due installment ${instName} for ${admissionNumber}: feesDue=${netFeesDue}`);
//             }
//           }
//         }
//       }

 
//       if (hasFullyPaidLaterInstallment && unpaidOrPartiallyPaidInstallments.length > 0) {
//         let totalFeesDue = 0;
//         let totalFeesPaid = 0;
//         let totalConcession = 0;
//         let totalBalance = 0;

//         for (const inst of unpaidOrPartiallyPaidInstallments) {
//           totalFeesDue += inst.feesDue;
//           totalFeesPaid += inst.feesPaid;
//           totalConcession += inst.concession;
//           totalBalance += inst.balance;
//         }

//         result.push({
//           admissionNumber,
//           studentName: `${student.firstName} ${student.lastName || ''}`,
//           className: classMap[masterDefineClass] || masterDefineClass,
//           sectionName: sectionMap[section] || section,
//           academicYear,
//           admissionPaymentDate: student.paymentDate
//             ? new Date(student.paymentDate).toLocaleDateString("en-GB")
//             : null,
//           installments: unpaidOrPartiallyPaidInstallments.sort((a, b) => {
//             const dueDateA = new Date(a.dueDate.split('/').reverse().join('-'));
//             const dueDateB = new Date(b.dueDate.split('/').reverse().join('-'));
//             return dueDateA - new Date(dueDateB);
//           }),
//           totals: {
//             totalFeesDue,
//             totalFeesPaid,
//             totalConcession,
//             totalBalance,
//           },
//         });
//         console.log(`Included student ${admissionNumber} with ${unpaidOrPartiallyPaidInstallments.length} unpaid/partially paid installments`);
//       } else {
//         console.log(`Excluded student ${admissionNumber}: hasFullyPaidLaterInstallment=${hasFullyPaidLaterInstallment}, unpaidOrPartiallyPaidInstallments=${unpaidOrPartiallyPaidInstallments.length}`);
//       }
//     }

//     if (!result.length) {
//       console.log("No students found with unpaid/partially paid earlier installments");
//       return res.status(404).json({ message: "No students found with unpaid/partially paid earlier installments" });
//     }


//     const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
//       value: name,
//       label: name,
//     }));
//     const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
//       value: name,
//       label: name,
//     }));
//     const installmentOptions = Array.from(
//       new Set(result.flatMap((item) => item.installments.map((inst) => inst.installmentName)))
//     ).map((inst) => ({ value: inst, label: inst }));
//     const paymentModeOptions = Array.from(
//       new Set(
//         (await SchoolFees.find({ schoolId, academicYear }).lean()).map((fee) => fee.paymentMode)
//       )
//     )
//       .filter(Boolean)
//       .map((mode) => ({ value: mode, label: mode }));

//     res.status(200).json({
//       data: result,
//       feeTypes: allFeeTypes,
//       filterOptions: {
//         classOptions,
//         sectionOptions,
//         installmentOptions,
//         paymentModeOptions,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching unpaid/partially paid earlier installments:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const LateAdmissionUnpaidEarlierInstallments = async (req, res) => {
  try {
    const { schoolId, academicYear, classes, sections, installment } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: "schoolId and academicYear are required",
      });
    }

    const today = new Date();

    const students = await AdmissionForm.find({ schoolId }).lean();
    if (!students.length) {
      console.log("No students found for the school");
      return res.status(404).json({ message: "No students found for the school" });
    }

    const classAndSections = await ClassAndSection.find({ schoolId, academicYear }).lean();
    const classMap = classAndSections.reduce((acc, item) => {
      acc[item._id.toString()] = item.className;
      return acc;
    }, {});
    const sectionMap = classAndSections.reduce((acc, item) => {
      item.sections.forEach((section) => {
        acc[section._id.toString()] = section.name;
      });
      return acc;
    }, {});

    // Filter class and section IDs based on query parameters
    const filteredClassIds = classes
      ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
      : Object.keys(classMap);
    const filteredSectionIds = sections
      ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
      : Object.keys(sectionMap);

    const feeTypes = await FeesType.find({ academicYear }).lean();
    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.name || "Unknown";
      return acc;
    }, {});
    const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

    const result = [];

    for (const student of students) {
      const admissionNumber = student.AdmissionNumber;
      const academicHistory = student.academicHistory?.find(
        (history) => history.academicYear === academicYear
      );

      if (!academicHistory) continue;

      const { masterDefineClass, section } = academicHistory;

      // Skip if class or section doesn't match filters
      if (!filteredClassIds.includes(masterDefineClass.toString()) || !filteredSectionIds.includes(section.toString())) {
        continue;
      }

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
      }).lean();

      const allPaidFeesData = await SchoolFees.find({
        schoolId,
        studentAdmissionNumber: admissionNumber,
        academicYear,
      }).lean();

      const paymentsByInstallment = allPaidFeesData
        .flatMap((payment) =>
          payment.installments.map((inst) => ({
            ...inst,
            paymentDate: payment.paymentDate,
            paymentMode: payment.paymentMode || "-",
            reportStatus: payment.reportStatus || [],
            cancelledDate: payment.cancelledDate,
          }))
        )
        .reduce((acc, inst) => {
          const instName = inst.installmentName;
          if (!acc[instName]) {
            acc[instName] = [];
          }
          acc[instName].push(inst);
          return acc;
        }, {});

      const allInstallments = feesStructures.flatMap((structure) => structure.installments);
      const installmentNames = [...new Set(allInstallments.map((inst) => inst.name))].sort(
        (a, b) => {
          const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
          const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
          return dueDateA && dueDateB ? new Date(dueDateA) - new Date(dueDateB) : 0;
        }
      );

      // Filter installments if specified
      const filteredInstallmentNames = installment ? [installment] : installmentNames;

      let hasFullyPaidLaterInstallment = false;
      let latestFullyPaidDueDate = null;
      const unpaidOrPartiallyPaidInstallments = [];

      for (const instName of installmentNames) {
        const structureInst = allInstallments.find((inst) => inst.name === instName);
        if (!structureInst || !structureInst.dueDate) continue;

        let initialFeesDue = 0;
        for (const fee of structureInst.fees) {
          initialFeesDue += fee.amount || 0;
        }

        let concession = 0;
        if (concessionForm?.concessionDetails?.length) {
          for (const fee of structureInst.fees) {
            const concessionMatch = concessionForm.concessionDetails.find(
              (c) =>
                c.installmentName === instName &&
                c.feesType.toString() === fee.feesTypeId.toString()
            );
            if (concessionMatch) {
              concession += concessionMatch.concessionAmount || 0;
            }
          }
        }

        const netFeesDue = initialFeesDue - concession;
        let installmentFeesPaid = 0;

        const payments = paymentsByInstallment[instName] || [];
        for (const payment of payments) {
          if (!payment.cancelledDate) {
            for (const feeItem of payment.feeItems) {
              installmentFeesPaid += feeItem.paid || 0;
            }
          }
        }

        const installmentIndex = installmentNames.indexOf(instName);
        if (installmentFeesPaid >= netFeesDue && installmentIndex > 0 && !payments.some((p) => p.cancelledDate)) {
          hasFullyPaidLaterInstallment = true;
          const dueDate = new Date(structureInst.dueDate);
          if (!latestFullyPaidDueDate || dueDate > latestFullyPaidDueDate) {
            latestFullyPaidDueDate = dueDate;
          }
        }
      }

      if (hasFullyPaidLaterInstallment && latestFullyPaidDueDate) {
        for (const instName of filteredInstallmentNames) {
          const structureInst = allInstallments.find((inst) => inst.name === instName);
          if (!structureInst || !structureInst.dueDate) continue;

          const dueDate = new Date(structureInst.dueDate);
          if (dueDate >= latestFullyPaidDueDate) continue;

          let initialFeesDue = 0;
          for (const fee of structureInst.fees) {
            initialFeesDue += fee.amount || 0;
          }

          let concession = 0;
          if (concessionForm?.concessionDetails?.length) {
            for (const fee of structureInst.fees) {
              const concessionMatch = concessionForm.concessionDetails.find(
                (c) =>
                  c.installmentName === instName &&
                  c.feesType.toString() === fee.feesTypeId.toString()
              );
              if (concessionMatch) {
                concession += concessionMatch.concessionAmount || 0;
              }
            }
          }

          const netFeesDue = initialFeesDue - concession;
          let currentFeesDue = netFeesDue;
          let installmentFeesPaid = 0;

          const payments = paymentsByInstallment[instName] || [];
          const sortedPayments = payments.sort(
            (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
          );

          for (const payment of sortedPayments) {
            let feesPaid = 0;
            for (const feeItem of payment.feeItems) {
              feesPaid += feeItem.paid || 0;
            }
            if (!payment.cancelledDate) {
              installmentFeesPaid += feesPaid;
            }

            const installmentBalance = currentFeesDue - feesPaid;
            const formattedPaymentDate = payment.paymentDate
              ? new Date(payment.paymentDate).toLocaleDateString("en-GB")
              : null;
            const formattedCancelledDate = payment.cancelledDate
              ? new Date(payment.cancelledDate).toLocaleDateString("en-GB")
              : null;

            if (installmentBalance > 0 || feesPaid === 0) {
              const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
                (inst) => inst.installmentName === instName && inst.feesPaid === feesPaid
              );
              if (!existingInstallment) {
                unpaidOrPartiallyPaidInstallments.push({
                  paymentDate: formattedPaymentDate,
                  cancelledDate: formattedCancelledDate,
                  reportStatus: payment.reportStatus || [],
                  paymentMode: payment.paymentMode,
                  installmentName: instName,
                  dueDate: structureInst.dueDate
                    ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
                    : null,
                  feesDue: currentFeesDue,
                  feesPaid,
                  concession,
                  balance: installmentBalance,
                  feeTypes: structureInst.fees.reduce((acc, curr) => {
                    const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
                    acc[feeTypeName] = curr.amount || 0;
                    return acc;
                  }, {}),
                });
              }
            }

            currentFeesDue = installmentBalance;
          }

          if (!payments.length && dueDate < today) {
            const existingInstallment = unpaidOrPartiallyPaidInstallments.find(
              (inst) => inst.installmentName === instName && inst.feesPaid === 0
            );
            if (!existingInstallment) {
              unpaidOrPartiallyPaidInstallments.push({
                paymentDate: null,
                cancelledDate: null,
                reportStatus: [],
                paymentMode: "-",
                installmentName: instName,
                dueDate: structureInst.dueDate
                  ? new Date(structureInst.dueDate).toLocaleDateString("en-GB")
                  : null,
                feesDue: netFeesDue,
                feesPaid: 0,
                concession,
                balance: netFeesDue,
                feeTypes: structureInst.fees.reduce((acc, curr) => {
                  const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
                  acc[feeTypeName] = curr.amount || 0;
                  return acc;
                }, {}),
              });
            }
          }
        }
      }

      if (hasFullyPaidLaterInstallment && unpaidOrPartiallyPaidInstallments.length > 0) {
        let totalFeesDue = 0;
        let totalFeesPaid = 0;
        let totalConcession = 0;
        let totalBalance = 0;

        for (const inst of unpaidOrPartiallyPaidInstallments) {
          totalFeesDue += inst.feesDue;
          totalFeesPaid += inst.feesPaid;
          totalConcession += inst.concession;
          totalBalance += inst.balance;
        }

        result.push({
          admissionNumber,
          studentName: `${student.firstName} ${student.lastName || ''}`,
          className: classMap[masterDefineClass] || masterDefineClass,
          sectionName: sectionMap[section] || section,
          academicYear,
          admissionPaymentDate: student.paymentDate
            ? new Date(student.paymentDate).toLocaleDateString("en-GB")
            : null,
          installments: unpaidOrPartiallyPaidInstallments.sort((a, b) => {
            const dueDateA = new Date(a.dueDate.split('/').reverse().join('-'));
            const dueDateB = new Date(b.dueDate.split('/').reverse().join('-'));
            return dueDateA - new Date(dueDateB);
          }),
          totals: {
            totalFeesDue,
            totalFeesPaid,
            totalConcession,
            totalBalance,
          },
        });
      }
    }

    if (!result.length) {
      return res.status(404).json({ message: "No students found with unpaid/partially paid earlier installments" });
    }

    const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
      value: name,
      label: name,
    }));
    const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
      value: name,
      label: name,
    }));
    const installmentOptions = Array.from(
      new Set(result.flatMap((item) => item.installments.map((inst) => inst.installmentName)))
    ).map((inst) => ({ value: inst, label: inst }));
    const paymentModeOptions = Array.from(
      new Set(
        (await SchoolFees.find({ schoolId, academicYear }).lean()).map((fee) => fee.paymentMode)
      )
    )
      .filter(Boolean)
      .map((mode) => ({ value: mode, label: mode }));

    res.status(200).json({
      data: result,
      feeTypes: allFeeTypes,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        paymentModeOptions,
      },
    });
  } catch (error) {
    console.error("Error fetching unpaid/partially paid earlier installments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default LateAdmissionUnpaidEarlierInstallments;

