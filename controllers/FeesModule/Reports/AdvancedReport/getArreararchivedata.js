import ArrearFeesArchive from '../../../../models/FeesModule/ArrearFeesArchive.js';

export const getArrearFeesArchive = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;


    if (!schoolId || !academicYear) {
      return res.status(400).json({
        message: 'schoolId and academicYear are required',
      });
    }

    const academicYearRegex = /^\d{4}-\d{4}$/;
    if (!academicYearRegex.test(academicYear)) {
      return res.status(400).json({
        message: 'Invalid academic year format. Use YYYY-YYYY',
      });
    }

    const [startYear, endYear] = academicYear.split('-');
    if (parseInt(endYear) - parseInt(startYear) !== 1) {
      return res.status(400).json({
        message: 'Invalid academic year range. End year must be one year after start year',
      });
    }


    const archiveData = await ArrearFeesArchive.findOne({
      schoolId: schoolId,
      academicYear: academicYear,
    }).lean();

    if (!archiveData) {
      return res.status(404).json({
        message: `No archived data found for schoolId ${schoolId} and academic year ${academicYear}`,
      });
    }


    if (!Array.isArray(archiveData.defaulters)) {
      console.error('Defaulters is not an array:', { schoolId, academicYear, defaulters: archiveData.defaulters });
      return res.status(500).json({
        message: 'Invalid data structure: defaulters is not an array',
      });
    }


    const responseData = {
      schoolId: archiveData.schoolId,
      academicYear: archiveData.academicYear,
      previousAcademicYear: archiveData.previousacademicYear,
      defaulters: archiveData.defaulters.map(defaulter => ({
        admissionNumber: defaulter.admissionNumber || '',
        studentName: defaulter.studentName || '',
        className: defaulter.className || '',
        sectionName: defaulter.sectionName || '',
        academicYear: defaulter.academicYear || '',
        parentContactNumber: defaulter.parentContactNumber || '-',
        tcStatus: defaulter.tcStatus || 'Active',
        admissionPaymentDate: defaulter.admissionPaymentDate || null,
        defaulterType: defaulter.defaulterType || '',
        installments: Array.isArray(defaulter.installments) ? defaulter.installments.map(installment => ({
          paymentDate: installment.paymentDate || '-',
          cancelledDate: installment.cancelledDate || null,
          reportStatus: Array.isArray(installment.reportStatus) ? installment.reportStatus : [],
          paymentMode: installment.paymentMode || '-',
          installmentName: installment.installmentName || '',
          dueDate: installment.dueDate || null,
          feesDue: installment.feesDue || 0,
          netFeesDue: installment.netFeesDue || 0,
          feesPaid: installment.feesPaid || 0,
          concession: installment.concession || 0,
          balance: installment.balance || 0,
          daysOverdue: installment.daysOverdue || 0,
          feeTypes: installment.feeTypes && (installment.feeTypes instanceof Map || typeof installment.feeTypes === 'object')
            ? Object.fromEntries(
              installment.feeTypes instanceof Map
                ? installment.feeTypes.entries()
                : Object.entries(installment.feeTypes)
            )
            : {},
        })) : [],
        totals: {
          totalFeesDue: defaulter.totals?.totalFeesDue || 0,
          totalNetFeesDue: defaulter.totals?.totalNetFeesDue || 0,
          totalFeesPaid: defaulter.totals?.totalFeesPaid || 0,
          totalConcession: defaulter.totals?.totalConcession || 0,
          totalBalance: defaulter.totals?.totalBalance || 0,
        },
      })),
      storedAt: archiveData.storedAt,
      createdAt: archiveData.createdAt,
      updatedAt: archiveData.updatedAt,
    };


    const feeTypes = [...new Set(
      responseData.defaulters.flatMap(defaulter =>
        Array.isArray(defaulter.installments)
          ? defaulter.installments.flatMap(installment =>
            installment.feeTypes && (installment.feeTypes instanceof Map || typeof installment.feeTypes === 'object')
              ? Object.keys(installment.feeTypes)
              : []
          )
          : []
      )
    )].sort().map(type => ({
      value: type,
      label: type,
    }));

    const classOptions = [...new Set(
      responseData.defaulters.map(defaulter => defaulter.className).filter(cls => cls)
    )].sort().map(cls => ({
      value: cls,
      label: cls,
    }));

    const sectionOptions = [...new Set(
      responseData.defaulters.map(defaulter => defaulter.sectionName).filter(section => section)
    )].sort().map(section => ({
      value: section,
      label: section,
    }));

    const installmentOptions = [...new Set(
      responseData.defaulters.flatMap(defaulter =>
        Array.isArray(defaulter.installments)
          ? defaulter.installments.map(installment => installment.installmentName).filter(name => name)
          : []
      )
    )].sort().map(installment => ({
      value: installment,
      label: installment,
    }));

    const paymentModeOptions = [...new Set(
      responseData.defaulters.flatMap(defaulter =>
        Array.isArray(defaulter.installments)
          ? defaulter.installments.map(installment => installment.paymentMode).filter(mode => mode && mode !== '-')
          : []
      )
    )].sort().map(mode => ({
      value: mode,
      label: mode,
    }));


    res.status(200).json({
      data: responseData,
      filterOptions: {
        classOptions,
        sectionOptions,
        installmentOptions,
        feeTypeOptions: feeTypes,
        paymentModeOptions,
      },
    });
  } catch (error) {
    console.error('Error fetching arrear fees archive:', {
      schoolId: req.query.schoolId,
      academicYear: req.query.academicYear,
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export default getArrearFeesArchive;