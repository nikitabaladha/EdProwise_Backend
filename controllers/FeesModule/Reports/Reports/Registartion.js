
import ClassAndSection from "../../../../models/FeesModule/Class&Section.js";
import Refund from "../../../../models/FeesModule/RefundFees.js";
import { RegistrationPayment } from "../../../../models/FeesModule/RegistrationForm.js";
import FeesManagementYear from "../../../../models/FeesModule/FeesManagementYear.js";

export const getAllRegistrationFees = async (req, res) => {
  try {
    const { schoolId, academicYear,startdate,enddate } = req.query;
    if (!schoolId ) {
      return res.status(400).json({
        message: 'schoolId  are required',
      });
    }
    const schoolIdString = schoolId.trim();

 

let academicYearData;
    if (academicYear) {
      academicYearData = await FeesManagementYear.findOne({
        schoolId: schoolIdString,
        academicYear: academicYear.trim(),
      });
    } else {
      academicYearData = await FeesManagementYear.findOne({ schoolId: schoolIdString });
    }

    if (!academicYearData) {
      return res.status(400).json({
        message: `Academic year not found for schoolId ${schoolIdString}`,
      });
    }


    let filterStartDate, filterEndDate;
    if (startdate && enddate) {
      filterStartDate = new Date(startdate);
      filterEndDate = new Date(new Date(enddate).setHours(23, 59, 59, 999));
    } else {
      filterStartDate = new Date(academicYearData.startDate);
      filterEndDate = new Date(new Date(academicYearData.endDate).setHours(23, 59, 59, 999));
    }
    const paymentDataList = await RegistrationPayment.find({
      schoolId,
      // paymentDate: { $gte: startDate, $lte: endDate },
     paymentDate: { $gte: filterStartDate, $lte: filterEndDate },
      paymentMode: { $ne: 'null' },
      status: 'Paid'  
    })
      .populate('studentId')
      .lean();

    if (!paymentDataList.length) {
      return res.status(404).json({ message: `No payment data found for academic year` });
    }

    const combinedDetails = [];
    const receiptNumbers = [];


    for (const payment of paymentDataList) {
      const student = payment.studentId;
      if (!student) {
        console.warn(`Student not found for payment with ID ${payment._id}`);
        continue;
      }

      const classId = student.masterDefineClass || null;
      const sectionId = student.section || null;
      let className = "-";


      if (classId && sectionId) {
        const classData = await ClassAndSection.findOne({
          schoolId,
          "sections._id": sectionId,
        }).lean();
        if (classData) {
          className = classData.className || "-";
        }
      } else if (classId) {
        const classData = await ClassAndSection.findOne({
          schoolId,
          _id: classId,
        }).lean();
        className = classData?.className || "-";
      }

      const paymentDetail = {
        recordType: "Registration",
        paymentId: payment._id.toString(),
        studentId: payment.studentId._id.toString(),
        firstName: student.firstName || "-",
        lastName: student.lastName || "-",
        registrationNumber: payment.registrationNumber || student.registrationNumber || "-",
        academicYear:payment.academicYear,
        className,
        regFeesDate: payment.paymentDate
          ? new Date(payment.paymentDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).replace(/\//g, "-")
          : "-",
        regFeesCancelledDate: payment.cancelledDate
          ? new Date(payment.cancelledDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).replace(/\//g, "-")
          : "-",
        regFeesPaymentMode: payment.paymentMode || "-",
        regFeesDue: payment.registrationFee?.toString() || "0",
        regFeesConcession: payment.concessionAmount?.toString() || "0",
        regFeesPaid: payment.finalAmount?.toString() || "0",
        regFeesChequeNumber: payment.chequeNumber || "-",
        regFeesBankName: payment.bankName || "-",
        regFeesTransactionNo: payment.chequeNumber ? payment.chequeNumber : payment.transactionNumber || "-",
        regFeesReceiptNo: payment.receiptNumber || "-",
        regFeesStatus: payment.status || "-",
        regFeesrefundAmount: "0",
        regFeescancelledAmount: "0",
      };

      combinedDetails.push(paymentDetail);
      if (payment.receiptNumber) {
        receiptNumbers.push(payment.receiptNumber);
      }
    }


    if (receiptNumbers.length > 0) {
      const refunds = await Refund.find({
        schoolId,
        refundType: 'Registration Fee',
        $or: [
          { $and: [{ status: 'Refund' }, { refundDate: { $gte:filterStartDate, $lte: filterEndDate } }] },
          { $and: [{ status: { $in: ['Cancelled', 'Cheque Return'] } }, { cancelledDate: { $gte:filterStartDate, $lte: filterEndDate } }] }
        ]
      }).lean();

      const refundDetails = await Promise.all(
        refunds.map(async (refund) => {
          let className = "-";
          if (refund.classId) {
            const classData = await ClassAndSection.findOne({
              schoolId,
              _id: refund.classId,
            }).lean();
            className = classData?.className || "-";
          }

          return {
            recordType: "Refund",
            regFeesDate:
              refund.status === 'Refund' && refund.refundDate
                ? new Date(refund.refundDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).replace(/\//g, '-')
                : refund.cancelledDate
                  ? new Date(refund.cancelledDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }).replace(/\//g, '-')
                  : '-',
            academicYear: refund.academicYear || "-",
            registrationNumber: refund.registrationNumber || "-",
            firstName: refund.firstName || "-",
            lastName: refund.lastName || "-",
            className,
            regFeesStatus: refund.status || "-",
            regFeesPaymentMode: refund.paymentMode || "-",
            regFeesReceiptNo: refund.receiptNumber || "-",
            regFeesDue: -(refund.paidAmount+refund.concessionAmount)?.toString() || "0",
            // regFeesPaid: refund.paidAmount?.toString() || "0",
            regFeesConcession: -(refund.concessionAmount?.toString()) || '0',
            regFeesrefundAmount: refund.refundAmount > 0
              ? -(refund.refundAmount).toString()
              :-(refund.cancelledAmount)?.toString() || "",


            // regFeesrefundAmount: refund.refundAmount?.toString() || "0",
            // regFeescancelledAmount: refund.cancelledAmount?.toString() || "0",
            regFeesChequeNumber: refund.chequeNumber || "-",
            regFeesBankName: refund.bankName || "-",
            regFeesTransactionNo: refund.transactionNumber || "-",
            // regFeesConcession: "0",
          };
        })
      );

      combinedDetails.push(...refundDetails);
    }

 
    const paymentCounts = combinedDetails.reduce((acc, detail) => {
      const regNo = detail.registrationNumber;
      acc[regNo] = (acc[regNo] || 0) + 1;
      return acc;
    }, {});
    console.log("Payment entries per registration number:", paymentCounts);

    res.status(200).json({
      combinedDetails,
      paymentCount: paymentDataList.length, 
    });
  } catch (error) {
    console.error("Error fetching registration fees data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getAllRegistrationFees;