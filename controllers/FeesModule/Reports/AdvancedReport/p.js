import mongoose from 'mongoose';
import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import { AdmissionPayment } from "../../../../models/FeesModule/AdmissionForm.js";
import Refund from "../../../../models/FeesModule/RefundFees.js";
import DefaulterFeesArchive from "../../../../models/FeesModule/DefaulterFeesArchive.js";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";

const validateDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
};

const uniq = (arr) => Array.from(new Set(arr)).filter(Boolean);

export default async function computeDefaulterFees(
    schoolId,
    academicYear,
    session,
    classes,
    sections,
    installment
) {
    const today = new Date();




    const yearDoc = await FeesManagementYear.findOne({ schoolId, academicYear })
        .lean()
        .session(session);

    let isEnded = false;
    if (yearDoc?.endDate) {
        const end = validateDate(yearDoc.endDate);
        if (end && today > end) isEnded = true;
    }

    const archived = await DefaulterFeesArchive.findOne({ schoolId, academicYear })
        .lean()
        .session(session);

    if (isEnded && archived?.defaulters?.length) {
        const filtered = archived.defaulters
            .filter(d =>
                d.tcStatus === 'Active' &&
                (!classes || classes.split(',').includes(d.className)) &&
                (!sections || sections.split(',').includes(d.sectionName)) &&
                (!installment || d.installments.some(i => i.installmentName === installment))
            )
            .map(d => ({
                ...d,
                lockDate: archived.storedAt
                    ? new Date(archived.storedAt).toLocaleDateString("en-GB")
                    : null,
            }));

        return {
            hasError: false,
            message: "Archived defaulters",
            data: filtered,
            feeTypes: [],
            filterOptions: {
                classOptions: uniq(filtered.map(d => d.className)).map(v => ({ value: v, label: v })),
                sectionOptions: uniq(filtered.map(d => d.sectionName)).map(v => ({ value: v, label: v })),
                installmentOptions: uniq(filtered.flatMap(d => d.installments.map(i => i.installmentName))).map(v => ({ value: v, label: v })),
                paymentModeOptions: uniq(filtered.flatMap(d => d.installments.map(i => i.paymentMode))).map(v => ({ value: v, label: v })),
                tcStatusOptions: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }],
            },
        };
    }




    const students = await AdmissionForm.find({ schoolId })
        .select('AdmissionNumber firstName lastName parentContactNumber academicHistory TCStatus')
        .lean()
        .session(session);

    if (!students.length && !archived?.defaulters?.length) {
        return { hasError: false, message: "No data", data: [], feeTypes: [], filterOptions: {} };
    }

    const lateThreshold = new Date(today);
    lateThreshold.setMonth(today.getMonth() - 3);




    const classSections = await ClassAndSection.find({ schoolId, academicYear })
        .lean()
        .session(session);

    const classMap = classSections.reduce((acc, c) => {
        acc[c._id.toString()] = c.className;
        return acc;
    }, {});

    const sectionMap = {};
    classSections.forEach(c => {
        c.sections.forEach(s => sectionMap[s._id.toString()] = s.name);
    });

    const filteredClassIds = classes
        ? Object.keys(classMap).filter(id => classes.split(',').includes(classMap[id]))
        : Object.keys(classMap);

    const filteredSectionIds = sections
        ? Object.keys(sectionMap).filter(id => sections.split(',').includes(sectionMap[id]))
        : Object.keys(sectionMap);




    const feeTypes = await FeesType.find({ schoolId, academicYear })
        .lean()
        .session(session);

    const feeTypeMap = feeTypes.reduce((acc, ft) => {
        acc[ft._id.toString()] = ft.feesTypeName || "Unknown";
        return acc;
    }, {});

    const allFeeTypes = feeTypes.map(ft => ft.feesTypeName).filter(Boolean).sort();

    const resultMap = new Map();




    for (const student of students) {
        const admissionNumber = student.AdmissionNumber;
        const tcStatus = student.TCStatus || 'Active';
        if (tcStatus === 'Inactive') continue;

        const history = student.academicHistory?.find(h => h.academicYear === academicYear);
        if (!history) continue;

        const { masterDefineClass, section } = history;
        if (!filteredClassIds.includes(masterDefineClass.toString()) ||
            !filteredSectionIds.includes(section.toString())) continue;

        const structures = await FeesStructure.find({
            schoolId,
            classId: masterDefineClass,
            sectionIds: { $in: [section] },
            academicYear,
        }).lean().session(session);
        if (!structures.length) continue;

        const paidFees = await SchoolFees.find({
            schoolId,
            studentAdmissionNumber: admissionNumber,
            academicYear,
        }).lean().session(session);


        const firstPayment = await AdmissionPayment.findOne({
            studentId: student._id,
            schoolId,
            academicYear,
            status: 'Paid',
        }).sort({ paymentDate: 1 }).lean().session(session);

        const isLate = firstPayment && validateDate(firstPayment.paymentDate) >= lateThreshold;

        const refunds = await Refund.find({
            schoolId,
            admissionNumber,
            academicYear,
            refundType: 'School Fees',
            status: { $in: ['Refund', 'Cancelled', 'Cheque Return'] },
        }).lean().session(session);




        const paymentsByInst = paidFees
            .flatMap(p => p.installments.map(i => ({
                ...i,
                paymentDate: validateDate(p.paymentDate),
                paymentMode: p.paymentMode || "-",
            })))
            .reduce((acc, i) => {
                const k = i.installmentName;
                if (!acc[k]) acc[k] = [];
                acc[k].push(i);
                return acc;
            }, {});




        const allInstallments = structures.flatMap(s => s.installments);
        const instNames = [...new Set(allInstallments.map(i => i.name))];
        const sortedInstallments = instNames.sort((a, b) => {
            const da = validateDate(allInstallments.find(i => i.name === a)?.dueDate);
            const db = validateDate(allInstallments.find(i => i.name === b)?.dueDate);
            return da && db ? da - db : 0;
        });
        const targetInstallments = installment ? [installment] : sortedInstallments;

        const defaulterInstallments = [];
        const lateInstallments = [];




        for (const name of targetInstallments) {
            const inst = allInstallments.find(i => i.name === name);
            if (!inst?.dueDate) continue;
            const due = validateDate(inst.dueDate);
            if (!due || today <= due) continue;

            const daysOverdue = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));

            const feeBreakdown = [];

            for (const f of inst.fees) {
                const ftId = f.feesTypeId?.toString();
                const feeName = feeTypeMap[ftId] || "Unknown";
                const dueAmt = f.amount || 0;

                let paid = 0, conc = 0;
                const pays = paymentsByInst[name] || [];
                for (const p of pays) {
                    if (p.cancelledDate) continue;
                    for (const fi of p.feeItems) {
                        if (fi.feeTypeId?.toString() === ftId) {
                            paid += fi.paid || 0;
                            conc += fi.concession || 0;
                        }
                    }
                }

                let refAmt = 0, refConc = 0, cancelledAmt = 0;
                const relR = refunds.filter(r =>
                    r.installmentName === name ||
                    r.feeTypeRefunds?.some(ftr => ftr.feeType.toString() === ftId && ftr.installmentName === name)
                );

                for (const r of relR) {
                    if (r.installmentName === name) {
                        refAmt += (r.refundAmount || 0);
                        cancelledAmt += (r.cancelledAmount || 0);
                        refConc += r.concessionAmount || 0;
                    }
                    for (const ftr of r.feeTypeRefunds || []) {
                        if (ftr.feeType.toString() === ftId && ftr.installmentName === name) {
                            refAmt += (ftr.refundAmount || 0);
                            cancelledAmt += (ftr.cancelledAmount || 0);
                            refConc += ftr.concessionAmount || 0;
                        }
                    }
                }

                paid = Math.max(0, paid - refAmt);
                conc = Math.max(0, conc - refConc);
                const net = dueAmt - conc;
                const balance = net - paid;

                if (balance > 0) {
                    feeBreakdown.push({
                        feeType: feeName,
                        dueAmount: dueAmt,
                        paidAmount: paid,
                        concession: conc,
                        refundAmount: refAmt,
                        cancelledAmount: cancelledAmt,
                        balance,
                    });
                }
            }

            if (!feeBreakdown.length) continue;

            const totalDue = feeBreakdown.reduce((s, b) => s + b.dueAmount, 0);
            const totalPaid = feeBreakdown.reduce((s, b) => s + b.paidAmount, 0);
            const totalConc = feeBreakdown.reduce((s, b) => s + b.concession, 0);
            const totalBalance = feeBreakdown.reduce((s, b) => s + b.balance, 0);

            defaulterInstallments.push({
                installmentName: name,
                dueDate: due.toLocaleDateString("en-GB"),
                paymentMode: paymentsByInst[name]?.[0]?.paymentMode || "-",
                paymentDate: paymentsByInst[name]?.[0]?.paymentDate?.toLocaleDateString("en-GB") || "-",
                feesDue: totalDue,
                netFeesDue: totalDue - totalConc,
                feesPaid: totalPaid,
                concession: totalConc,
                balance: totalBalance,
                daysOverdue,
                feeBreakdown,
            });
        }




        if (isLate && defaulterInstallments.length === 0) {
            let firstPaidIdx = -1;
            for (let i = 0; i < sortedInstallments.length; i++) {
                const name = sortedInstallments[i];
                const inst = allInstallments.find(s => s.name === name);
                if (!inst) continue;

                let due = 0;
                for (const f of inst.fees) due += f.amount || 0;

                let paid = 0, conc = 0;
                const pays = paymentsByInst[name] || [];
                for (const p of pays) {
                    for (const fi of p.feeItems) {
                        paid += fi.paid || 0;
                        conc += fi.concession || 0;
                    }
                }

                let refAmt = 0, refConc = 0, cancelledAmt = 0;
                const relR = refunds.filter(r =>
                    r.installmentName === name ||
                    r.feeTypeRefunds?.some(ftr => ftr.installmentName === name)
                );
                for (const r of relR) {
                    if (r.installmentName === name) {
                        refAmt += (r.refundAmount || 0);
                        cancelledAmt += (r.cancelledAmount || 0);
                        refConc += r.concessionAmount || 0;
                    }
                    for (const ftr of r.feeTypeRefunds || []) {
                        if (ftr.installmentName === name) {
                            refAmt += (ftr.refundAmount || 0);
                            cancelledAmt += (ftr.cancelledAmount || 0);
                            refConc += ftr.concessionAmount || 0;
                        }
                    }
                }

                paid = Math.max(0, paid - refAmt);
                conc = Math.max(0, conc - refConc);
                const net = due - conc;

                if (paid >= net && net > 0) {
                    firstPaidIdx = i;
                    break;
                }
            }

            if (firstPaidIdx !== -1) {
                for (let i = 0; i < firstPaidIdx; i++) {
                    const name = sortedInstallments[i];
                    if (!targetInstallments.includes(name)) continue;
                    const inst = allInstallments.find(s => s.name === name);
                    if (!inst?.dueDate) continue;
                    const due = validateDate(inst.dueDate);
                    if (!due) continue;

                    const daysOverdue = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));

                    const feeBreakdown = [];
                    for (const f of inst.fees) {
                        const ftId = f.feesTypeId?.toString();
                        const feeName = feeTypeMap[ftId] || "Unknown";
                        const dueAmt = f.amount || 0;

                        let paid = 0, conc = 0;
                        const pays = paymentsByInst[name] || [];
                        for (const p of pays) {
                            for (const fi of p.feeItems) {
                                if (fi.feeTypeId?.toString() === ftId) {
                                    paid += fi.paid || 0;
                                    conc += fi.concession || 0;
                                }
                            }
                        }

                        let refAmt = 0, refConc = 0, cancelledAmt = 0;
                        const relR = refunds.filter(r =>
                            r.installmentName === name ||
                            r.feeTypeRefunds?.some(ftr => ftr.feeType.toString() === ftId && ftr.installmentName === name)
                        );
                        for (const r of relR) {
                            if (r.installmentName === name) {
                                refAmt += (r.refundAmount || 0);
                                cancelledAmt += (r.cancelledAmount || 0);
                                refConc += r.concessionAmount || 0;
                            }
                            for (const ftr of r.feeTypeRefunds || []) {
                                if (ftr.feeType.toString() === ftId && ftr.installmentName === name) {
                                    refAmt += (ftr.refundAmount || 0);
                                    cancelledAmt += (ftr.cancelledAmount || 0);
                                    refConc += ftr.concessionAmount || 0;
                                }
                            }
                        }

                        paid = Math.max(0, paid - refAmt);
                        conc = Math.max(0, conc - refConc);
                        const net = dueAmt - conc;
                        const balance = net - paid;

                        if (balance > 0) {
                            feeBreakdown.push({
                                feeType: feeName,
                                dueAmount: dueAmt,
                                paidAmount: paid,
                                concession: conc,
                                refundAmount: refAmt,
                                cancelledAmount: cancelledAmt,
                                balance,
                            });
                        }
                    }

                    if (!feeBreakdown.length) continue;

                    const totalDue = feeBreakdown.reduce((s, b) => s + b.dueAmount, 0);
                    const totalPaid = feeBreakdown.reduce((s, b) => s + b.paidAmount, 0);
                    const totalConc = feeBreakdown.reduce((s, b) => s + b.concession, 0);
                    const totalBalance = feeBreakdown.reduce((s, b) => s + b.balance, 0);

                    lateInstallments.push({
                        installmentName: name,
                        dueDate: due.toLocaleDateString("en-GB"),
                        paymentMode: paymentsByInst[name]?.[0]?.paymentMode || "-",
                        paymentDate: paymentsByInst[name]?.[0]?.paymentDate?.toLocaleDateString("en-GB") || "-",
                        feesDue: totalDue,
                        netFeesDue: totalDue - totalConc,
                        feesPaid: totalPaid,
                        concession: totalConc,
                        balance: totalBalance,
                        daysOverdue,
                        feeBreakdown,
                    });
                }
            }
        }




        const allStudentInstallments = [...defaulterInstallments, ...lateInstallments];
        if (!allStudentInstallments.length) continue;

        const defType = [];
        if (defaulterInstallments.length) defType.push("Defaulter");
        if (lateInstallments.length) defType.push("LateAdmission");

        const seen = new Set();
        const uniqInstallments = allStudentInstallments.filter(i => {
            const k = `${i.installmentName}-${i.feesPaid}-${i.paymentDate}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });

        for (const inst of uniqInstallments) {
            const key = `${admissionNumber}-${inst.installmentName}`;
            resultMap.set(key, {
                admissionNumber,
                studentName: `${student.firstName} ${student.lastName || ''}`.trim(),
                className: classMap[masterDefineClass] || masterDefineClass,
                sectionName: sectionMap[section] || section,
                academicYear,
                parentContactNumber: student.parentContactNumber || '-',
                tcStatus,
                admissionPaymentDate: firstPayment?.paymentDate
                    ? validateDate(firstPayment.paymentDate)?.toLocaleDateString("en-GB")
                    : null,
                defaulterType: defType.join(", "),
                installments: [inst],
                totals: {
                    totalFeesDue: inst.feesDue,
                    totalNetFeesDue: inst.netFeesDue,
                    totalFeesPaid: inst.feesPaid,
                    totalConcession: inst.concession,
                    totalBalance: inst.balance,
                },
            });
        }
    }




    if (archived?.defaulters?.length) {
        for (const d of archived.defaulters) {
            if (
                (classes && !classes.split(',').includes(d.className)) ||
                (sections && !sections.split(',').includes(d.sectionName)) ||
                (installment && !d.installments.some(i => i.installmentName === installment))
            ) continue;

            const key = `${d.admissionNumber}-${d.installments[0]?.installmentName || 'arch'}`;
            resultMap.set(key, {
                ...d,
                lockDate: archived.storedAt ? new Date(archived.storedAt).toLocaleDateString("en-GB") : null,
            });
        }
    }

    const data = Array.from(resultMap.values());

    return {
        hasError: false,
        message: "Success",
        data,
        feeTypes: allFeeTypes,
        filterOptions: {
            classOptions: uniq([...Object.values(classMap), ...data.map(d => d.className)]).map(v => ({ value: v, label: v })),
            sectionOptions: uniq([...Object.values(sectionMap), ...data.map(d => d.sectionName)]).map(v => ({ value: v, label: v })),
            installmentOptions: uniq(data.flatMap(d => d.installments.map(i => i.installmentName))).map(v => ({ value: v, label: v })),
            paymentModeOptions: uniq([
                ...(await SchoolFees.find({ schoolId, academicYear }).lean().session(session)).map(f => f.paymentMode),
                ...data.flatMap(d => d.installments.map(i => i.paymentMode))
            ]).map(v => ({ value: v, label: v })),
            tcStatusOptions: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }],
        },
    };
}