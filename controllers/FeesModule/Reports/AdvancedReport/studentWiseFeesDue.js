import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

export const StudentWiseFeesDue = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const students = await AdmissionForm.find({ schoolId, academicYear }).lean();
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

    const feeTypes = await FeesType.find().lean();
    const feeTypeMap = feeTypes.reduce((acc, type) => {
      acc[type._id.toString()] = type.name;
      return acc;
    }, {});

    const result = [];
    const allFeeTypes = feeTypes.map((type) => type.name).sort();

    for (const student of students) {
      const admissionNumber = student.AdmissionNumber;
      const academicHistory = student.academicHistory.find(
        (history) => history.academicYear === academicYear
      );

      if (!academicHistory) continue;

      const { masterDefineClass, section } = academicHistory;

      const feesStructures = await FeesStructure.find({
        schoolId,
        classId: masterDefineClass,
        sectionIds: { $in: [section] },
        academicYear: academicYear
      }).lean();

      if (!feesStructures.length) continue;

      const concessionForm = await ConcessionFormModel.findOne({
        AdmissionNumber: { $regex: `^${admissionNumber}$`, $options: "i" },
        academicYear: academicYear
      }).lean();

      const allPaidFeesData = await SchoolFees.find({
        schoolId,
        studentAdmissionNumber: admissionNumber,
        academicYear
      }).lean();

      const installments = [];


      const allStructureInstallments = feesStructures
        .flatMap((structure) => structure.installments)
        .map(inst => inst.name);


      const paidInstallments = allPaidFeesData
        .flatMap((payment) => payment.installments.map((inst) => inst.installmentName))
        .filter(Boolean);


      const allInstallments = [...new Set([...allStructureInstallments, ...paidInstallments])];


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
            totalCancelledPaidAmount: inst.feeItems.reduce((sum, feeItem) => sum + (feeItem.cancelledPaidAmount || 0), 0)
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


      for (const instName of allInstallments) {
        const structureInst = feesStructures
          .flatMap((structure) => structure.installments)
          .find((inst) => inst.name === instName);

        if (!structureInst) continue;

        let initialFeesDue = 0;
        for (const fee of structureInst.fees) {
          initialFeesDue += fee.amount || 0;
        }

        let currentFeesDue = initialFeesDue;
        const instPayments = paymentsByInstallment[instName] || [];
        const hasPaidData = instPayments.length > 0;


        if (!hasPaidData) {
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

          const balance = initialFeesDue - concession;

          installments.push({
            type: 'Unpaid',
            installmentName: instName,
            feesDue: initialFeesDue,
            feesPaid: 0,
            cancelled: 0,
            concession,
            balance,
            paymentDate: null,
            cancelledDate: null,
            reportStatus: [],
            paymentMode: "-",
            feeTypes: structureInst.fees.reduce((acc, curr) => {
              const feeTypeName = feeTypeMap[curr.feesTypeId.toString()];
              acc[feeTypeName] = curr.amount || 0;
              return acc;
            }, {}),
            cancelledByFeeType: {}
          });
          continue;
        }


        const allEntries = instPayments.map((p) => ({
          ...p,
          sortDate: new Date(p.paymentDate),
        })).sort((a, b) => a.sortDate - b.sortDate);

        for (const entry of allEntries) {
          let feesDue = currentFeesDue;
          let feesPaid = 0;
          let cancelled = 0;
          let concession = 0;
          let paymentDate = null;
          let cancelledDate = null;
          let reportStatus = entry.reportStatus || [];
          let paymentMode = entry.paymentMode || "-";

          if (entry.type === 'Paid') {
            paymentDate = new Date(entry.paymentDate).toLocaleDateString("en-GB");

            for (const feeItem of entry.feeItems) {
              feesPaid += feeItem.paid || 0;
              cancelled += feeItem.cancelledPaidAmount || 0;
            }

            const hasCancelledAmount = cancelled > 0;

            if (!hasCancelledAmount && concessionForm?.concessionDetails?.length) {
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

            if (entry.cancelledDate) {
              cancelledDate = new Date(entry.cancelledDate).toLocaleDateString("en-GB");
            }
          }

          const effectiveFeesPaid = feesPaid - cancelled;
          const balance = currentFeesDue - effectiveFeesPaid - concession;

          installments.push({
            type: entry.type,
            paymentDate,
            cancelledDate,
            reportStatus,
            paymentMode,
            installmentName: instName,
            feesDue,
            feesPaid,
            cancelled,
            concession,
            balance,
            feeTypes: structureInst.fees.reduce((acc, curr) => {
              const feeTypeName = feeTypeMap[curr.feesTypeId.toString()];
              acc[feeTypeName] = curr.amount || 0;
              return acc;
            }, {}),
            cancelledByFeeType: entry.type === 'Paid' ? entry.feeItems.reduce((acc, feeItem) => {
              const feeTypeName = feeTypeMap[feeItem.feeTypeId?.toString()];
              if (feeTypeName && feeItem.cancelledPaidAmount > 0) {
                acc[feeTypeName] = (acc[feeTypeName] || 0) + (feeItem.cancelledPaidAmount || 0);
              }
              return acc;
            }, {}) : {}
          });

          currentFeesDue = balance;
        }
      }

      if (installments.length > 0) {
        const uniqueInstallments = [...new Set(installments.map((inst) => inst.installmentName))];
        let totalFeesDue = 0;
        let totalFeesPaid = 0;
        let totalCancelled = 0;
        let totalConcession = 0;
        let totalBalance = 0;

        for (const instName of uniqueInstallments) {
          const instEntries = installments.filter((inst) => inst.installmentName === instName);
          const firstEntry = instEntries[0];
          totalFeesDue += firstEntry.feesDue;
          totalFeesPaid += instEntries.reduce((sum, inst) => sum + inst.feesPaid, 0);
          totalCancelled += instEntries.reduce((sum, inst) => sum + inst.cancelled, 0);
          totalConcession += instEntries.reduce((sum, inst) => sum + (inst.concession || 0), 0);
          totalBalance += instEntries[instEntries.length - 1].balance;
        }

        result.push({
          admissionNumber,
          studentName: `${student.firstName} ${student.lastName || ''}`,
          className: classMap[masterDefineClass] || masterDefineClass,
          sectionName: sectionMap[section] || section,
          academicYear: student.academicYear,
          installments,
          totals: {
            totalFeesDue,
            totalFeesPaid,
            totalCancelled,
            totalConcession,
            totalBalance,
          },
        });
      }
    }

    if (!result.length) {
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
    console.error('Error fetching student fees due:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default StudentWiseFeesDue;