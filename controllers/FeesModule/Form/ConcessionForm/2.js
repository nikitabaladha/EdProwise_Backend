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

      // Debug: Log FeesStructure installments
      console.log(`FeesStructure for ${academicYear}:`, feesStructures.map(s => s.installments));

      for (const structure of feesStructures) {
        for (let i = 0; i < structure.installments.length; i++) {
          const inst = structure.installments[i];
          // Change: Handle inst.number explicitly, allow 0
          const instNumber = inst.number !== undefined ? inst.number : i + 1;

          for (const fee of inst.fees) {
            const feeAmount = fee.amount || 0;
            let concessionAmount = 0;
            let fineAmount = 0;

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
            if (today > dueDate && fineData) {
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

            let paidAmount = 0;

            // Debug: Log SchoolFees installments
            console.log(`SchoolFees for ${academicYear}:`, allPaidFeesData.map(p => p.installments));

            allPaidFeesData.forEach((payment) => {
              // Change: Match by installmentName instead of number
              const matchingInst = payment?.installments?.find(
                (instData) => instData.installmentName === inst.name
              );

              const matchingFeeItem = matchingInst?.feeItems?.find(
                (item) => item.feeTypeId.toString() === fee.feesTypeId.toString()
              );

              if (matchingFeeItem) {
                const individualPaid = matchingFeeItem.paid || 0;
                paidAmount += individualPaid;

                const key = `${inst.name}_${fee.feesTypeId}`; // Change: Use installmentName in key
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
                  excessAmount: matchingInst?.excessAmount || 0, // Updated to use matchingInst
                  paidFine: matchingInst?.fineAmount || 0, // Updated to use matchingInst
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
            new Set(
              feeInstallments.map((item) => item.installmentName)
            )
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