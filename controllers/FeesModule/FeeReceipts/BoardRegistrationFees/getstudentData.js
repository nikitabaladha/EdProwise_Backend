import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js'; 

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

    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const academicEntry = student.academicHistory.find(
          (entry) => entry.academicYear === academicYear
        );

        const boardFee = await BoardRegistrationFeePayment.findOne({
          admissionId: student._id,
          academicYear,
          schoolId,
        });

        return {
          ...student.toObject(),
          AdmissionNumber: student.AdmissionNumber || 'NA',
          className: boardFee?.className || (academicEntry?.masterDefineClass ? String(academicEntry.masterDefineClass) : null),
          sectionName: boardFee?.sectionName || (academicEntry?.section ? String(academicEntry.section) : null),
          boardRegistrationStatus: boardFee?.status || 'Pending',
          paymentMode: boardFee?.paymentMode || 'N/A',
          chequeNumber: boardFee?.chequeNumber || 'N/A',
          bankName: boardFee?.bankName || 'N/A',
          receiptNumberBrf: boardFee?.receiptNumberBrf || 'N/A',
        };
      })
    );

    if (enrichedStudents.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No board registration forms found for the specified academic year and criteria.',
      });
    }

    return res.status(200).json({
      success: true,
      data: enrichedStudents,
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
