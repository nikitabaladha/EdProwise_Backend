import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import ConcessionFormModel from "../../../../models/FeesModule/ConcessionForm.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";

export const getAllStudentFeesDue = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: "schoolId and academicYear are required",
      });
    }

    // Fetch all students for the school
    const students = await AdmissionForm.find({ schoolId }).lean();
    if (!students.length) {
      return res.status(404).json({ message: "No students found for the school" });
    }

    // Fetch class and section data
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

      let totalFeesDue = 0;
      let totalFeesPaid = 0;
      let totalConcession = 0;
      let totalBalance = 0;
      const installments = [];

      for (const structure of feesStructures) {
        for (let i = 0; i < structure.installments.length; i++) {
          const inst = structure.installments[i];
          let installmentFeesDue = 0;
          let installmentFeesPaid = 0;
          let installmentConcession = 0;
          let installmentBalance = 0;
          let paymentDate = null;

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
                paymentDate = payment.paymentDate;
              }
            });

            installmentFeesDue += feeAmount;
            installmentConcession += concessionAmount;
            installmentFeesPaid += paidAmount;
            installmentBalance += feeAmount - concessionAmount - paidAmount;
          }

          installments.push({
            installmentName: inst.name,
            paymentDate: paymentDate ? new Date(paymentDate).toLocaleDateString("en-GB") : "-",
            feesDue: installmentFeesDue,
            feesPaid: installmentFeesPaid,
            concession: installmentConcession,
            balance: installmentFeesDue - installmentConcession - installmentFeesPaid,
            paymentMode: allPaidFeesData
              .find((payment) =>
                payment.installments.some((instData) => instData.installmentName === inst.name)
              )?.paymentMode || "-",
            feeTypes: inst.fees.reduce((acc, fee) => {
              const feeTypeName = feeTypeMap[fee.feesTypeId.toString()];
              acc[feeTypeName] = fee.amount || 0;
              return acc;
            }, {}),
          });

          totalFeesDue += installmentFeesDue;
          totalFeesPaid += installmentFeesPaid;
          totalConcession += installmentConcession;
          totalBalance += installmentFeesDue - installmentConcession - installmentFeesPaid;
        }
      }

      result.push({
        admissionNumber,
        studentName: `${student.firstName} ${student.lastName || ""}`,
        className: classMap[masterDefineClass] || masterDefineClass,
        sectionName: sectionMap[section] || section,
        academicYear,
        installments,
        totals: {
          totalFeesDue,
          totalFeesPaid,
          totalConcession,
          totalBalance,
        },
      });
    }

    if (!result.length) {
      return res.status(404).json({ message: "No fee data found for the given academic year" });
    }

    // Fetch filter options
    const classOptions = Array.from(new Set(Object.values(classMap))).map((name) => ({
      value: name,
      label: name,
    }));
    const sectionOptions = Array.from(new Set(Object.values(sectionMap))).map((name) => ({
      value: name,
      label: name,
    }));
    const installmentOptions = Array.from(
      new Set(result.flatMap((student) => student.installments.map((inst) => inst.installmentName)))
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
    console.error("Error fetching student fees due:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getAllStudentFeesDue;