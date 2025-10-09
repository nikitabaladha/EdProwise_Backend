import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import Refund from "../../../../models/FeesModule/RefundFees.js";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";

export const getAllStudentFeesDue = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }
    const schoolIdString = schoolId.trim();

    const academicYearData = await FeesManagementYear.findOne({ schoolId: schoolIdString, academicYear });
    if (!academicYearData) {
      return res.status(400).json({
        message: `Academic year ${academicYear} not found for schoolId ${schoolIdString}`,
      });
    }
    const { startDate, endDate } = academicYearData;

    const students = await AdmissionForm.find({ schoolId }).lean();
    if (!students.length) {
      return res.status(404).json({ message: "No students found for the school" });
    }

    const classAndSections = await ClassAndSection.find({ schoolId }).lean();
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

    const feeTypes = await FeesType.find({ schoolId}).lean();
    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.feesTypeName;
      return acc;
    }, {});

    const result = [];
    const allFeeTypes = feeTypes.map((type) => type.feesTypeName).filter(Boolean).sort();

    for (const student of students) {
      const admissionNumber = student.AdmissionNumber;
      const academicHistory = student.academicHistory.find(
        (history) => history.academicYear === student.academicYear
      );

      if (!academicHistory) continue;

      const { masterDefineClass, section } = academicHistory;

      const feesStructures = await FeesStructure.find({
        schoolId,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
       academicYear:student.academicYear
      }).lean();

      if (!feesStructures.length) continue;

      const concessionForm = await ConcessionFormModel.findOne({
        AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
        academicYear:student.academicYear
      }).lean();

      const allPaidFeesData = await SchoolFees.find({
        schoolId,
        studentAdmissionNumber: admissionNumber,
        paymentDate: { $gte: startDate, $lte: endDate },
      }).lean();

      const refunds = await Refund.find({
        schoolId,
        admissionNumber,
        $or: [
          { $and: [{ status: 'Refund' }, { refundDate: { $gte: startDate, $lte: endDate } }] },
          { $and: [{ status: { $in: ['Cancelled', 'Cheque Return'] } }, { cancelledDate: { $gte: startDate, $lte: endDate } }] }
        ],
        refundType: 'School Fees',
      }).lean();

      const installments = [];

      // Group payments by installment
      const paymentsByInstallment = allPaidFeesData
        .flatMap((payment) => 
          payment.installments.map((inst) => ({
            type: 'Paid',
            installmentName: inst.installmentName,
            paymentDate: payment.paymentDate,
            paymentMode: payment.paymentMode || "-",
            reportStatus: payment.reportStatus || [],
            cancelledDate: payment.cancelledDate,
            feeItems: inst.feeItems,
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

      const refundEntries = refunds.map((refund) => ({
        type: refund.status,
        installmentName: refund.installmentName,
        date: refund.status === 'Refund' ? refund.refundDate : refund.cancelledDate,
        refundAmount: refund.status === 'Refund' ? refund.refundAmount || 0 : 0,
        cancelledAmount: refund.status === 'Cancelled' ? refund.cancelledAmount || 0 : 0,
        chequeReturnAmount: refund.status === 'Cheque Return' ? refund.cancelledAmount || 0 : 0,
        paymentMode: refund.paymentMode,
        receiptNumber: refund.receiptNumber,
        paidAmount: refund.feeTypeRefunds.reduce((sum, ftr) => sum + (ftr.paidAmount || 0), 0),
        feeTypeRefunds: refund.feeTypeRefunds || [], 
      }));

      for (const instName in paymentsByInstallment) {
        const structureInst = feesStructures
          .flatMap((structure) => structure.installments)
          .find((inst) => inst.name === instName);

        if (!structureInst) continue;

        let initialFeesDue = 0;
        const feeTypesBreakdownBase = {}; 
        for (const fee of structureInst.fees) {
          const feeTypeId = fee.feesTypeId.toString();
          const feeTypeName = feeTypeMap[feeTypeId] || "Unknown";
          initialFeesDue += fee.amount || 0;
          feeTypesBreakdownBase[feeTypeName] = {
            amount: fee.amount || 0,
            paid: 0,
            concession: 0,
            refund: 0,
            cancelled: 0,
            chequeReturn: 0,
          };
        }

        let currentFeesDue = initialFeesDue;
        const instPayments = paymentsByInstallment[instName];
        const instRefunds = refundEntries.filter((r) => r.installmentName === instName);


        const allEntries = [
          ...instPayments.map((p) => ({
            ...p,
            sortDate: new Date(p.paymentDate),
          })),
          ...instRefunds.map((r) => ({
            ...r,
            sortDate: new Date(r.date),
          })),
        ].sort((a, b) => a.sortDate - b.sortDate);

        let concessionApplied = false; 

        for (const entry of allEntries) {
          let feesPaid = 0;
          let concession = 0;
          let refund = 0;
          let cancelled = 0;
          let chequeReturn = 0;
          let paymentDate = null;
          let refundDate = null;
          let cancelledDate = null;
          let chequeReturnDate = null;
          let reportStatus = entry.reportStatus || [];
          let paymentMode = entry.paymentMode || "-";
          let receiptNumber = entry.receiptNumber || null;

          // Clone base breakdown for this entry
          const feeTypesBreakdown = JSON.parse(JSON.stringify(feeTypesBreakdownBase));

          if (entry.type === 'Paid') {
            paymentDate = new Date(entry.paymentDate).toLocaleDateString("en-GB");
            for (const feeItem of entry.feeItems) {
              const feeTypeId = feeItem.feeTypeId.toString();
              const feeTypeName = feeTypeMap[feeTypeId] || "Unknown";
              const paid = feeItem.paid || 0;
              feesPaid += paid;
              feeTypesBreakdown[feeTypeName].paid += paid;
            }

            if (!concessionApplied && concessionForm?.concessionDetails?.length) {
              for (const fee of structureInst.fees) {
                const feeTypeId = fee.feesTypeId.toString();
                const feeTypeName = feeTypeMap[feeTypeId] || "Unknown";
                const concessionMatch = concessionForm.concessionDetails.find(
                  (c) =>
                    c.installmentName === instName &&
                    c.feesType.toString() === feeTypeId
                );
                if (concessionMatch) {
                  const concAmount = concessionMatch.concessionAmount || 0;
                  concession += concAmount;
                  feeTypesBreakdown[feeTypeName].concession += concAmount;
                }
              }
              concessionApplied = true; // Mark as applied
            }

            if (entry.cancelledDate) {
              cancelledDate = new Date(entry.cancelledDate).toLocaleDateString("en-GB");
            }
          } else if (entry.type === 'Refund') {
            refund = entry.refundAmount;
            feesPaid = entry.paidAmount || 0;
            refundDate = new Date(entry.date).toLocaleDateString("en-GB");
            for (const ftr of entry.feeTypeRefunds) {
              const feeTypeId = ftr.feeType.toString();
              const feeTypeName = feeTypeMap[feeTypeId] || "Unknown";
              const refAmount = ftr.refundAmount || 0;
              refund += refAmount; 
              feeTypesBreakdown[feeTypeName].refund += refAmount;
              feeTypesBreakdown[feeTypeName].paid = ftr.paidAmount || 0; 
              feeTypesBreakdown[feeTypeName].balance = ftr.balance || 0;
            }
          } else if (entry.type === 'Cancelled') {
            cancelled = entry.cancelledAmount;
            feesPaid = entry.paidAmount || 0;
            cancelledDate = new Date(entry.date).toLocaleDateString("en-GB");
            for (const ftr of entry.feeTypeRefunds) {
              const feeTypeId = ftr.feeType.toString();
              const feeTypeName = feeTypeMap[feeTypeId] || "Unknown";
              const cancAmount = ftr.cancelledAmount || 0;
              cancelled += cancAmount;
              feeTypesBreakdown[feeTypeName].cancelled += cancAmount;
              feeTypesBreakdown[feeTypeName].paid = ftr.paidAmount || 0;
              feeTypesBreakdown[feeTypeName].balance = ftr.balance || 0;
            }
          } else if (entry.type === 'Cheque Return') {
            chequeReturn = entry.chequeReturnAmount;
            feesPaid = entry.paidAmount || 0;
            chequeReturnDate = new Date(entry.date).toLocaleDateString("en-GB");
            for (const ftr of entry.feeTypeRefunds) {
              const feeTypeId = ftr.feeType.toString();
              const feeTypeName = feeTypeMap[feeTypeId] || "Unknown";
              const chqAmount = ftr.cancelledAmount || 0; // Assuming cheque return uses cancelledAmount field
              chequeReturn += chqAmount;
              feeTypesBreakdown[feeTypeName].chequeReturn += chqAmount;
              feeTypesBreakdown[feeTypeName].paid = ftr.paidAmount || 0;
              feeTypesBreakdown[feeTypeName].balance = ftr.balance || 0;
            }
          }

          const balance =
            currentFeesDue - feesPaid - concession + refund + cancelled + chequeReturn;

          installments.push({
            type: entry.type,
            paymentDate,
            refundDate,
            cancelledDate,
            chequeReturnDate,
            reportStatus,
            paymentMode,
            receiptNumber,
            installmentName: instName,
            feesDue: currentFeesDue,
            feesPaid,
            concession,
            refund,
            cancelled,
            chequeReturn,
            balance,
            feeTypes: feeTypesBreakdown, 
          });

          currentFeesDue = balance;
        }
      }

      if (installments.length > 0) {
        const uniqueInstallments = [...new Set(installments.map((inst) => inst.installmentName))];
        let totalFeesDue = 0;
        let totalFeesPaid = 0;
        let totalConcession = 0;
        let totalRefund = 0;
        let totalCancelled = 0;
        let totalChequeReturn = 0;
        let totalBalance = 0;

        for (const instName of uniqueInstallments) {
          const instEntries = installments.filter((inst) => inst.installmentName === instName);
          const firstEntry = instEntries[0];
          totalFeesDue += firstEntry.feesDue;
          totalFeesPaid += instEntries.reduce((sum, inst) => sum + inst.feesPaid, 0);
          totalConcession += instEntries.reduce((sum, inst) => sum + inst.concession, 0);
          totalRefund += instEntries.reduce((sum, inst) => sum + inst.refund, 0);
          totalCancelled += instEntries.reduce((sum, inst) => sum + inst.cancelled, 0);
          totalChequeReturn += instEntries.reduce((sum, inst) => sum + inst.chequeReturn, 0);
          totalBalance += instEntries[instEntries.length - 1].balance;
        }

        result.push({
          admissionNumber,
          studentName: `${student.firstName} ${student.lastName || ''}`,
          className: classMap[masterDefineClass] || masterDefineClass,
          sectionName: sectionMap[section] || section,
          academicYear,
          installments,
          totals: {
            totalFeesDue,
            totalFeesPaid,
            totalConcession,
            totalRefund,
            totalCancelled,
            totalChequeReturn,
            totalBalance,
          },
        });
      }
    }

    if (!result.length) {
      return res.status(404).json({ message: "No paid fee data found for the given academic year" });
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
        (await SchoolFees.find({ schoolId }).lean()).map((fee) => fee.paymentMode).filter(mode => mode && mode !== '-')
      )
    ).map((mode) => ({ value: mode, label: mode }));

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
    res.status(500).json({ message: "Server error" });
  }
};

export default getAllStudentFeesDue;