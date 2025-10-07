
import { SchoolFees } from "../../../../models/FeesModule/SchoolFees.js";

export const getSchoolFees= async (req, res) => {
  try {
    const { schoolId, admissionNumber, academicYear, installmentName } = req.query;


    if (!schoolId || !admissionNumber || !academicYear || !installmentName) {
      return res.status(400).json({
        hasError: true,
        message: 'Missing required query parameters: schoolId, admissionNumber, academicYear, or installmentName',
      });
    }


    const receipts = await SchoolFees.find({
      schoolId,
      studentAdmissionNumber: admissionNumber,
      academicYear,
      'installments.installmentName': installmentName,
    })
      .select(
        'receiptNumber paymentDate collectorName paymentMode transactionNumber bankName chequeNumber reportStatus  refundReceiptNumbers installments'
      )
      .lean();

 
    const processedReceipts = receipts.map((receipt) => {
      const targetInstallment = receipt.installments.find(
        (inst) => inst.installmentName === installmentName
      );

      if (!targetInstallment) {
        return null;
      }

      return {
        _id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        paymentDate: receipt.paymentDate,
        collectorName: receipt.collectorName,
        paymentMode: receipt.paymentMode,
        transactionNumber: receipt.transactionNumber || '',
        bankName: receipt.bankName || '',
        chequeNumber: receipt.chequeNumber || '',
        status:receipt.reportStatus || '',
        refundReceiptNumber:receipt.refundReceiptNumbers || '',
        installmentName: targetInstallment.installmentName,
        fineAmount: targetInstallment.fineAmount || 0,
        excessAmount: targetInstallment.excessAmount || 0,
        feeItems: targetInstallment.feeItems.map((item) => ({
          feeTypeId: item.feeTypeId,
          amount: item.amount || 0,
          concession: item.concession || 0,
          payable: item.payable || item.amount - (item.concession || 0),
          paid: receipt.status === 'Cancelled' || receipt.status === 'Cheque Return' ? (item.cancelledPaidAmount || 0) : (item.paid || 0),
          balance: item.balance || 0,
        })),
      };
    }).filter(Boolean);

    if (processedReceipts.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No receipts found for installment ${installmentName} in academic year ${academicYear}`,
      });
    }

    res.status(200).json({
      hasError: false,
      data: processedReceipts,
    });
  } catch (error) {
    console.error('Error fetching school fees receipts:', error);
    res.status(500).json({
      hasError: true,
      message: 'Internal server error while fetching receipts',
    });
  }
};


export default getSchoolFees;