import SchoolFees from '../../../../models/FeesModule/SchoolFees.js';

const schoolFees = async (req, res) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message: 'Access denied: School ID missing.'
      });
    }

    const {
      studentAdmissionNumber,
      studentName,
      className,
      section,
      receiptNumber,
      transactionNumber,
      paymentMode,
      collectorName,
      academicYear,
      installments
    } = req.body;

    if (!Array.isArray(installments) || installments.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: 'Installments data is required and must be a non-empty array.'
      });
    }

    const processedInstallments = installments.map((inst, index) => ({
      ...inst,
      number: inst.number ?? index + 1
    }));

    const existingRecord = await SchoolFees.findOne({ schoolId, studentAdmissionNumber });

    if (existingRecord) {

      processedInstallments.forEach((newInstallment) => {
        const existingInstallment = existingRecord.installments.find(
          (inst) => inst.number === newInstallment.number
        );

        if (existingInstallment) {
  
          newInstallment.feeItems.forEach((newFeeItem) => {
            const existingFeeItem = existingInstallment.feeItems.find(
              (item) => item.feeTypeId === newFeeItem.feeTypeId
            );

            if (existingFeeItem) {
            
              existingFeeItem.amount = newFeeItem.amount;
              existingFeeItem.concession = newFeeItem.concession;
              existingFeeItem.fineAmount = newFeeItem.fineAmount;
              existingFeeItem.payable = newFeeItem.payable;
              existingFeeItem.paid = newFeeItem.paid;
              existingFeeItem.balance = newFeeItem.balance;
            } else {
            
              existingInstallment.feeItems.push(newFeeItem);
            }
          });
        } else {
     
          existingRecord.installments.push(newInstallment);
        }
      });

   
      await existingRecord.save();

      return res.status(200).json({
        hasError: false,
        message: 'School fee receipt updated successfully.',
        receipt: existingRecord
      });
    } else {
      const newSchoolFees = new SchoolFees({
        schoolId,
        studentAdmissionNumber,
        studentName,
        className,
        section,
        receiptNumber,
        transactionNumber,
        paymentMode,
        collectorName,
        academicYear,
        installments: processedInstallments
      });

      await newSchoolFees.save();

      return res.status(201).json({
        hasError: false,
        message: 'School fee receipt saved successfully.',
        receipt: newSchoolFees
      });
    }

  } catch (error) {
    console.error('Error saving school fee receipt:', error);
    res.status(500).json({
      hasError: true,
      message: 'Error saving school fee receipt',
      error: error.message
    });
  }
};

export default schoolFees;
