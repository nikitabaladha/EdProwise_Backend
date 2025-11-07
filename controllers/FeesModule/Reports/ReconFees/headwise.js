
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import FeesStructure from "../../../../models/FeesModule/FeesStructure.js";
import OneTimeFees from "../../../../models/FeesModule/OneTimeFees.js";
import FeesType from "../../../../models/FeesModule/FeesType.js";
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';
import Refund from "../../../../models/FeesModule/RefundFees.js";

export const getReconFeesHeadwise = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;
    if (!schoolId || !academicYear) {
      return res.status(400).json({ message: "schoolId and academicYear are required" });
    }


    const academicYearData = await FeesManagementYear.findOne({ schoolId, academicYear });
    if (!academicYearData) {
      return res.status(400).json({ message: `Academic year ${academicYear} not found` });
    }

    const { startDate, endDate } = academicYearData;
    const currentDate = new Date();

    const classDataList = await ClassAndSection.find({ schoolId, academicYear }).lean();
    if (!classDataList.length) {
      return res.status(404).json({ message: "No class data found for the specified academic year" });
    }

    const admissionDataList = await AdmissionForm.find({
      schoolId,
      paymentMode: { $ne: 'null' },
      status: { $ne: 'Pending' },
    }).lean();

    const feesStructures = await FeesStructure.find({ schoolId, academicYear })
      .populate({
        path: 'installments.fees.feesTypeId',
        model: 'FeesType'
      })
      .lean();

    const oneTimeFeesData = await OneTimeFees.find({ schoolId, academicYear }).lean();
    const feesTypesData = await FeesType.find({ schoolId, academicYear }).lean();


    const paidFees = await SchoolFees.find({
      schoolId,
      academicYear,
      paymentDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] }
    }).lean();


    const paidMap = {};
    paidFees.forEach(payment => {
      const history = (payment.academicHistory && payment.academicHistory[0]) || {};
      const masterDefineClass = (history.masterDefineClass || payment.masterDefineClass || payment.className || payment.classId)?.toString?.() || null;
      const section = (history.section || payment.section || payment.sectionId)?.toString?.() || null;

      if (!masterDefineClass || !section) return;

      const keyPrefix = `${masterDefineClass}_${section}`;

      (payment.installments || []).forEach(inst => {
        const instName = inst.installmentName || inst.name || `Installment ${inst.number || ''}`.trim();
        (inst.feeItems || []).forEach(fi => {
          const netPaid = (fi.paid || 0) - (fi.cancelledPaidAmount || 0);
          if (!netPaid || netPaid <= 0) return;

          const feeTypeId = fi.feeTypeId?.toString ? fi.feeTypeId.toString() : fi.feeTypeId;
          if (!feeTypeId) return;

          const mapKey = `${keyPrefix}_${instName}_${feeTypeId}`;
          paidMap[mapKey] = (paidMap[mapKey] || 0) + netPaid;
        });
      });
    });

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

        const yearlyFeesStructure = feesStructures.find(fs =>
          fs.classId.toString() === classId &&
          fs.sectionIds.some(id => id.toString() === sectionId)
        );


        const filteredInstallments = yearlyFeesStructure ? yearlyFeesStructure.installments
          .filter(inst => {
            const dueDate = inst.dueDate ? new Date(inst.dueDate) : null;
            const isFuture = dueDate ? dueDate > currentDate : false;


            const hasPayment = inst.fees.some(fee => {
              const feeTypeId = fee.feesTypeId?._id?.toString ? fee.feesTypeId._id.toString() :
                (fee.feesTypeId?.toString ? fee.feesTypeId.toString() : fee.feesTypeId);
              if (!feeTypeId) return false;

              const mapKey = `${classId}_${sectionId}_${inst.name}_${feeTypeId}`;
              return (paidMap[mapKey] || 0) > 0;
            });




            return !isFuture || hasPayment;
          })
          .map(inst => ({
            name: inst.name,
            dueDate: inst.dueDate,
            isFuture: inst.dueDate ? new Date(inst.dueDate) > currentDate : false,
            fees: inst.fees.map(fee => {
              const feeTypeId = fee.feesTypeId?._id?.toString ? fee.feesTypeId._id.toString() :
                (fee.feesTypeId?.toString ? fee.feesTypeId.toString() : fee.feesTypeId);
              const feeTypeName = fee.feesTypeId?.feesTypeName || 'Unknown Fee';

              const mapKey = `${classId}_${sectionId}_${inst.name}_${feeTypeId}`;
              const paidAmount = paidMap[mapKey] || 0;

              return {
                feesTypeId: feeTypeId,
                feesTypeName: feeTypeName,
                amount: fee.amount,
                paidAmount: paidAmount,
                dueAmount: totalStudents * fee.amount,
                collectable: (totalStudents * fee.amount) - paidAmount
              };
            }),
          })) : [];


        const schoolFees = filteredInstallments.reduce((sum, inst) =>
          sum + inst.fees.reduce((feeSum, fee) => feeSum + fee.amount, 0), 0
        );

        const oneTimeFees = oneTimeFeesData.find(otf =>
          otf.classId.toString() === classId &&
          otf.sectionIds.some(id => id.toString() === sectionId)
        );

        const admFees = oneTimeFees
          ? oneTimeFees.oneTimeFees
            .filter(fee => {
              const feeType = feesTypesData.find(type => type._id.toString() === fee.feesTypeId.toString());
              return feeType && feeType.feesTypeName === "Admission Fee";
            })
            .reduce((sum, fee) => sum + fee.amount, 0)
          : 0;

        // const yearlyDues = (totalStudents * schoolFees) + (newAdmissions * admFees);
         const yearlyDues = (totalStudents * schoolFees) ;


        const feeTypeTotals = {};
        filteredInstallments.forEach(inst => {
          inst.fees.forEach(fee => {
            const feeTypeName = fee.feesTypeName;
            if (!feeTypeTotals[feeTypeName]) {
              feeTypeTotals[feeTypeName] = 0;
            }
            feeTypeTotals[feeTypeName] += fee.collectable;
          });
        });

        result.push({
          className,
          sectionName,
          existingStudents,
          newAdmission: newAdmissions,
          totalStudents,
          schoolFees,
          admFees,
          yearlyDues,
          installments: filteredInstallments,
          feeTypeWise: feeTypeTotals,
          currentDate: currentDate.toISOString().split('T')[0]
        });
      }
    }

    res.status(200).json({
      data: result,
      academicYear,
      schoolId,
      currentDate: currentDate.toISOString().split('T')[0],
      totalClasses: classDataList.length,
      message: "Recon fees headwise data fetched successfully with installment filtering"
    });
  } catch (error) {
    console.error("Error fetching recon fees headwise data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getReconFeesHeadwise;