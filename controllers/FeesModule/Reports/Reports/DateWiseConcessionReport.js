// import ConcessionFormModel from '../../../../models/FeesModule/ConcessionForm.js';
// import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
// import FeesType from '../../../../models/FeesModule/FeesType.js';

// export const getConcessionReport = async (req, res) => {
//   try {
//     const { schoolId, academicYear, startDate, endDate } = req.query;

//     if (!schoolId || !academicYear) {
//       return res.status(400).json({
//         message: 'schoolId and academicYear are required',
//       });
//     }


//     const feeTypes = await FeesType.find({ academicYear, schoolId }).lean();
//     const targetFeeTypes = feeTypes
//       .map((type) => type.feesTypeName)
//       .filter((name) => name && typeof name === 'string')
//       .sort();
//     if (!targetFeeTypes.length) {
//       return res.status(404).json({ message: 'No valid fee types found for the given academic year and school' });
//     }


//     const feeTypeMap = feeTypes.reduce((acc, type) => {
//       if (type.feesTypeName && typeof type.feesTypeName === 'string') {
//         acc[type._id.toString()] = type.feesTypeName;
//       }
//       return acc;
//     }, {});


//     let dateFilter = {};
//     if (startDate && endDate) {
//       dateFilter = {
//         $gte: new Date(startDate),
//         $lte: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
//       };
//     }

 
//     const concessionForms = await ConcessionFormModel.find({
//       schoolId,
//       academicYear,
//       ...(startDate && endDate ? { createdAt: dateFilter } : {}),
//     }).lean();

//     const admissionForms = await AdmissionForm.find({
//       schoolId,
//       academicYear,
//       concessionAmount: { $gt: 0 },
//       ...(startDate && endDate ? { paymentDate: dateFilter } : {}),
//     }).lean();

//     const registrationForms = await StudentRegistration.find({
//       schoolId,
//       academicYear,
//       concessionAmount: { $gt: 0 },
//       ...(startDate && endDate ? { paymentDate: dateFilter } : {}),
//     }).lean();

   
//     const concessionsByDate = {};


//     concessionForms.forEach((form) => {
//       const date = new Date(form.createdAt).toLocaleDateString('en-GB');
//       if (!concessionsByDate[date]) {
//         concessionsByDate[date] = {
//           date,
//           ...targetFeeTypes.reduce((acc, feeType) => {
//             acc[feeType.replace(/\s+/g, '')] = 0;
//             return acc;
//           }, {}),
//           Total: 0,
//         };
//       }

//       form.concessionDetails.forEach((detail) => {
//         const feeTypeName = feeTypeMap[detail.feesType.toString()];
//         if (targetFeeTypes.includes(feeTypeName)) {
//           const key = feeTypeName.replace(/\s+/g, '');
//           concessionsByDate[date][key] += detail.concessionAmount || 0;
//           concessionsByDate[date].Total += detail.concessionAmount || 0;
//         }
//       });
//     });

   
//     admissionForms.forEach((form) => {
//       const date = form.paymentDate
//         ? new Date(form.paymentDate).toLocaleDateString('en-GB')
//         : new Date(form.createdAt).toLocaleDateString('en-GB'); 
//       if (!concessionsByDate[date]) {
//         concessionsByDate[date] = {
//           date,
//           ...targetFeeTypes.reduce((acc, feeType) => {
//             acc[feeType.replace(/\s+/g, '')] = 0;
//             return acc;
//           }, {}),
//           Total: 0,
//         };
//       }
//       if (targetFeeTypes.includes('Admission Fee')) {
//         concessionsByDate[date].AdmissionFee += form.concessionAmount || 0;
//         concessionsByDate[date].Total += form.concessionAmount || 0;
//       }
//     });

  
//     registrationForms.forEach((form) => {
//       const date = form.paymentDate
//         ? new Date(form.paymentDate).toLocaleDateString('en-GB')
//         : new Date(form.createdAt).toLocaleDateString('en-GB'); 
//       if (!concessionsByDate[date]) {
//         concessionsByDate[date] = {
//           date,
//           ...targetFeeTypes.reduce((acc, feeType) => {
//             acc[feeType.replace(/\s+/g, '')] = 0;
//             return acc;
//           }, {}),
//           Total: 0,
//         };
//       }
//       if (targetFeeTypes.includes('Registration Fees')) {
//         concessionsByDate[date].RegistrationFees += form.concessionAmount || 0;
//         concessionsByDate[date].Total += form.concessionAmount || 0;
//       }
//     });

 
//     const result = Object.values(concessionsByDate).sort((a, b) => {
//       const dateA = new Date(a.date.split('/').reverse().join('-'));
//       const dateB = new Date(b.date.split('/').reverse().join('-'));
//       return dateA - dateB;
//     });


//     const grandTotals = result.reduce(
//       (acc, record) => {
//         targetFeeTypes.forEach((feeType) => {
//           const key = feeType.replace(/\s+/g, '');
//           acc[`total${key}`] = (acc[`total${key}`] || 0) + (record[key] || 0);
//         });
//         acc.total += record.Total;
//         return acc;
//       },
//       { total: 0 }
//     );

//     res.status(200).json({
//       data: result,
//       feeTypes: targetFeeTypes,
//       grandTotals,
//       filterOptions: {
//         academicYearOptions: [{ value: academicYear, label: academicYear.replace('-', '-') }],
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching concession report:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export default getConcessionReport;


import {SchoolFees} from '../../../../models/FeesModule/SchoolFees.js';
import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import FeesType from '../../../../models/FeesModule/FeesType.js';

export const getConcessionReport = async (req, res) => {
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


    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
      };
    }


    const schoolFees = await SchoolFees.find({
      schoolId,
      academicYear,
      ...(startDate && endDate ? { 'installments.dueDate': dateFilter } : {}),
    }).lean();

    const admissionForms = await AdmissionForm.find({
      schoolId,
      academicYear,
      concessionAmount: { $gt: 0 },
      ...(startDate && endDate ? { paymentDate: dateFilter } : {}),
    }).lean();

    const registrationForms = await StudentRegistration.find({
      schoolId,
      academicYear,
      concessionAmount: { $gt: 0 },
      ...(startDate && endDate ? { paymentDate: dateFilter } : {}),
    }).lean();


    const concessionsByDate = {};

    schoolFees.forEach((form) => {
      form.installments.forEach((installment) => {
        const date = installment.dueDate
          ? new Date(installment.dueDate).toLocaleDateString('en-GB')
          : new Date(form.createdAt).toLocaleDateString('en-GB'); 
        if (!concessionsByDate[date]) {
          concessionsByDate[date] = {
            date,
            ...targetFeeTypes.reduce((acc, feeType) => {
              acc[feeType.replace(/\s+/g, '')] = 0;
              return acc;
            }, {}),
            Total: 0,
          };
        }

        installment.feeItems.forEach((item) => {
          const feeTypeName = feeTypeMap[item.feeTypeId.toString()];
          if (targetFeeTypes.includes(feeTypeName)) {
            const key = feeTypeName.replace(/\s+/g, '');
            concessionsByDate[date][key] += item.concession || 0;
            concessionsByDate[date].Total += item.concession || 0;
          }
        });
      });
    });

    admissionForms.forEach((form) => {
      const date = form.paymentDate
        ? new Date(form.paymentDate).toLocaleDateString('en-GB')
        : new Date(form.createdAt).toLocaleDateString('en-GB'); 
      if (!concessionsByDate[date]) {
        concessionsByDate[date] = {
          date,
          ...targetFeeTypes.reduce((acc, feeType) => {
            acc[feeType.replace(/\s+/g, '')] = 0;
            return acc;
          }, {}),
          Total: 0,
        };
      }
      if (targetFeeTypes.includes('Admission Fee')) {
        concessionsByDate[date].AdmissionFee += form.concessionAmount || 0;
        concessionsByDate[date].Total += form.concessionAmount || 0;
      }
    });


    registrationForms.forEach((form) => {
      const date = form.paymentDate
        ? new Date(form.paymentDate).toLocaleDateString('en-GB')
        : new Date(form.createdAt).toLocaleDateString('en-GB'); 
      if (!concessionsByDate[date]) {
        concessionsByDate[date] = {
          date,
          ...targetFeeTypes.reduce((acc, feeType) => {
            acc[feeType.replace(/\s+/g, '')] = 0;
            return acc;
          }, {}),
          Total: 0,
        };
      }
      if (targetFeeTypes.includes('Registration Fees')) {
        concessionsByDate[date].RegistrationFees += form.concessionAmount || 0;
        concessionsByDate[date].Total += form.concessionAmount || 0;
      }
    });

   
    const result = Object.values(concessionsByDate).sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA - dateB;
    });

   
    const grandTotals = result.reduce(
      (acc, record) => {
        targetFeeTypes.forEach((feeType) => {
          const key = feeType.replace(/\s+/g, '');
          acc[`total${key}`] = (acc[`total${key}`] || 0) + (record[key] || 0);
        });
        acc.total += record.Total;
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