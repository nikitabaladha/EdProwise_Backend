import RegistrationFeePayment from "../../../../models/FeesModule/BoardRegistrationFeePayment.js";
import { BoardRegistrationFeePaymentValidator } from "../../../../validators/FeesModule/BoardRegistrationFeesPayment.js";

export const submitRegistrationFees = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to submit registration fees.",
      });
    }

    const { error } = BoardRegistrationFeePaymentValidator.validate(req.body);
    if (error) {
      return res.status(400).json({
        hasError: true,
        message: error.details[0].message,
      });
    }

    const { payments } = req.body;

 
    const existingPayments = await RegistrationFeePayment.find({
      schoolId,
      academicYear: payments[0].academicYear,
      admissionId: { $in: payments.map((p) => p.studentId) },
    });

    if (existingPayments.length > 0) {
      return res.status(409).json({
        hasError: true,
        message: "Some payments already exist for the given students in this academic year.",
      });
    }

    const createdPayments = [];

    for (const payment of payments) {
      const paymentDoc = new RegistrationFeePayment({
        schoolId: schoolId,
        academicYear: payment.academicYear,
        admissionId: payment.studentId,
        admissionNumber: payment.admissionNumber,
        studentName: payment.studentName,
        classId: payment.classId,
        sectionId: payment.sectionId,
        className: payment.className,
        sectionName: payment.sectionName,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        chequeNumber: payment.chequeNumber || '',
        bankName: payment.bankName || '',
        status: payment.status,
      });

      const saved = await paymentDoc.save(); 
      createdPayments.push(saved);
    }

    return res.status(201).json({
      hasError: false,
      message: "Registration fee payments submitted successfully.",
      data: createdPayments,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      hasError: true,
      message: "Server error while submitting registration fee payments.",
    });
  }
};

export default submitRegistrationFees;
