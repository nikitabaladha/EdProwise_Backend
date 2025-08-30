import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';
import ClassAndSection from '../../../../models/FeesModule/Class&Section.js';

export const getConcessionReport = async (req, res) => {
  try {
    const { schoolId, academicYear, startDate, endDate } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    // Fetch fee types
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

    // Fetch class and section data
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

    // Fetch admission forms to map class and section
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

    // Date filter for queries
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
      };
    }

    // Fetch data
    const [schoolFees, admissionForms, registrationForms] = await Promise.all([
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
    ]);

    // Process concessions by date
    const concessionsByDate = {};

    schoolFees.forEach((form) => {
      const studentId = admissionNumberMap[form.studentAdmissionNumber] || form.studentAdmissionNumber;
      const classSection = classSectionMap[studentId]?.[academicYear] || { className: '-', sectionName: '-' };

      form.installments.forEach((installment) => {
        const date = installment.dueDate
          ? new Date(installment.dueDate).toLocaleDateString('en-GB')
          : new Date(form.createdAt).toLocaleDateString('en-GB');
        if (!concessionsByDate[date]) {
          concessionsByDate[date] = [];
        }

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
          concessionsByDate[date].push({
            admissionNumber: form.studentAdmissionNumber || '-',
            studentName: form.studentName || '-',
            className: classSection.className,
            sectionName: classSection.sectionName,
            academicYear: form.academicYear,
            installmentName: installment.installmentName || '-',
            date,
            ...feeBreakdown,
            Total: totalConcession,
          });
        }
      });
    });

    admissionForms.forEach((form) => {
      const studentId = form.AdmissionNumber;
      const classSection = classSectionMap[studentId]?.[academicYear] || { className: '-', sectionName: '-' };
      const date = form.paymentDate
        ? new Date(form.paymentDate).toLocaleDateString('en-GB')
        : new Date(form.createdAt).toLocaleDateString('en-GB');

      if (!concessionsByDate[date]) {
        concessionsByDate[date] = [];
      }

      if (targetFeeTypes.includes('Admission Fee') && form.concessionAmount > 0) {
        concessionsByDate[date].push({
          admissionNumber: form.AdmissionNumber || '-',
          studentName: `${form.firstName} ${form.middleName || ''} ${form.lastName}`.trim() || '-',
          className: classSection.className,
          sectionName: classSection.sectionName,
          academicYear: form.academicYear,
          installmentName: '-',
          date,
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
      const date = form.paymentDate
        ? new Date(form.paymentDate).toLocaleDateString('en-GB')
        : new Date(form.createdAt).toLocaleDateString('en-GB');

      if (!concessionsByDate[date]) {
        concessionsByDate[date] = [];
      }

      if (targetFeeTypes.includes('Registration Fees') && form.concessionAmount > 0) {
        concessionsByDate[date].push({
          admissionNumber: admissionNumberMap[form.registrationNumber] || '-',
          studentName: `${form.firstName} ${form.middleName || ''} ${form.lastName}`.trim() || '-',
          className: classSection.className,
          sectionName: classSection.sectionName,
          academicYear: form.academicYear,
          installmentName: '-',
          date,
          RegistrationFees: form.concessionAmount,
          Total: form.concessionAmount,
          ...targetFeeTypes.reduce((acc, feeType) => {
            if (feeType !== 'Registration Fees') acc[feeType.replace(/\s+/g, '')] = 0;
            return acc;
          }, {}),
        });
      }
    });

    // Flatten and sort results
    const result = Object.values(concessionsByDate)
      .flat()
      .sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA - dateB;
      });

    // Calculate grand totals
    const grandTotals = result.reduce(
      (acc, record) => {
        targetFeeTypes.forEach((feeType) => {
          const key = feeType.replace(/\s+/g, '');
          acc[`total${key}`] = (acc[`total${key}`] || 0) + (record[key] || 0);
        });
        acc.total += record.Total || 0;
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

export default getConcessionReport;