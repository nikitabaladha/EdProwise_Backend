import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import Fine from "../../../../models/FeesModule/Fine.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

const formatDate = (date) => {
  if (!date) return '-';
  return date.toLocaleDateString('en-GB').split('/').join('/');
};

export const getAllStudentsFeesWithLateFees = async (req, res) => {
  try {
    const { schoolId, academicYear, startDate, endDate } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: "schoolId and academicYear are required",
      });
    }

    const admissionData = await AdmissionForm.find({ schoolId }).lean();
    if (!admissionData.length) {
      return res.status(404).json({ message: "No admission data found" });
    }

    const feeTypes = await FeesType.find({ academicYear }).lean();
    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.name;
      return acc;
    }, {});

    const fineData = await Fine.findOne({ schoolId, academicYear }).lean();

    const classAndSectionData = await ClassAndSection.find({ schoolId, academicYear }).lean();
    const classMap = classAndSectionData.reduce((acc, cls) => {
      acc[cls._id.toString()] = cls.className;
      cls.sections.forEach((sec) => {
        acc[sec._id.toString()] = sec.name;
      });
      return acc;
    }, {});

    const result = [];
    const seenPayments = new Set(); 

    for (const admission of admissionData) {
      const { AdmissionNumber, firstName, lastName, academicHistory } = admission;
      if (!academicHistory?.length) continue;

      const history = academicHistory.find((h) => h.academicYear === academicYear);
      if (!history) continue;

      const { masterDefineClass, section } = history;

      const feesStructures = await FeesStructure.find({
        schoolId,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
        academicYear,
      }).lean();

      if (!feesStructures.length) continue;

      const concessionForm = await ConcessionFormModel.findOne({
        AdmissionNumber,
        academicYear,
      }).lean();

      const paidFeesData = await SchoolFees.find({
        schoolId,
        studentAdmissionNumber: AdmissionNumber,
        academicYear,
      }).lean();

      for (const structure of feesStructures) {
        for (const inst of structure.installments) {
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

            paidFeesData.forEach((payment) => {
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

            totalBalanceForInstallment += feeAmount - concessionAmount - paidAmount;
          }

          for (const payment of paidFeesData) {
            const matchingInst = payment?.installments?.find(
              (instData) => instData.installmentName === inst.name
            );
            if (!matchingInst || !payment.paymentDate) continue;

            const paymentDate = new Date(payment.paymentDate);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (
              (!start || paymentDate >= start) &&
              (!end || paymentDate <= end)
            ) {
              // Calculate total paid, fine, and excess for the installment
              let totalPaid = 0;
              let paidFine = matchingInst?.fineAmount || 0;
              let excessFees = matchingInst?.excessAmount || 0;

              for (const feeItem of matchingInst.feeItems || []) {
                totalPaid += feeItem.paid || 0;
              }

              // Calculate late fees
              let fineAmount = 0;
              const dueDate = new Date(inst.dueDate);
              const today = new Date();
              if (totalBalanceForInstallment > 0 && today > dueDate && fineData) {
                const { feeType, frequency, value, maxCapFee } = fineData;
                const base = feeType === "percentage" ? (totalBalanceForInstallment * value) / 100 : value;
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

              if (paidFine > 0 || excessFees > 0) {
                const paymentKey = `${AdmissionNumber}_${inst.name}_${payment.receiptNumber}_${formatDate(payment.paymentDate)}`;
                if (!seenPayments.has(paymentKey)) {
                  seenPayments.add(paymentKey);
                  result.push({
                    admissionNumber: AdmissionNumber,
                    studentName: `${firstName} ${lastName || ''}`,
                    className: classMap[masterDefineClass.toString()] || '-',
                    sectionName: classMap[section.toString()] || '-',
                    academicYear,
                    installmentName: inst.name,
                    paymentDate: formatDate(payment.paymentDate),
                    cancelledDate:formatDate(payment.cancelledDate),
                    reportStatus:payment.reportStatus,
                    paymentMode: payment.paymentMode || '-',
                    chequeNoOrTransactionNo:
                    payment.chequeNumber || payment.transactionNumber || '-',
                    receiptNo: payment.receiptNumber || '-',
                    lateFees: fineAmount,
                    paidFine,
                    excessFees,
                    total: totalPaid + paidFine + excessFees,
                  });
                }
              }
            }
          }
        }
      }
    }

    if (!result.length) {
      return res.status(404).json({
        message: `No fee data found for academic year ${academicYear}`,
      });
    }

    return res.status(200).json({
      data: result,
      feeTypes: Object.values(feeTypeMap),
      filterOptions: {
        classOptions: [...new Set(result.map((r) => r.className))].map((c) => ({
          value: c,
          label: c,
        })),
        sectionOptions: [...new Set(result.map((r) => r.sectionName))].map((s) => ({
          value: s,
          label: s,
        })),
        installmentOptions: [...new Set(result.map((r) => r.installmentName))].map((i) => ({
          value: i,
          label: i,
        })),
        paymentModeOptions: [...new Set(result.map((r) => r.paymentMode))].map((p) => ({
          value: p,
          label: p,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export default getAllStudentsFeesWithLateFees;