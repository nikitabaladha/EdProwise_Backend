// import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// import FeesType from "../../../../models/FeesModule/FeesType.js";
// import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
// import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";



// export const getAllStudentFeesDue = async (req, res) => {
//   try {
//     const { schoolId, academicYear, classes, sections, installment } = req.query;
//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         message: "schoolId and academicYear are required",
//       });
//     }


//     let query = { schoolId, TCStatus: "Inactive" };
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

//     const filteredClassIds = classes
//       ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
//       : Object.keys(classMap);
//     const filteredSectionIds = sections
//       ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
//       : Object.keys(sectionMap);

//     const students = await AdmissionForm.find(query)
//       .select('AdmissionNumber firstName lastName academicHistory dropoutStatus TCStatus TCStatusDate')
//       .lean();
//     if (!students.length) {
//       return res.status(404).json({ message: "No inactive students found for the school" });
//     }

//     const feeTypes = await FeesType.find({ academicYear }).lean();
//     const feeTypeMap = feeTypes.reduce((acc, type) => {
//       acc[type._id.toString()] = type.feesTypeName;
//       return acc;
//     }, {});
//     const allFeeTypes = feeTypes.map((type) => type.feesTypeName).sort();

//     const result = [];

//     for (const student of students) {
//       const admissionNumber = student.AdmissionNumber;
//       const academicHistory = student.academicHistory.find(
//         (history) => history.academicYear === academicYear
//       );

//       if (!academicHistory) continue;

//       const { masterDefineClass, section } = academicHistory;


//       if (!filteredClassIds.includes(masterDefineClass.toString()) || !filteredSectionIds.includes(section.toString())) {
//         continue;
//       }

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
//       }).lean();

//       const allPaidFeesData = await SchoolFees.find({
//         schoolId,
//         studentAdmissionNumber: admissionNumber,
//         academicYear,
//         reportStatus: "Paid",
//       }).lean();

//       const installments = [];
//       const expectedInstallments = feesStructures
//         .flatMap((structure) => structure.installments)
//         .map((inst) => inst.name)
//         .filter((name, index, self) => self.indexOf(name) === index);


//       const filteredInstallments = installment ? [installment] : expectedInstallments;

//       const paymentsByInstallment = allPaidFeesData
//         .flatMap((payment) =>
//           payment.installments.map((inst) => ({
//             ...inst,
//             paymentDate: payment.paymentDate,
//             paymentMode: payment.paymentMode || "-",
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

//       for (const instName of filteredInstallments) {
//         const structureInst = feesStructures
//           .flatMap((structure) => structure.installments)
//           .find((inst) => inst.name === instName);

//         if (!structureInst) continue;

//         let initialFeesDue = 0;
//         for (const fee of structureInst.fees) {
//           initialFeesDue += fee.amount || 0;
//         }

//         let installmentConcession = 0;
//         if (concessionForm?.concessionDetails?.length) {
//           for (const fee of structureInst.fees) {
//             const concessionMatch = concessionForm.concessionDetails.find(
//               (c) =>
//                 c.installmentName === instName &&
//                 c.feesType.toString() === fee.feesTypeId.toString()
//             );
//             if (concessionMatch) {
//               installmentConcession += concessionMatch.concessionAmount || 0;
//             }
//           }
//         }

//         const netFeesDue = initialFeesDue - installmentConcession;
//         let installmentFeesPaid = 0;
//         let installmentFeesConcession = 0;

//         // const payments = paymentsByInstallment[instName] || [];
//         // for (const payment of payments) {
//         //   let installmentFeesPaidForPayment = 0;
//         //   for (const feeItem of payment.feeItems) {
//         //     installmentFeesPaidForPayment += feeItem.paid || 0;
//         //   }
//         //   installmentFeesPaid += installmentFeesPaidForPayment;
//         //   const installmentBalance = currentFeesDue - installmentFeesPaidForPayment;

//         //   installments.push({
//         //     paymentDate: new Date(payment.paymentDate).toLocaleDateString("en-GB"),
//         //     paymentMode: payment.paymentMode,
//         //     installmentName: instName,
//         //     feesDue: currentFeesDue,
//         //     feesPaid: installmentFeesPaidForPayment,
//         //     concession: installmentConcession,
//         //     balance: installmentBalance,
//         //     feeTypes: structureInst.fees.reduce((acc, curr) => {
//         //       const feeTypeName = feeTypeMap[curr.feesTypeId.toString()];
//         //       acc[feeTypeName] = curr.amount || 0;
//         //       return acc;
//         //     }, {}),
//         //   });

//         //   currentFeesDue = installmentBalance;
//         // }

//         const payments = paymentsByInstallment[instName] || [];
//         for (const payment of payments) {
//           let installmentFeesPaidForPayment = 0;
//           for (const feeItem of payment.feeItems) {
//             installmentFeesPaidForPayment += feeItem.paid || 0;
//           }
//           installmentFeesPaid += installmentFeesPaidForPayment;

//           let installmentFeesConcessionForPayment = 0;
//           for (const feeItem of payment.feeItems) {
//             installmentFeesConcessionForPayment += feeItem.concession || 0;
//           }
//           installmentFeesConcession += installmentFeesConcessionForPayment;
//           const totalFeesDue = initialFeesDue - installmentConcession;
//           let currentFeesDue = totalFeesDue;
//           const installmentBalance = currentFeesDue - installmentFeesPaidForPayment;

//           installments.push({
//             paymentDate: new Date(payment.paymentDate).toLocaleDateString("en-GB"),
//             paymentMode: payment.paymentMode,
//             installmentName: instName,
//             feesDue: currentFeesDue,
//             feesPaid: installmentFeesPaidForPayment,
//             concession: installmentFeesConcession,
//             balance: installmentBalance,
//             feeTypes: structureInst.fees.reduce((acc, curr) => {
//               const feeTypeName = feeTypeMap[curr.feesTypeId.toString()];
//               acc[feeTypeName] = curr.amount || 0;
//               return acc;
//             }, {}),
//           });

//           currentFeesDue = installmentBalance;
//         }


//         if (!payments.length) {
//           installments.push({
//             paymentDate: "-",
//             paymentMode: "-",
//             installmentName: instName,
//             feesDue: netFeesDue,
//             feesPaid: 0,
//             concession: installmentFeesConcession,
//             balance: netFeesDue,
//             feeTypes: structureInst.fees.reduce((acc, curr) => {
//               const feeTypeName = feeTypeMap[curr.feesTypeId.toString()];
//               acc[feeTypeName] = curr.amount || 0;
//               return acc;
//             }, {}),
//           });
//         }
//       }

//       if (installments.length > 0) {
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

//         let remark = '';

//         if (student.dropoutStatus == null) {
//           remark = 'TC';
//         } else if (student.dropoutStatus == 'Dropout') {
//           remark = 'Dropout';
//         }


//         result.push({
//           admissionNumber,
//           studentName: `${student.firstName} ${student.lastName || ''}`,
//           className: classMap[masterDefineClass] || masterDefineClass,
//           sectionName: sectionMap[section] || section,
//           academicYear,
//           TCStatus: student.TCStatus,
//           TCStatusDate: student.TCStatusDate
//             ? new Date(student.TCStatusDate).toLocaleDateString("en-GB")
//             : "-",
//           Remark: remark,
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
//       return res.status(404).json({ message: "No fee data found for the given academic year" });
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
//         (await SchoolFees.find({ schoolId, academicYear, reportStatus: "Paid" }).lean()).map(
//           (fee) => fee.paymentMode
//         )
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
//     console.error('Error fetching student fees due:', error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export default getAllStudentFeesDue;


import mongoose from 'mongoose';
import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import Refund from "../../../../models/FeesModule/RefundFees.js";

export const getAllStudentFeesDue = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { schoolId, academicYear, classes, sections, installment } = req.query;
    if (!schoolId || !academicYear) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "schoolId and academicYear are required",
      });
    }

    let query = { schoolId, TCStatus: "Inactive" };
    const classAndSections = await ClassAndSection.find({ schoolId, academicYear })
      .lean()
      .session(session);
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

    const filteredClassIds = classes
      ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
      : Object.keys(classMap);
    const filteredSectionIds = sections
      ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
      : Object.keys(sectionMap);

    const students = await AdmissionForm.find(query)
      .select('AdmissionNumber firstName lastName academicHistory dropoutStatus TCStatus TCStatusDate')
      .lean()
      .session(session);
    if (!students.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No inactive students found for the school" });
    }

    const feeTypes = await FeesType.find({ academicYear }).lean().session(session);
    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});
    const allFeeTypes = feeTypes.map((type) => type.feesTypeName).sort();

    const result = [];

    for (const student of students) {
      const admissionNumber = student.AdmissionNumber;
      const academicHistory = student.academicHistory.find(
        (history) => history.academicYear === academicYear
      );

      if (!academicHistory) continue;

      const { masterDefineClass, section } = academicHistory;

      if (!filteredClassIds.includes(masterDefineClass.toString()) || !filteredSectionIds.includes(section.toString())) {
        continue;
      }

      const feesStructures = await FeesStructure.find({
        schoolId,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
        academicYear,
      })
        .lean()
        .session(session);

      if (!feesStructures.length) continue;

      const concessionForm = await ConcessionFormModel.findOne({
        AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
        academicYear,
      })
        .lean()
        .session(session);

      const allPaidFeesData = await SchoolFees.find({
        schoolId,
        studentAdmissionNumber: admissionNumber,
        academicYear,
        reportStatus: "Paid",
      })
        .lean()
        .session(session);

      const refunds = await Refund.find({
        schoolId,
        admissionNumber,
        academicYear,
        refundType: 'School Fees',
        status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
      })
        .lean()
        .session(session);
      console.log(`Refunds for ${admissionNumber}:`, JSON.stringify(refunds, null, 2));

      const installments = [];
      const expectedInstallments = feesStructures
        .flatMap((structure) => structure.installments)
        .map((inst) => inst.name)
        .filter((name, index, self) => self.indexOf(name) === index);

      const filteredInstallments = installment ? [installment] : expectedInstallments;

      const paymentsByInstallment = allPaidFeesData
        .flatMap((payment) =>
          payment.installments.map((inst) => ({
            ...inst,
            paymentDate: payment.paymentDate,
            paymentMode: payment.paymentMode || "-",
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

      for (const instName of filteredInstallments) {
        const structureInst = feesStructures
          .flatMap((structure) => structure.installments)
          .find((inst) => inst.name === instName);

        if (!structureInst) continue;

        let initialFeesDue = 0;
        for (const fee of structureInst.fees) {
          initialFeesDue += fee.amount || 0;
        }

        let installmentConcession = 0;
        if (concessionForm?.concessionDetails?.length) {
          for (const fee of structureInst.fees) {
            const concessionMatch = concessionForm.concessionDetails.find(
              (c) =>
                c.installmentName === instName &&
                c.feesType.toString() === fee.feesTypeId.toString()
            );
            if (concessionMatch) {
              installmentConcession += concessionMatch.concessionAmount || 0;
            }
          }
        }

        let installmentFeesPaid = 0;
        let installmentFeesConcession = 0;
        const payments = paymentsByInstallment[instName] || [];

        for (const payment of payments) {
          for (const feeItem of payment.feeItems) {
            installmentFeesPaid += feeItem.paid || 0;
            installmentFeesConcession += feeItem.concession || 0;
          }
        }

        // Handle refunds
        let totalRefundAmount = 0;
        let totalRefundConcession = 0;
        const relevantRefunds = refunds.filter(
          (refund) =>
            refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
            refund.installmentName === instName
        );

        for (const refund of relevantRefunds) {
          const installmentRefunds = refund.feeTypeRefunds?.filter(
            (ftr) => ftr.installmentName === instName
          ) || [];
          for (const ftr of installmentRefunds) {
            if (refund.status === "Refund" || refund.status === "Cancelled" || refund.status === "Cheque Return") {
              totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
              totalRefundConcession += ftr.concessionAmount || 0;
            } else if (["Cancelled", "Cheque Return"].includes(refund.status)) {
              totalRefundConcession += ftr.concessionAmount || 0;
            }
          }
          if (refund.installmentName === instName) {
            if (refund.status === "Refund" || refund.status === "Cancelled" || refund.status === "Cheque Return") {
              totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
              totalRefundConcession += refund.concessionAmount || 0;
            } else if (["Cancelled", "Cheque Return"].includes(refund.status)) {
              totalRefundConcession += refund.concessionAmount || 0;
            }
          }
        }

        // Adjust fees paid and concession after accounting for refunds
        installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
        installmentFeesConcession = Math.max(0, installmentFeesConcession - totalRefundConcession);

        const netFeesDue = initialFeesDue - installmentConcession;
        let currentFeesDue = netFeesDue;

        for (const payment of payments) {
          let installmentFeesPaidForPayment = 0;
          for (const feeItem of payment.feeItems) {
            installmentFeesPaidForPayment += feeItem.paid || 0;
          }
          // Adjust payment-specific fees paid for refunds
          installmentFeesPaidForPayment = Math.max(0, installmentFeesPaidForPayment - totalRefundAmount);

          const installmentBalance = currentFeesDue - installmentFeesPaidForPayment;

          installments.push({
            paymentDate: new Date(payment.paymentDate).toLocaleDateString("en-GB"),
            paymentMode: payment.paymentMode,
            installmentName: instName,
            feesDue: currentFeesDue,
            feesPaid: installmentFeesPaidForPayment,
            concession: installmentFeesConcession,
            balance: installmentBalance,
            feeTypes: structureInst.fees.reduce((acc, curr) => {
              const feeTypeName = feeTypeMap[curr.feesTypeId.toString()];
              acc[feeTypeName] = curr.amount || 0;
              return acc;
            }, {}),
          });

          currentFeesDue = installmentBalance;
        }

        if (!payments.length) {
          installments.push({
            paymentDate: "-",
            paymentMode: "-",
            installmentName: instName,
            feesDue: netFeesDue,
            feesPaid: 0,
            concession: installmentConcession,
            balance: netFeesDue,
            feeTypes: structureInst.fees.reduce((acc, curr) => {
              const feeTypeName = feeTypeMap[curr.feesTypeId.toString()];
              acc[feeTypeName] = curr.amount || 0;
              return acc;
            }, {}),
          });
        }
      }

      if (installments.length > 0) {
        const uniqueInstallments = [...new Set(installments.map((inst) => inst.installmentName))];
        let totalFeesDue = 0;
        let totalFeesPaid = 0;
        let totalConcession = 0;
        let totalBalance = 0;

        for (const instName of uniqueInstallments) {
          const instPayments = installments.filter((inst) => inst.installmentName === instName);
          const firstPayment = instPayments[0];
          totalFeesDue += firstPayment.feesDue;
          totalFeesPaid += instPayments.reduce((sum, inst) => sum + inst.feesPaid, 0);
          totalConcession += instPayments.reduce((sum, inst) => sum + inst.concession, 0);
          totalBalance += instPayments[instPayments.length - 1].balance;
        }

        let remark = '';
        if (student.dropoutStatus == null) {
          remark = 'TC';
        } else if (student.dropoutStatus == 'Dropout') {
          remark = 'Dropout';
        }

        result.push({
          admissionNumber,
          studentName: `${student.firstName} ${student.lastName || ''}`,
          className: classMap[masterDefineClass] || masterDefineClass,
          sectionName: sectionMap[section] || section,
          academicYear,
          TCStatus: student.TCStatus,
          TCStatusDate: student.TCStatusDate
            ? new Date(student.TCStatusDate).toLocaleDateString("en-GB")
            : "-",
          Remark: remark,
          installments,
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
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "No fee data found for the given academic year" });
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
        (await SchoolFees.find({ schoolId, academicYear, reportStatus: "Paid" })
          .lean()
          .session(session)).map((fee) => fee.paymentMode)
      )
    )
      .filter(Boolean)
      .map((mode) => ({ value: mode, label: mode }));

    await session.commitTransaction();
    session.endSession();

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
    console.error('Error fetching student fees due:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Server error" });
  }
};

export default getAllStudentFeesDue;