


import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
import TCForm from '../../../../models/FeesModule/TCForm.js';

const getAdmissionFormsBySchoolId = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({ hasError: true, message: 'School ID is required.' });
  }

  try {

    const forms = await AdmissionFormModel.find({ schoolId });


    const boardExamFees = await BoardExamFeePayment.find({
      schoolId,
      status: 'Paid',
    }).select('admissionId admissionNumber studentName amount paymentMode paymentDate receiptNumberBef academicYear');


    const boardRegistrationFees = await BoardRegistrationFeePayment.find({
      schoolId,
      status: 'Paid',
    }).select('admissionId admissionNumber studentName amount paymentMode paymentDate receiptNumberBrf academicYear');


    const tcForms = await TCForm.find({
      schoolId,
      status: 'Paid',
    }).select('AdmissionNumber firstName lastName finalAmount paymentMode paymentDate receiptNumber academicYear');


    const result = {
      boardExamFees: boardExamFees.map((fee) => ({
        admissionNumber: fee.admissionNumber,
        studentName: fee.studentName,
        paidAmount: fee.amount,
        paymentMode: fee.paymentMode ,
        paymentDate: fee.paymentDate,
        receiptNumber: fee.receiptNumberBef,
        academicYear: fee.academicYear,
        type: 'Board Exam Fee',
      })),
      boardRegistrationFees: boardRegistrationFees.map((fee) => ({
        admissionNumber: fee.admissionNumber,
        studentName: fee.studentName,
        paidAmount: fee.amount,
        paymentMode: fee.paymentMode ,
        paymentDate: fee.paymentDate,
        receiptNumber: fee.receiptNumberBrf,
        academicYear: fee.academicYear,
        type: 'Board Registration Fee',
      })),
      tcForms: tcForms.map((form) => ({
        admissionNumber: form.AdmissionNumber,
        studentName: `${form.firstName} ${form.lastName}`,
        paidAmount: form.finalAmount,
        paymentMode: form.paymentMode ,
        paymentDate: form.paymentDate,
        receiptNumber: form.receiptNumber,
        academicYear: form.academicYear,
        type: 'Transfer Certificate',
      })),
    };


    const allPayments = [
      ...result.boardExamFees,
      ...result.boardRegistrationFees,
      ...result.tcForms,
    ];

    if (!forms.length) {
      return res.status(404).json({
        hasError: true,
        message: `No admission forms found for school ID: ${schoolId}`,
      });
    }


    return res.status(200).json({
      hasError: false,
      message: 'Admission forms and payment records retrieved successfully.',
      data: {
        admissionForms: forms,
        payments: {
          boardExamFees: result.boardExamFees,
          boardRegistrationFees: result.boardRegistrationFees,
          tcForms: result.tcForms,
          allPayments: allPayments
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ hasError: true, message: err.message });
  }
};

export default getAdmissionFormsBySchoolId;