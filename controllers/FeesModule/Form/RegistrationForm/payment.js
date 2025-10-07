import mongoose from 'mongoose';
import { RegistrationPayment } from '../../../../models/FeesModule/RegistrationForm.js';

const validatePaymentData = (body) => {
  const errors = [];

  if (!body.finalAmount || isNaN(body.finalAmount) || body.finalAmount < 0) {
    errors.push('Final amount is required and must be a non-negative number.');
  }

  if (!body.paymentMode || !['Cash', 'Cheque', 'Online', 'null'].includes(body.paymentMode)) {
    errors.push('Valid payment mode is required (Cash, Cheque, Online, or null).');
  }

  if (!body.name || body.name.trim() === '') {
    errors.push('Name is required for payment.');
  }

  if (body.paymentMode === 'Cheque') {
    if (!body.bankName || body.bankName.trim() === '') {
      errors.push('Bank name is required when payment mode is Cheque.');
    }

    if (!body.chequeNumber || body.chequeNumber.trim() === '') {
      errors.push('Cheque number is required when payment mode is Cheque.');
    } else {
      const chequeRegex = /^\d{6}$/;
      if (!chequeRegex.test(body.chequeNumber)) {
        errors.push('Cheque number must be exactly 6 digits.');
      }
    }
  }

  if (body.concessionType && body.concessionType !== 'null' && body.concessionType.trim() !== '') {
    if (!body.concessionAmount || isNaN(body.concessionAmount) || body.concessionAmount < 0) {
      errors.push('Concession amount is required and must be a non-negative number when concession type is selected.');
    }
  }

  return errors;
};

const createPayment = async (req, res) => {
  const schoolId = req.user?.schoolId;
  const { studentId } = req.params;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({
      hasError: true,
      message: 'Valid student ID is required in the URL path.',
    });
  }

  const paymentErrors = validatePaymentData(req.body);
  if (paymentErrors.length > 0) {
    return res.status(400).json({
      hasError: true,
      message: paymentErrors.join(' '),
    });
  }

  try {
    const {
      academicYear,
      registrationFee,
      concessionType,
      concessionAmount,
      finalAmount,
      paymentMode,
      chequeNumber,
      bankName,
      name,
    } = req.body;

    const student = await mongoose
      .model('StudentRegistration')
      .findOne({ _id: studentId, schoolId });
    if (!student) {
      throw new Error('Student not found or does not belong to your school.');
    }

    const paymentData = {
      studentId,
      schoolId,
      academicYear,
      // registrationNumber: student.registrationNumber || '', 
      registrationFee: parseFloat(registrationFee) || 0,
      concessionType: concessionType || null,
      concessionAmount: parseFloat(concessionAmount) || 0,
      finalAmount: parseFloat(finalAmount),
      paymentMode: paymentMode || 'null',
      chequeNumber: chequeNumber || '',
      bankName: bankName || '',
      name: name || '',
      paymentDate: paymentMode === 'Cash' || paymentMode === 'Cheque' ? new Date() : null,
      status: paymentMode === 'null' ? 'Pending' : 'Paid',
    };

    const newPayment = new RegistrationPayment(paymentData);
    await newPayment.save();

    res.status(201).json({
      hasError: false,
      message: 'Payment created successfully.',
      payment: newPayment,
    });
  } catch (err) {
    console.error('Payment creation error:', err);
    const message =
      err.code === 11000
        ? 'Receipt number or transaction number already exists.'
        : err.message || 'An error occurred during payment creation.';
    res.status(500).json({
      hasError: true,
      message,
      details: 'An error occurred. No changes were saved.',
    });
  }
};

export default createPayment;