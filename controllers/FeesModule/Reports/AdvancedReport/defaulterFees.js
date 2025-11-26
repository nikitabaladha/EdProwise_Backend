import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

export const UnpaidPastDueStudents = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: "schoolId and academicYear are required",
      });
    }

    const students = await AdmissionForm.find({ schoolId }).lean();
    if (!students.length) {
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

    const feeTypes = await FeesType.find({ academicYear }).lean();
    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.name || "Unknown";
      return acc;
    }, {});

    const result = [];
    const allFeeTypes = feeTypes.map((type) => type.name).filter(Boolean).sort();

    for (const student of students) {
      const admissionNumber = student.AdmissionNumber;
      const parentContactNumber = student.parentContactNumber || '-';
      const academicHistory = student.academicHistory.find(
        (history) => history.academicYear === academicYear
      );

      if (!academicHistory) continue;

      const { masterDefineClass, section } = academicHistory;

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

      const installments = [];
      let hasUnpaidPastDueInstallment = false;
      const allInstallments = feesStructures.flatMap((structure) => structure.installments);
      const installmentNames = [...new Set(allInstallments.map((inst) => inst.name))].sort(
        (a, b) => {
          const dueDateA = allInstallments.find((inst) => inst.name === a)?.dueDate;
          const dueDateB = allInstallments.find((inst) => inst.name === b)?.dueDate;
          return dueDateA && dueDateB ? new Date(dueDateA) - new Date(dueDateB) : 0;
        }
      );

      for (const instName of installmentNames) {
        const structureInst = allInstallments.find((inst) => inst.name === instName);
        if (!structureInst || !structureInst.dueDate) continue;

        const dueDate = new Date(structureInst.dueDate);
        const today = new Date();
        if (today <= dueDate) continue;

        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

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

        if (installmentFeesPaid === 0) {
          hasUnpaidPastDueInstallment = true;
          installments.push({
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
            daysOverdue,
            feeTypes: structureInst.fees.reduce((acc, curr) => {
              const feeTypeName = feeTypeMap[curr.feesTypeId.toString()] || "Unknown";
              acc[feeTypeName] = curr.amount || 0;
              return acc;
            }, {}),
          });
        }
      }

      if (hasUnpaidPastDueInstallment) {
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

        result.push({
          admissionNumber,
          studentName: `${student.firstName} ${student.lastName || ''}`,
          className: classMap[masterDefineClass] || masterDefineClass,
          sectionName: sectionMap[section] || section,
          academicYear,
          parentContactNumber,
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
      return res.status(404).json({ message: "No students found with unpaid past-due installments" });
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
    console.error("Error fetching unpaid past-due students:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default UnpaidPastDueStudents;