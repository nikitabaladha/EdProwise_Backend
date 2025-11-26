import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import OneTimeFees from "../../../../models/FeesModule/OneTimeFees.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";

export const getReconFeesHeadwise = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({ message: "schoolId and academicYear are required" });
    }

    const classDataList = await ClassAndSection.find({ schoolId, academicYear }).lean();
    if (!classDataList.length) {
      return res.status(404).json({ message: "No class data found for the specified academic year" });
    }

    const admissionDataList = await AdmissionForm.find({
      schoolId,
      paymentMode: { $ne: 'null' },
      status: { $ne: 'Pending' },
    }).lean();

    const feesStructures = await FeesStructure.find({ schoolId, academicYear }).lean();
    const oneTimeFeesData = await OneTimeFees.find({ schoolId, academicYear }).lean();
    const feesTypesData = await FeesType.find({ schoolId, academicYear }).lean();

    const result = [];

    for (const cls of classDataList) {
      const classId = cls._id.toString();
      const className = cls.className;

      for (const section of cls.sections) {
        const sectionId = section._id.toString();
        const sectionName = section.name;

        const classAdmissions = admissionDataList.filter(admission => {
          const history = admission.academicHistory.find(entry => entry.academicYear === academicYear);
          return history && history.masterDefineClass.toString() === classId && history.section.toString() === sectionId;
        });

        const existingStudents = classAdmissions.filter(admission => {
          const history = admission.academicHistory;
          const currentYearEntry = history.find(entry => entry.academicYear === academicYear);
          const previousYears = history.filter(entry => entry.academicYear < academicYear);
          return currentYearEntry && previousYears.length > 0;
        }).length;

        const newAdmissions = classAdmissions.filter(admission => {
          const history = admission.academicHistory;
          const currentYearEntry = history.find(entry => entry.academicYear === academicYear);
          const previousYears = history.filter(entry => entry.academicYear < academicYear);
          return currentYearEntry && previousYears.length === 0;
        }).length;

        const totalStudents = existingStudents + newAdmissions;

        const yearlyFeesStructure = feesStructures.find(fs => fs.classId.toString() === classId && fs.sectionIds.some(id => id.toString() === sectionId));
        const schoolFees = yearlyFeesStructure ? yearlyFeesStructure.installments.reduce((sum, inst) => sum + inst.fees.reduce((feeSum, fee) => feeSum + fee.amount, 0), 0) : 0;

        const installments = yearlyFeesStructure ? yearlyFeesStructure.installments.map(inst => ({
          name: inst.name,
          fees: inst.fees.map(fee => ({
            feesTypeId: fee.feesTypeId,
            amount: fee.amount,
          })),
        })) : [];

        const oneTimeFees = oneTimeFeesData.find(otf => otf.classId.toString() === classId && otf.sectionIds.some(id => id.toString() === sectionId));
        const admFees = oneTimeFees
          ? oneTimeFees.oneTimeFees
              .filter(fee => {
                const feeType = feesTypesData.find(type => type._id.toString() === fee.feesTypeId.toString());
                return feeType && feeType.feesTypeName === "Admission Fee";
              })
              .reduce((sum, fee) => sum + fee.amount, 0)
          : 0;

        const yearlyDues = (totalStudents * schoolFees) + (newAdmissions * admFees);

        result.push({
          className,
          sectionName,
          existingStudents,
          newAdmission: newAdmissions,
          totalStudents,
          schoolFees,
          admFees,
          yearlyDues,
          installments,
        });
      }
    }

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error("Error fetching recon fees headwise data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getReconFeesHeadwise;