import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import TCForm from '../../../../models/FeesModule/TCForm.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import ConcessionForm from '../../../../models/FeesModule/ConcessionForm.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';


export const studentwiseConcessionReport = async (req, res) => {
  try {
    const { schoolId, academicYear, startDate, endDate } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const feeTypes = await FeesType.find({ academicYear, schoolId }).lean();
    const targetFeeTypes = feeTypes
      .map((type) => type.feesTypeName)
      .filter((name) => name && typeof name === 'string')
      .sort();
    if (!targetFeeTypes.length) {
      return res.status(404).json({ message: 'No valid fee types found for the given academic year and school' });
    }

    const feeTypeMap = feeTypes.reduce((acc, type) => {
      if (type.feesTypeName && typeof type.feesTypeName === 'string') {
        acc[type._id.toString()] = type.feesTypeName;
      }
      return acc;
    }, {});

    const classAndSections = await ClassAndSection.find({ schoolId, academicYear }).lean();
    const classMap = classAndSections.reduce((acc, cls) => {
      acc[cls._id.toString()] = cls.className || '-';
      return acc;
    }, {});
    const sectionMap = classAndSections.reduce((acc, cls) => {
      cls.sections.forEach((sec) => {
        acc[sec._id.toString()] = sec.name || '-';
      });
      return acc;
    }, {});

    const admissionFormsAll = await AdmissionForm.find({ schoolId }).lean();
    const classSectionMap = admissionFormsAll.reduce((acc, form) => {
      const studentId = form.AdmissionNumber;
      if (!acc[studentId]) {
        acc[studentId] = {};
      }
      form.academicHistory?.forEach((history) => {
        if (history.academicYear === academicYear && history.masterDefineClass && history.section) {
          acc[studentId][history.academicYear] = {
            className: classMap[history.masterDefineClass.toString()] || '-',
            sectionName: sectionMap[history.section.toString()] || '-',
          };
        }
      });
      return acc;
    }, {});

    const admissionNumberMap = admissionFormsAll.reduce((acc, form) => {
      if (form.registrationNumber) {
        acc[form.registrationNumber] = form.AdmissionNumber;
      }
      return acc;
    }, {});

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
      };
    }

    const concessionForms = await ConcessionForm.find({
      schoolId,
      academicYear,
      'concessionDetails.concessionAmount': { $gt: 0 },
      ...(startDate && endDate ? { createdAt: dateFilter } : {}),
    }).lean();

 
    const concessionTypeMap = concessionForms.reduce((acc, form) => {
      acc[form.AdmissionNumber] = form.concessionType || '-';
      return acc;
    }, {});

    const [schoolFees, admissionForms, registrationForms, tcForms] = await Promise.all([
      SchoolFees.find({
        schoolId,
        academicYear,
        ...(startDate && endDate ? { 'installments.dueDate': dateFilter } : {}),
      }).lean(),
      AdmissionForm.find({
        schoolId,
        academicYear,
        concessionAmount: { $gt: 0 },
        ...(startDate && endDate ? { paymentDate: dateFilter } : {}),
      }).lean(),
      StudentRegistration.find({
        schoolId,
        academicYear,
        concessionAmount: { $gt: 0 },
        ...(startDate && endDate ? { paymentDate: dateFilter } : {}),
      }).lean(),
      TCForm.find({
        schoolId,
        academicYear,
        concessionAmount: { $gt: 0 },
        ...(startDate && endDate ? { paymentDate: dateFilter } : {}),
      }).lean(),
    ]);

    const concessionsByStudent = {};

    schoolFees.forEach((form) => {
      const studentId = admissionNumberMap[form.studentAdmissionNumber] || form.studentAdmissionNumber;
      const classSection = classSectionMap[studentId]?.[academicYear] || { className: '-', sectionName: '-' };
      if (!concessionsByStudent[studentId]) {
        concessionsByStudent[studentId] = {
          admissionNumber: form.studentAdmissionNumber || '-',
          studentName: form.studentName || '-',
          className: classSection.className,
          sectionName: classSection.sectionName,
          academicYear: form.academicYear,
          concessionType: concessionTypeMap[studentId] || '-', 
          transactions: [],
        };
      }

      form.installments.forEach((installment) => {
        let totalConcession = 0;
        const feeBreakdown = targetFeeTypes.reduce((acc, feeType) => {
          acc[feeType.replace(/\s+/g, '')] = 0;
          return acc;
        }, {});

        installment.feeItems.forEach((item) => {
          const feeTypeName = feeTypeMap[item.feeTypeId?.toString()];
          if (targetFeeTypes.includes(feeTypeName)) {
            const key = feeTypeName.replace(/\s+/g, '');
            feeBreakdown[key] += item.concession || 0;
            totalConcession += item.concession || 0;
          }
        });

        if (totalConcession > 0) {
          concessionsByStudent[studentId].transactions.push({
            installmentName: installment.installmentName || '-',
            date: installment.dueDate || form.createdAt,
            ...feeBreakdown,
            Total: totalConcession,
          });
        }
      });
    });

    admissionForms.forEach((form) => {
      const studentId = form.AdmissionNumber;
      const classSection = classSectionMap[studentId]?.[academicYear] || { className: '-', sectionName: '-' };

      if (!concessionsByStudent[studentId]) {
        concessionsByStudent[studentId] = {
          admissionNumber: form.AdmissionNumber || '-',
          studentName: `${form.firstName} ${form.middleName || ''} ${form.lastName}`.trim() || '-',
          className: classSection.className,
          sectionName: classSection.sectionName,
          academicYear: form.academicYear,
          concessionType: form.concessionType || concessionTypeMap[studentId] || '-', 
          transactions: [],
        };
      }

      if (targetFeeTypes.includes('Admission Fee') && form.concessionAmount > 0) {
        concessionsByStudent[studentId].transactions.push({
          installmentName: '-',
          date: form.paymentDate || form.createdAt,
          AdmissionFee: form.concessionAmount,
          Total: form.concessionAmount,
          ...targetFeeTypes.reduce((acc, feeType) => {
            if (feeType !== 'Admission Fee') acc[feeType.replace(/\s+/g, '')] = 0;
            return acc;
          }, {}),
        });
      }
    });

    registrationForms.forEach((form) => {
      const studentId = admissionNumberMap[form.registrationNumber] || form.registrationNumber;
      const classSection = classSectionMap[studentId]?.[academicYear] || { className: '-', sectionName: '-' };
      if (!concessionsByStudent[studentId]) {
        concessionsByStudent[studentId] = {
          admissionNumber: admissionNumberMap[form.registrationNumber] || '-',
          studentName: `${form.firstName} ${form.middleName || ''} ${form.lastName}`.trim() || '-',
          className: classSection.className,
          sectionName: classSection.sectionName,
          academicYear: form.academicYear,
          concessionType: form.concessionType || concessionTypeMap[studentId] || '-', 
          transactions: [],
        };
      }

      if (targetFeeTypes.includes('Registration Fees') && form.concessionAmount > 0) {
        concessionsByStudent[studentId].transactions.push({
          installmentName: '-',
          date: form.paymentDate || form.createdAt,
          RegistrationFees: form.concessionAmount,
          Total: form.concessionAmount,
          ...targetFeeTypes.reduce((acc, feeType) => {
            if (feeType !== 'Registration Fees') acc[feeType.replace(/\s+/g, '')] = 0;
            return acc;
          }, {}),
        });
      } else {
        console.log(`Skipping registration form for ${form.registrationNumber}: No Registration Fees or concessionAmount <= 0`);
      }
    });

    tcForms.forEach((form) => {
      const studentId = form.AdmissionNumber;
      const classSection = classSectionMap[studentId]?.[academicYear] || { className: '-', sectionName: '-' };
      if (!concessionsByStudent[studentId]) {
        concessionsByStudent[studentId] = {
          admissionNumber: form.AdmissionNumber || '-',
          studentName: `${form.firstName} ${form.middleName || ''} ${form.lastName}`.trim() || '-',
          className: classSection.className,
          sectionName: classSection.sectionName,
          academicYear: form.academicYear,
          concessionType: form.concessionType || concessionTypeMap[studentId] || '-', // Use form's concessionType first
          transactions: [],
        };
      }

      if (targetFeeTypes.includes('TC Fees') && form.concessionAmount > 0) {
        concessionsByStudent[studentId].transactions.push({
          installmentName: '-',
          date: form.paymentDate || form.createdAt,
          TCFees: form.concessionAmount,
          Total: form.concessionAmount,
          ...targetFeeTypes.reduce((acc, feeType) => {
            if (feeType !== 'TC Fees') acc[feeType.replace(/\s+/g, '')] = 0;
            return acc;
          }, {}),
        });
      }
    });

    const result = Object.values(concessionsByStudent)
      .filter((student) => student.transactions.length > 0)
      .map((student) => ({
        ...student,
        transactions: student.transactions.sort((a, b) => new Date(a.date) - new Date(b.date)),
      }))
      .sort((a, b) => a.admissionNumber.localeCompare(b.admissionNumber));

    const grandTotals = result.reduce(
      (acc, student) => {
        student.transactions.forEach((transaction) => {
          targetFeeTypes.forEach((feeType) => {
            const key = feeType.replace(/\s+/g, '');
            acc[`total${key}`] = (acc[`total${key}`] || 0) + (transaction[key] || 0);
          });
          acc.total += transaction.Total || 0;
        });
        return acc;
      },
      { total: 0 }
    );

    res.status(200).json({
      data: result,
      feeTypes: targetFeeTypes,
      grandTotals,
      filterOptions: {
        academicYearOptions: [{ value: academicYear, label: academicYear.replace('-', '-') }],
      },
    });
  } catch (error) {
    console.error('Error fetching concession report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default studentwiseConcessionReport;