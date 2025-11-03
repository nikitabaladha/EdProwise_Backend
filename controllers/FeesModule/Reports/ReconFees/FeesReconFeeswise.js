import FeesStructure from '../../../../models/FeesModule/FeesStructure.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import OneTimeFees from '../../../../models/FeesModule/OneTimeFees.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import BoardRegistrationFees from '../../../../models/FeesModule/BoardRegistrationFees.js';
import BoardExamFees from '../../../../models/FeesModule/BoardExamFee.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';
import TCForm from '../../../../models/FeesModule/TCForm.js';
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import FeesManagementYear from '../../../../models/FeesModule/FeesManagementYear.js';

const getFeesReconCombined = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.params;
    const { installment } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({ error: 'schoolId and academicYear are required in route params' });
    }

    const academicYearData = await FeesManagementYear.findOne({ schoolId, academicYear });
    if (!academicYearData) {
      return res.status(400).json({ error: `Academic year ${academicYear} not found` });
    }
    const { startDate, endDate } = academicYearData;
    const currentDate = new Date();


    const studentCountsAgg = await AdmissionForm.aggregate([
      { $match: { schoolId, academicYear } },
      { $unwind: '$academicHistory' },
      { $match: { 'academicHistory.academicYear': academicYear } },
      {
        $group: {
          _id: { classId: '$academicHistory.masterDefineClass', sectionId: '$academicHistory.section' },
          count: { $sum: 1 }
        }
      }
    ]);

    const studentCountsMap = {};
    let totalActiveStudents = 0;
    studentCountsAgg.forEach(item => {
      const classId = item._id.classId?.toString();
      const sectionId = item._id.sectionId?.toString();
      if (!classId || !sectionId) return;
      const key = `${classId}_${sectionId}`;
      studentCountsMap[key] = item.count;
      totalActiveStudents += item.count;
    });


    const classSections = await ClassAndSection.find({ schoolId, academicYear }).lean();
    const classSectionMap = {};
    classSections.forEach(cs => {
      const classId = cs._id.toString();
      classSectionMap[classId] = { className: cs.className };
      (cs.sections || []).forEach(sec => {
        const sectionId = sec._id.toString();
        classSectionMap[`${classId}_${sectionId}`] = {
          className: cs.className,
          sectionName: sec.name
        };
      });
    });


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
        const instName = inst.installmentName || (inst.name) || `Installment ${inst.number || ''}`.trim();
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


    const feeStructures = await FeesStructure.find({ schoolId, academicYear })
      .populate({
        path: 'installments.fees.feesTypeId',
        model: 'FeesType',
        match: { groupOfFees: 'School Fees' }
      })
      .lean();

    const schoolFeesBreakdown = {};

    feeStructures.forEach(structure => {
      const classId = structure.classId?.toString();
      if (!classId) return;

      if (!schoolFeesBreakdown[classId]) {
        schoolFeesBreakdown[classId] = {
          className: classSectionMap[classId]?.className || 'Unknown Class',
          sections: {},
          total: 0
        };
      }

      let filteredInstallments = structure.installments || [];
      if (installment) {
        filteredInstallments = filteredInstallments.filter(inst => (inst.name || inst.installmentName) === installment || inst.name === installment || inst.installmentName === installment);
      }

      (structure.sectionIds || []).forEach(sectionId => {
        const sectionIdStr = sectionId.toString();
        const key = `${classId}_${sectionIdStr}`;
        const numStudents = studentCountsMap[key] || 0;
        if (numStudents === 0) return;

        if (!schoolFeesBreakdown[classId].sections[sectionIdStr]) {
          schoolFeesBreakdown[classId].sections[sectionIdStr] = {
            sectionName: classSectionMap[key]?.sectionName || 'Unknown Section',
            installments: {},
            total: 0
          };
        }

        filteredInstallments.forEach(installmentObj => {
          const instName = installmentObj.name || installmentObj.installmentName || `Installment ${installmentObj.number || ''}`.trim();
          const dueDate = installmentObj.dueDate ? new Date(installmentObj.dueDate) : null;
          const isFuture = dueDate ? dueDate > currentDate : false;


          const hasPayment = (installmentObj.fees || []).some(fee => {
            const feeTypeId = fee.feesTypeId?._id?.toString ? fee.feesTypeId._id.toString() : (fee.feesTypeId?.toString ? fee.feesTypeId.toString() : fee.feesTypeId);
            if (!feeTypeId) return false;
            const mapKey = `${key}_${instName}_${feeTypeId}`;
            return (paidMap[mapKey] || 0) > 0;
          });


          if (isFuture && !hasPayment) return;

          if (!schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName]) {
            schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName] = {
              fees: [],
              total: 0
            };
          }

          (installmentObj.fees || []).forEach(fee => {
            const feeType = fee.feesTypeId;

            const feeGroup = feeType?.groupOfFees || (feeType?._doc && feeType._doc.groupOfFees) || null;

            if (feeType && feeGroup && feeGroup !== 'School Fees') return;

            const feeTypeId = feeType?._id?.toString ? feeType._id.toString() : (feeType?.toString ? feeType.toString() : null);
            const feeTypeName = feeType?.feesTypeName || fee.feeTypeName || 'Unknown Fee';
            if (!feeTypeId) return;

            const mapKey = `${key}_${instName}_${feeTypeId}`;
            const netPaidTotal = paidMap[mapKey] || 0;



            const dueAmount = numStudents * (fee.amount || 0);
            const collectable = dueAmount;

            if (collectable <= 0) return;

            schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName].fees.push({
              feesTypeName: feeTypeName,
              amountPerStudent: fee.amount || 0,
              totalDue: dueAmount,
              totalPaid: netPaidTotal,
              collectable
            });

            schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName].total += collectable;
          });

          schoolFeesBreakdown[classId].sections[sectionIdStr].total +=
            schoolFeesBreakdown[classId].sections[sectionIdStr].installments[instName].total;
        });

        schoolFeesBreakdown[classId].total += schoolFeesBreakdown[classId].sections[sectionIdStr].total;
      });
    });


    const feeTypeTotals = new Map();
    Object.values(schoolFeesBreakdown).forEach(classData => {
      Object.values(classData.sections).forEach(sectionData => {
        Object.values(sectionData.installments).forEach(instData => {
          instData.fees.forEach(fee => {
            const current = feeTypeTotals.get(fee.feesTypeName) || 0;
            feeTypeTotals.set(fee.feesTypeName, current + fee.collectable);
          });
        });
      });
    });

    const schoolFeesResponse = {};
    feeTypeTotals.forEach((total, name) => {
      if (total > 0) schoolFeesResponse[name] = total;
    });

    const totalofSchoolfees = Object.values(schoolFeesResponse).reduce((sum, val) => sum + val, 0);


    const regCount = await StudentRegistration.countDocuments({ schoolId, academicYear });
    const tcCount = await TCForm.countDocuments({ schoolId, academicYear });

    const sampleOneTime = await OneTimeFees.findOne({ schoolId, academicYear })
      .populate({ path: 'oneTimeFees.feesTypeId', model: 'FeesType' })
      .lean();

    let regAmount = 0, admAmount = 0, tcAmount = 0;
    if (sampleOneTime?.oneTimeFees) {
      regAmount = sampleOneTime.oneTimeFees.find(f => f.feesTypeId?.feesTypeName === 'Registration Fee')?.amount || 0;
      admAmount = sampleOneTime.oneTimeFees.find(f => f.feesTypeId?.feesTypeName === 'Admission Fee')?.amount || 0;
      tcAmount = sampleOneTime.oneTimeFees.find(f =>
        f.feesTypeId?.feesTypeName?.toLowerCase?.().includes('tc') ||
        f.feesTypeId?.feesTypeName?.toLowerCase?.().includes('transfer')
      )?.amount || 0;
    }

    const regTotal = regCount * regAmount;
    const admTotal = totalActiveStudents * admAmount;
    const tcTotal = tcCount * tcAmount;


    const boardRegStructures = await BoardRegistrationFees.find({ schoolId, academicYear }).lean();
    let boardRegTotal = 0;
    boardRegStructures.forEach(struct => {
      let count = 0;
      (struct.sectionIds || []).forEach(secId => {
        count += studentCountsMap[`${struct.classId}_${secId}`] || 0;
      });
      boardRegTotal += count * (struct.amount || 0);
    });

    const boardExamStructures = await BoardExamFees.find({ schoolId, academicYear }).lean();
    let boardExamTotal = 0;
    boardExamStructures.forEach(struct => {
      let count = 0;
      (struct.sectionIds || []).forEach(secId => {
        count += studentCountsMap[`${struct.classId}_${secId}`] || 0;
      });
      boardExamTotal += count * (struct.amount || 0);
    });

    const oneTimeFeesResponse = {
      'Registration Fee': regTotal,
      'Admission Fee': admTotal,
      'TC Fee': tcTotal,
      'Board Registration Fee': 0,
      'Board Exam Fee': 0
    };

    const totalofOneTimefees = Object.values(oneTimeFeesResponse).reduce((sum, val) => sum + val, 0);
    const grandTotal = totalofSchoolfees + totalofOneTimefees;


    let presentInstallment = 'None';
    if (feeStructures.length > 0 && (feeStructures[0].installments || []).length > 0) {
      const insts = [...feeStructures[0].installments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      const next = insts.find(i => new Date(i.dueDate) >= currentDate);
      presentInstallment = next ? (next.name || next.installmentName || `Installment ${next.number}`) : insts.map(i => i.name || i.installmentName || `Installment ${i.number}`).join(', ');
    }

    res.status(200).json({
      message: 'Combined fees due calculated successfully',
      success: true,
      Schoolfees: schoolFeesResponse,
      totalofSchoolfees,
      totalSchoolFeeTypes: Object.keys(schoolFeesResponse).length,

      schoolFeesBreakdown,
      OneTimefees: oneTimeFeesResponse,
      totalofOneTimefees,
      totalOneTimeFeeTypes: Object.keys(oneTimeFeesResponse).length,
      grandTotal,
      totalFeeTypes: Object.keys(schoolFeesResponse).length + Object.keys(oneTimeFeesResponse).length,
      academicYear,
      schoolId,
      installmentFilter: installment || 'All',
      presentInstallment
    });

  } catch (error) {
    console.error('Error calculating combined fees due:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

export default getFeesReconCombined;
