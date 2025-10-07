import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
import BoardExamFeePayment from '../../../../models/FeesModule/BoardExamFeePayment.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js';
import { TCPayment } from '../../../../models/FeesModule/TCForm.js'; 
import RefundFees from '../../../../models/FeesModule/RefundFees.js';
import { SchoolFees } from '../../../../models/FeesModule/SchoolFees.js'; 
import { AdmissionPayment } from '../../../../models/FeesModule/AdmissionForm.js'; 
import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js'; 

const getAdmissionFormsBySchoolId = async (req, res) => {
  const { schoolId } = req.params;

  if (!schoolId) {
    return res.status(400).json({ hasError: true, message: 'School ID is required.' });
  }

  try {
    const forms = await AdmissionFormModel.find({ schoolId });


    const boardExamFees = await BoardExamFeePayment.find({
      schoolId,
      status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
    }).select('admissionId admissionNumber firstName lastName finalAmount paymentMode paymentDate receiptNumberBef academicYear status cancelledDate');

    const boardRegistrationFees = await BoardRegistrationFeePayment.find({
      schoolId,
      status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
    }).select('admissionId admissionNumber firstName lastName finalAmount paymentMode paymentDate receiptNumberBrf academicYear status cancelledDate');

    const tcPayments = await TCPayment.find({
      schoolId,
      status: { $in: ['Paid', 'Cancelled', 'Cheque Return'] },
    }).populate('tcFormId', 'AdmissionNumber firstName lastName'); 

    const refundFeesRaw = await RefundFees.find({ schoolId })
      .select('admissionNumber firstName lastName refundAmount paymentMode paymentDate receiptNumber academicYear status refundDate refundType feeTypeRefunds classId installmentName existancereceiptNumber')
      .populate('feeTypeRefunds.feeType', 'name');
    const refundFeesWithOriginalAmount = await Promise.all(
      refundFeesRaw.map(async (refund) => {
        let originalPaidAmount = 0;

        try {
          if (refund.refundType === 'School Fees') {
            const schoolFee = await SchoolFees.findOne({ schoolId, receiptNumber: refund.existancereceiptNumber });
            if (schoolFee) {
              originalPaidAmount = schoolFee.installments.reduce((sum, installment) => {
                return sum + installment.feeItems.reduce((itemSum, feeItem) => itemSum + (feeItem.paid || 0), 0);
              }, 0);
            }
          } else if (refund.refundType === 'Admission Fee') {
            const admissionPayment = await AdmissionPayment.findOne({ schoolId, receiptNumber: refund.existancereceiptNumber });
            if (admissionPayment) originalPaidAmount = admissionPayment.finalAmount;
          } else if (refund.refundType === 'Registration Fee') {
            const registrationPayment = await RegistrationPayment.findOne({ schoolId, receiptNumber: refund.existancereceiptNumber });
            if (registrationPayment) originalPaidAmount = registrationPayment.finalAmount;
          } else if (refund.refundType === 'Transfer Certificate Fee') {
            const tcPayment = await TCPayment.findOne({ schoolId, receiptNumber: refund.existancereceiptNumber });
            if (tcPayment) originalPaidAmount = tcPayment.finalAmount;
          } else if (refund.refundType === 'Board Exam Fee') {
            const boardExamPayment = await BoardExamFeePayment.findOne({ schoolId, receiptNumberBef: refund.existancereceiptNumber });
            if (boardExamPayment) originalPaidAmount = boardExamPayment.finalAmount;
          } else if (refund.refundType === 'Board Registration Fee') {
            const boardRegPayment = await BoardRegistrationFeePayment.findOne({ schoolId, receiptNumberBrf: refund.existancereceiptNumber });
            if (boardRegPayment) originalPaidAmount = boardRegPayment.finalAmount;
          }
        } catch (fetchErr) {
          console.error(`Error fetching original amount for refund ${refund._id}:`, fetchErr);
          // Fallback to 0 or log, but continue
        }

        return {
          ...refund.toObject(),
          originalPaidAmount, // New field for original fee amount from payment model
        };
      })
    );

    const result = {
      boardExamFees: boardExamFees.map((fee) => ({
        admissionNumber: fee.admissionNumber,
        studentName: `${fee.firstName} ${fee.lastName}`,
        paidAmount: fee.finalAmount, // Fixed: use finalAmount from payment model
        paymentMode: fee.paymentMode,
        paymentDate: fee.paymentDate,
        receiptNumber: fee.receiptNumberBef,
        academicYear: fee.academicYear,
        type: 'Board Exam Fee',
        status: fee.status,
        cancelledDate: fee.cancelledDate,
      })),
      boardRegistrationFees: boardRegistrationFees.map((fee) => ({
        admissionNumber: fee.admissionNumber,
        studentName: `${fee.firstName} ${fee.lastName}`,
        paidAmount: fee.finalAmount, // Fixed: use finalAmount from payment model
        paymentMode: fee.paymentMode,
        paymentDate: fee.paymentDate,
        receiptNumber: fee.receiptNumberBrf,
        academicYear: fee.academicYear,
        type: 'Board Registration Fee',
        status: fee.status,
        cancelledDate: fee.cancelledDate,
      })),
      tcForms: tcPayments.map((payment) => {
        const tcForm = payment.tcFormId;
        return {
          admissionNumber: tcForm?.AdmissionNumber,
          studentName: `${tcForm?.firstName || ''} ${tcForm?.lastName || ''}`.trim(),
          paidAmount: payment.finalAmount, // From TCPayment model
          paymentMode: payment.paymentMode,
          paymentDate: payment.paymentDate,
          receiptNumber: payment.receiptNumber,
          academicYear: payment.academicYear,
          type: 'Transfer Certificate',
          status: payment.status,
          cancelledDate: payment.cancelledDate, 
        };
      }),
      refundFees: refundFeesWithOriginalAmount.map((refund) => ({
        admissionNumber: refund.admissionNumber,
        studentName: `${refund.firstName} ${refund.lastName}`,
        paidAmount: refund.originalPaidAmount, 
        refundAmount: refund.refundAmount, 
        paymentMode: refund.paymentMode,
        paymentDate: refund.paymentDate,
        receiptNumber: refund.receiptNumber,
        academicYear: refund.academicYear,
        feesType: refund.refundType,
        type: refund.refundType === 'School Fees' && refund.installmentName ? refund.installmentName : refund.refundType || 'Refund',
        status: refund.status,
        refundDate: refund.refundDate || refund.cancelledDate,
      })),
    };

    const allPayments = [
      ...result.boardExamFees,
      ...result.boardRegistrationFees,
      ...result.tcForms,
      ...result.refundFees,
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
          refundFees: result.refundFees,
          allPayments: allPayments,
        },
      },
    });
  } catch (err) {
    console.error('Error retrieving admission forms and payments:', err);
    return res.status(500).json({ hasError: true, message: `Internal server error: ${err.message}` });
  }
};

export default getAdmissionFormsBySchoolId;