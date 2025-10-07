// import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
// import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
// import mongoose from 'mongoose';

// const getAdmissionForms = async (req, res) => {
//   try {
//     const { schoolId, academicYear, masterDefineClass, section, admissionNumber } = req.params;
//     if (masterDefineClass && !mongoose.Types.ObjectId.isValid(masterDefineClass)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid masterDefineClass ID',
//       });
//     }
//     if (section && !mongoose.Types.ObjectId.isValid(section)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid section ID',
//       });
//     }


//     if (admissionNumber && !admissionNumber.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid admissionNumber provided',
//       });
//     }


//     const query = { schoolId, 'academicHistory.academicYear': academicYear };
//     if (masterDefineClass) query['academicHistory.masterDefineClass'] = masterDefineClass;
//     if (section) query['academicHistory.section'] = section;
//     if (admissionNumber) query.AdmissionNumber = admissionNumber;


//     const students = await AdmissionForm.find(query).select(
//       'schoolId registrationNumber academicYear academicHistory firstName lastName AdmissionNumber'
//     );

//     const enrichedStudents = await Promise.all(
//       students.map(async (student) => {
//         const academicEntry = student.academicHistory.find(
//           (entry) => entry.academicYear === academicYear
//         );

//         const boardFee = await BoardExamFeePayment.findOne({
//           admissionId: student._id,
//           academicYear,
//           schoolId,
//         });

//         return {
//           ...student.toObject(),
//           AdmissionNumber: student.AdmissionNumber || 'NA',
//           className: boardFee?.className || (academicEntry?.masterDefineClass ? String(academicEntry.masterDefineClass) : null),
//           sectionName: boardFee?.sectionName || (academicEntry?.section ? String(academicEntry.section) : null),
//           boardExamStatus: boardFee?.status || 'Pending',
//           paymentMode: boardFee?.paymentMode || 'N/A',
//           chequeNumber: boardFee?.chequeNumber || 'N/A',
//           bankName: boardFee?.bankName || 'N/A',
//           receiptNumberBef: boardFee?.receiptNumberBef || 'N/A',
//           reportStatus: boardFee ? boardFee.reportStatus || ['N/A'] : ['N/A'],
//           refundReceiptNumbers: boardFee ? boardFee.refundReceiptNumbers || ['N/A'] : ['N/A'],
//         };
//       })
//     );

//     if (enrichedStudents.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: [],
//         message: 'No board exam forms found for the specified academic year and criteria.',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: enrichedStudents,
//     });
//   } catch (error) {
//     console.error('Error in getAdmissionForms:', error);
//     return res.status(500).json({
//       success: false,
//       message: `Server error: ${error.message}`,
//     });
//   }
// };

// export default getAdmissionForms;

import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
import mongoose from 'mongoose';

const getAdmissionForms = async (req, res) => {
  try {
    const { schoolId, academicYear, masterDefineClass, section, admissionNumber } = req.params;


    if (masterDefineClass && !mongoose.Types.ObjectId.isValid(masterDefineClass)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid masterDefineClass ID',
      });
    }
    if (section && !mongoose.Types.ObjectId.isValid(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section ID',
      });
    }
    if (admissionNumber && !admissionNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admissionNumber provided',
      });
    }

    
    const query = { schoolId, 'academicHistory.academicYear': academicYear };
    if (masterDefineClass) query['academicHistory.masterDefineClass'] = masterDefineClass;
    if (section) query['academicHistory.section'] = section;
    if (admissionNumber) query.AdmissionNumber = admissionNumber;

    
    const students = await AdmissionForm.find(query).select(
      'schoolId registrationNumber academicYear academicHistory firstName lastName AdmissionNumber'
    );


    const admissionIds = students.map((student) => student._id);
    const boardFees = await BoardExamFeePayment.find({
      admissionId: { $in: admissionIds },
      academicYear,
      schoolId,
    });

 
    const boardFeesByAdmissionId = boardFees.reduce((acc, fee) => {
      if (!acc[fee.admissionId]) {
        acc[fee.admissionId] = [];
      }
      acc[fee.admissionId].push(fee);
      return acc;
    }, {});

    
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const academicEntry = student.academicHistory.find(
          (entry) => entry.academicYear === academicYear
        );

        let fees = boardFeesByAdmissionId[student._id] || [];

        fees = fees.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate));

 
        const lastPaymentMode = fees[fees.length - 1]?.paymentMode || 'N/A';

     
        const getSortedUniqueByDate = (getValue) => {
          const uniqueMap = new Map();
          fees.forEach((fee) => {
            const value = getValue(fee);
            if (value && !Array.isArray(value) && !uniqueMap.has(value)) {
              uniqueMap.set(value, new Date(fee.paymentDate));
            }
          });
          return Array.from(uniqueMap.entries())
            .sort(([, dateA], [, dateB]) => dateA - dateB)
            .map(([value]) => value);
        };

   
        const getSortedUniqueRefundsByDate = () => {
          const uniqueMap = new Map();
          fees.forEach((fee) => {
            (fee.refundReceiptNumbers || []).forEach((crn) => {
              if (crn && !uniqueMap.has(crn)) {
                uniqueMap.set(crn, new Date(fee.paymentDate));
              }
            });
          });
          return Array.from(uniqueMap.entries())
            .sort(([, dateA], [, dateB]) => dateA - dateB)
            .map(([value]) => value);
        };


        const combinedData = {
          paymentMode: lastPaymentMode,
          receiptNumberBef: getSortedUniqueByDate((fee) => fee.receiptNumberBef).filter(Boolean),
          reportStatus: fees.flatMap((fee) => fee.reportStatus || []).filter(Boolean), 
          refundReceiptNumbers: getSortedUniqueRefundsByDate(),
          boardExamStatus: fees.some((fee) => fee.status === 'Paid') ? 'Paid' : 'Pending',
          chequeNumber: [...new Set(fees.map((fee) => fee.chequeNumber || 'N/A'))].filter(Boolean),
          bankName: [...new Set(fees.map((fee) => fee.bankName || 'N/A'))].filter(Boolean),
          className: fees[0]?.className || (academicEntry?.masterDefineClass ? String(academicEntry.masterDefineClass) : null),
          sectionName: fees[0]?.sectionName || (academicEntry?.section ? String(academicEntry.section) : null),
        };

        return {
          ...student.toObject(),
          AdmissionNumber: student.AdmissionNumber || 'NA',
          className: combinedData.className,
          sectionName: combinedData.sectionName,
          boardExamStatus: combinedData.boardExamStatus,
          paymentMode: combinedData.paymentMode,
          chequeNumber: combinedData.chequeNumber.join(', '),
          bankName: combinedData.bankName.join(', '),
          receiptNumberBef: combinedData.receiptNumberBef,
          reportStatus: combinedData.reportStatus,
          refundReceiptNumbers: combinedData.refundReceiptNumbers,
        };
      })
    );

 
    const uniqueStudents = Object.values(
      enrichedStudents.reduce((acc, student) => {
        const key = student.AdmissionNumber;
        if (!acc[key]) {
          acc[key] = student;
        } else {
          
          acc[key].receiptNumberBef = [...new Set([...(acc[key].receiptNumberBef || []), ...(student.receiptNumberBef || [])])].filter(Boolean);
          acc[key].reportStatus = [...(acc[key].reportStatus || []), ...(student.reportStatus || [])].filter(Boolean);
          acc[key].refundReceiptNumbers = [...new Set([...(acc[key].refundReceiptNumbers || []), ...(student.refundReceiptNumbers || [])])].filter(Boolean);
          acc[key].boardExamStatus =
            acc[key].boardExamStatus === 'Paid' || student.boardExamStatus === 'Paid'
              ? 'Paid'
              : 'Pending';
          acc[key].paymentMode = student.paymentMode; 
        }
        return acc;
      }, {})
    );

    if (uniqueStudents.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No board exam forms found for the specified academic year and criteria.',
      });
    }

    return res.status(200).json({
      success: true,
      data: uniqueStudents,
    });
  } catch (error) {
    console.error('Error in getAdmissionForms:', error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export default getAdmissionForms;