
// import mongoose from 'mongoose';
// import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
// import FeesType from "../../../../models/FeesModule/FeesType.js";
// import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
// import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
// import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
// import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
// import Refund from "../../../../models/FeesModule/RefundFees.js";

// export const getAllStudentFeesDue = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { schoolId, academicYear, classes, sections, installment } = req.query;
//     if (!schoolId || !academicYear) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({
//         message: "schoolId and academicYear are required",
//       });
//     }

//     let query = { schoolId, TCStatus: "Inactive" };
//     const classAndSections = await ClassAndSection.find({ schoolId, academicYear })
//       .lean()
//       .session(session);
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
//       .lean()
//       .session(session);
//     if (!students.length) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "No inactive students found for the school" });
//     }

//     const feeTypes = await FeesType.find({ academicYear }).lean().session(session);
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
//       })
//         .lean()
//         .session(session);

//       if (!feesStructures.length) continue;

//       const concessionForm = await ConcessionFormModel.findOne({
//         AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
//         academicYear,
//       })
//         .lean()
//         .session(session);

//       const allPaidFeesData = await SchoolFees.find({
//         schoolId,
//         studentAdmissionNumber: admissionNumber,
//         academicYear,
//         reportStatus: "Paid",
//       })
//         .lean()
//         .session(session);

//       const refunds = await Refund.find({
//         schoolId,
//         admissionNumber,
//         academicYear,
//         refundType: 'School Fees',
//         status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
//       })
//         .lean()
//         .session(session);
//       console.log(`Refunds for ${admissionNumber}:`, JSON.stringify(refunds, null, 2));

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

//         let installmentFeesPaid = 0;
//         let installmentFeesConcession = 0;
//         const payments = paymentsByInstallment[instName] || [];

//         for (const payment of payments) {
//           for (const feeItem of payment.feeItems) {
//             installmentFeesPaid += feeItem.paid || 0;
//             installmentFeesConcession += feeItem.concession || 0;
//           }
//         }

//         // Handle refunds
//         let totalRefundAmount = 0;
//         let totalRefundConcession = 0;
//         const relevantRefunds = refunds.filter(
//           (refund) =>
//             refund.feeTypeRefunds.some((ftr) => ftr.installmentName === instName) ||
//             refund.installmentName === instName
//         );

//         for (const refund of relevantRefunds) {
//           const installmentRefunds = refund.feeTypeRefunds?.filter(
//             (ftr) => ftr.installmentName === instName
//           ) || [];
//           for (const ftr of installmentRefunds) {
//             if (refund.status === "Refund" || refund.status === "Cancelled" || refund.status === "Cheque Return") {
//               totalRefundAmount += (ftr.refundAmount || 0) + (ftr.cancelledAmount || 0);
//               totalRefundConcession += ftr.concessionAmount || 0;
//             } else if (["Cancelled", "Cheque Return"].includes(refund.status)) {
//               totalRefundConcession += ftr.concessionAmount || 0;
//             }
//           }
//           if (refund.installmentName === instName) {
//             if (refund.status === "Refund" || refund.status === "Cancelled" || refund.status === "Cheque Return") {
//               totalRefundAmount += (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
//               totalRefundConcession += refund.concessionAmount || 0;
//             } else if (["Cancelled", "Cheque Return"].includes(refund.status)) {
//               totalRefundConcession += refund.concessionAmount || 0;
//             }
//           }
//         }

//         // Adjust fees paid and concession after accounting for refunds
//         installmentFeesPaid = Math.max(0, installmentFeesPaid - totalRefundAmount);
//         installmentFeesConcession = Math.max(0, installmentFeesConcession - totalRefundConcession);

//         const netFeesDue = initialFeesDue - installmentConcession;
//         let currentFeesDue = netFeesDue;

//         for (const payment of payments) {
//           let installmentFeesPaidForPayment = 0;
//           for (const feeItem of payment.feeItems) {
//             installmentFeesPaidForPayment += feeItem.paid || 0;
//           }
//           // Adjust payment-specific fees paid for refunds
//           installmentFeesPaidForPayment = Math.max(0, installmentFeesPaidForPayment - totalRefundAmount);

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
//             concession: installmentConcession,
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
//       await session.abortTransaction();
//       session.endSession();
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
//         (await SchoolFees.find({ schoolId, academicYear, reportStatus: "Paid" })
//           .lean()
//           .session(session)).map((fee) => fee.paymentMode)
//       )
//     )
//       .filter(Boolean)
//       .map((mode) => ({ value: mode, label: mode }));

//     await session.commitTransaction();
//     session.endSession();

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
//     await session.abortTransaction();
//     session.endSession();
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
            return res.status(400).json({ message: "schoolId and academicYear are required" });
        }




        const classAndSections = await ClassAndSection.find({ schoolId, academicYear })
            .lean()
            .session(session);

        const classMap = classAndSections.reduce((acc, item) => {
            acc[item._id.toString()] = item.className;
            return acc;
        }, {});

        const sectionMap = classAndSections.reduce((acc, item) => {
            item.sections.forEach((sec) => {
                acc[sec._id.toString()] = sec.name;
            });
            return acc;
        }, {});

        const filteredClassIds = classes
            ? Object.keys(classMap).filter((id) => classes.split(',').includes(classMap[id]))
            : Object.keys(classMap);

        const filteredSectionIds = sections
            ? Object.keys(sectionMap).filter((id) => sections.split(',').includes(sectionMap[id]))
            : Object.keys(sectionMap);




        const students = await AdmissionForm.find({ schoolId, TCStatus: "Inactive" })
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
        const allFeeTypes = feeTypes.map((t) => t.feesTypeName).sort();

        const result = [];




        for (const student of students) {
            const admissionNumber = student.AdmissionNumber;
            const academicHistory = student.academicHistory.find((h) => h.academicYear === academicYear);
            if (!academicHistory) continue;

            const { masterDefineClass, section } = academicHistory;
            if (!filteredClassIds.includes(masterDefineClass.toString()) ||
                !filteredSectionIds.includes(section.toString())) {
                continue;
            }




            const feesStructures = await FeesStructure.find({
                schoolId,
                classId: masterDefineClass,
                sectionIds: { $in: [section] },
                academicYear,
            }).lean().session(session);

            if (!feesStructures.length) continue;




            const concessionForm = await ConcessionFormModel.findOne({
                AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
                academicYear,
            }).lean().session(session);




            const allPaidFeesData = await SchoolFees.find({
                schoolId,
                studentAdmissionNumber: admissionNumber,
                academicYear,
                reportStatus: "Paid",
            }).lean().session(session);

            const refunds = await Refund.find({
                schoolId,
                admissionNumber,
                academicYear,
                refundType: 'School Fees',
                status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
            }).lean().session(session);




            const expectedInstallments = feesStructures
                .flatMap((s) => s.installments)
                .map((i) => i.name)
                .filter((v, i, a) => a.indexOf(v) === i);

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
                    const name = inst.installmentName;
                    if (!acc[name]) acc[name] = [];
                    acc[name].push(inst);
                    return acc;
                }, {});

            const installments = [];




            for (const instName of filteredInstallments) {
                const structureInst = feesStructures
                    .flatMap((s) => s.installments)
                    .find((i) => i.name === instName);
                if (!structureInst) continue;


                const baseAmounts = {};
                let totalDue = 0;
                for (const fee of structureInst.fees) {
                    const ftId = fee.feesTypeId.toString();
                    const amt = fee.amount || 0;
                    baseAmounts[ftId] = amt;
                    totalDue += amt;
                }


                const concessionByType = {};
                let totalConcession = 0;
                if (concessionForm?.concessionDetails?.length) {
                    for (const fee of structureInst.fees) {
                        const match = concessionForm.concessionDetails.find(
                            (c) => c.installmentName === instName && c.feesType.toString() === fee.feesTypeId.toString()
                        );
                        if (match) {
                            const amt = match.concessionAmount || 0;
                            concessionByType[fee.feesTypeId.toString()] = amt;
                            totalConcession += amt;
                        }
                    }
                }


                const paidByType = {};
                let totalPaid = 0;
                const payments = paymentsByInstallment[instName] || [];
                for (const payment of payments) {
                    for (const item of payment.feeItems) {
                        const ftId = item.feeTypeId?.toString();
                        if (!ftId) continue;
                        const p = item.paid || 0;
                        paidByType[ftId] = (paidByType[ftId] || 0) + p;
                        totalPaid += p;
                    }
                }


                const refundByType = {};
                let totalRefunded = 0;
                const relevantRefunds = refunds.filter(
                    (r) =>
                        r.feeTypeRefunds?.some((f) => f.installmentName === instName) ||
                        r.installmentName === instName
                );

                for (const refund of relevantRefunds) {

                    const perType = refund.feeTypeRefunds?.filter((f) => f.installmentName === instName) || [];
                    for (const f of perType) {
                        const ftId = f.feeTypeId?.toString();
                        if (!ftId) continue;
                        const amt = (f.refundAmount || 0) + (f.cancelledAmount || 0);
                        refundByType[ftId] = (refundByType[ftId] || 0) + amt;
                        totalRefunded += amt;
                    }

                    if (refund.installmentName === instName) {
                        const amt = (refund.refundAmount || 0) + (refund.cancelledAmount || 0);
                        totalRefunded += amt;

                    }
                }


                const netPaidByType = {};
                let netTotalPaid = 0;
                for (const ftId of Object.keys(paidByType)) {
                    const net = Math.max(0, paidByType[ftId] - (refundByType[ftId] || 0));
                    netPaidByType[ftId] = net;
                    netTotalPaid += net;
                }


                const feeTypeDetails = [];
                let runningBalance = totalDue - totalConcession;

                for (const fee of structureInst.fees) {
                    const ftId = fee.feesTypeId.toString();
                    const due = baseAmounts[ftId] || 0;
                    const conc = concessionByType[ftId] || 0;
                    const paid = netPaidByType[ftId] || 0;

                    const balance = due - conc - paid;
                    runningBalance -= paid;

                    feeTypeDetails.push({
                        feeType: feeTypeMap[ftId] || "Unknown",
                        dueAmount: due,
                        paidAmount: paid,
                        concession: conc,
                        refundAmount: refundByType[ftId] || 0,
                        refundConcession: 0,
                        balance: balance > 0 ? balance : 0,
                    });
                }


                const netDue = totalDue - totalConcession;
                const installmentBalance = netDue - netTotalPaid;


                if (payments.length) {

                    for (const payment of payments) {
                        let paidThisPayment = 0;
                        for (const item of payment.feeItems) {
                            const ftId = item.feeTypeId?.toString();
                            if (ftId) paidThisPayment += item.paid || 0;
                        }

                        const netPaidThisPayment = Math.max(0, paidThisPayment - totalRefunded);

                        installments.push({
                            paymentDate: new Date(payment.paymentDate).toLocaleDateString("en-GB"),
                            paymentMode: payment.paymentMode || "-",
                            installmentName: instName,
                            feesDue: netDue,
                            feesPaid: netPaidThisPayment,
                            concession: totalConcession,
                            balance: Math.max(0, netDue - netPaidThisPayment),
                            feeTypeDetails,

                            feeTypes: Object.fromEntries(
                                feeTypeDetails.map((d) => [d.feeType, d.dueAmount])
                            ),
                        });
                    }
                } else {

                    installments.push({
                        paymentDate: "-",
                        paymentMode: "-",
                        installmentName: instName,
                        feesDue: netDue,
                        feesPaid: 0,
                        concession: totalConcession,
                        balance: installmentBalance,
                        feeTypeDetails,
                        feeTypes: Object.fromEntries(
                            feeTypeDetails.map((d) => [d.feeType, d.dueAmount])
                        ),
                    });
                }
            }




            if (installments.length) {
                const uniqueInst = [...new Set(installments.map((i) => i.installmentName))];
                let totalFeesDue = 0,
                    totalFeesPaid = 0,
                    totalConcession = 0,
                    totalBalance = 0;

                for (const name of uniqueInst) {
                    const rows = installments.filter((i) => i.installmentName === name);
                    const first = rows[0];
                    totalFeesDue += first.feesDue;
                    totalFeesPaid += rows.reduce((s, r) => s + r.feesPaid, 0);
                    totalConcession += rows.reduce((s, r) => s + r.concession, 0);
                    totalBalance += rows[rows.length - 1].balance;
                }

                let remark = "";
                if (student.dropoutStatus == null) remark = "TC";
                else if (student.dropoutStatus === "Dropout") remark = "Dropout";


                // result.push({
                //     admissionNumber,
                //     studentName: `${student.firstName} ${student.lastName || ""}`.trim(),
                //     className: classMap[masterDefineClass] || masterDefineClass,
                //     sectionName: sectionMap[section] || section,
                //     academicYear,
                //     TCStatus: student.TCStatus,
                //     TCStatusDate: student.TCStatusDate
                //         ? new Date(student.TCStatusDate).toLocaleDateString("en-GB")
                //         : "-",
                //     Remark: remark,
                //     installments,
                //     totals: {
                //         totalFeesDue,
                //         totalFeesPaid,
                //         totalConcession,
                //         totalBalance,
                //     },
                // });
                if (totalBalance !== 0) {
                    result.push({
                        admissionNumber,
                        studentName: `${student.firstName} ${student.lastName || ""}`.trim(),
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

        }




        if (!result.length) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "No fee data found for the given academic year" });
        }

        const classOptions = Array.from(new Set(Object.values(classMap))).map((n) => ({
            value: n,
            label: n,
        }));
        const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((n) => ({
            value: n,
            label: n,
        }));
        const installmentOptions = Array.from(
            new Set(result.flatMap((r) => r.installments.map((i) => i.installmentName)))
        ).map((n) => ({ value: n, label: n }));

        const paymentModeOptions = Array.from(
            new Set(
                (await SchoolFees.find({ schoolId, academicYear, reportStatus: "Paid" })
                    .lean()
                    .session(session))
                    .map((f) => f.paymentMode)
            )
        )
            .filter(Boolean)
            .map((m) => ({ value: m, label: m }));

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
        console.error("Error fetching student fees due:", error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Server error" });
    }
};

export default getAllStudentFeesDue;