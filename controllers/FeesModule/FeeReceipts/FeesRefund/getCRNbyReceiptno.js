// import RefundFees from '../../../../models/FeesModule/RefundFees.js';

// const getCRNByReceiptNumber = async (req, res) => {
//   try {
//     let { schoolId, receiptNumber } = req.params;
//     const userSchoolId = req.user?.schoolId;

//     if (!userSchoolId) {
//       return res.status(401).json({
//         hasError: true,
//         message: 'Access denied: You do not have permission to access refund details.',
//       });
//     }

//     if (!schoolId || !receiptNumber) {
//       return res.status(400).json({
//         hasError: true,
//         message: 'Missing required fields: schoolId and receiptNumber are required in URL parameters.',
//       });
//     }

//     if (schoolId !== userSchoolId) {
//       return res.status(403).json({
//         hasError: true,
//         message: 'Access denied: You do not have permission to access refund details for this school.',
//       });
//     }


//     const refundDetails = await RefundFees.aggregate([
//   {
//     $match: {
//       schoolId,
//       receiptNumber,
//     },
//   },
//   {
//     $group: {
//       _id: { schoolId: "$schoolId", receiptNumber: "$receiptNumber" },
//       totalRefundAmount: { $sum: "$refundAmount" },
//       refunds: { $push: "$$ROOT" },
//     },
//   },
//   {
//     $lookup: {
//       from: "classandsections",
//       localField: "refunds.classId",
//       foreignField: "_id",
//       as: "classDetails",
//     },
//   },
//   {
//     $unwind: {
//       path: "$classDetails",
//       preserveNullAndEmptyArrays: true,
//     },
//   },
//   {
//     $addFields: {
//       "classDetails.sections": {
//         $filter: {
//           input: "$classDetails.sections",
//           as: "section",
//           cond: {
//             $in: [
//               "$$section._id",
//               {
//                 $map: {
//                   input: "$refunds",
//                   as: "r",
//                   in: "$$r.sectionId",
//                 },
//               },
//             ],
//           },
//         },
//       },
//     },
//   },
//   {
//     $project: {
//       totalRefundAmount: 1,
//       refunds: 1,
//       "classDetails.className": 1,
//       "classDetails.sections": 1,
//     },
//   },
// ]);



//     if (!refundDetails || refundDetails.length === 0) {
//       return res.status(404).json({
//         hasError: true,
//         message: `No refund found for receipt number ${receiptNumber} and schoolId ${schoolId}.`,
//       });
//     }


//     return res.status(200).json({
//       hasError: false,
//       message: 'Refund details retrieved successfully.',
//       data: {
//         totalRefundAmount: refundDetails[0].totalRefundAmount,
//         refunds: refundDetails[0].refunds,
//         classDetails: refundDetails[0].classDetails,
//       },
//     });
//   } catch (error) {
//     console.error('Error retrieving refund details:', error);
//     return res.status(500).json({
//       hasError: true,
//       message: `Server error while retrieving refund details: ${error.message}`,
//     });
//   }
// };

// export default getCRNByReceiptNumber;

import RefundFees from '../../../../models/FeesModule/RefundFees.js';


const getCRNByReceiptNumber = async (req, res) => {
  try {
    let { schoolId, receiptNumber } = req.params;
    const userSchoolId = req.user?.schoolId;

    if (!userSchoolId) {
      return res.status(401).json({
        hasError: true,
        message: 'Access denied: You do not have permission to access refund details.',
      });
    }

    if (!schoolId || !receiptNumber) {
      return res.status(400).json({
        hasError: true,
        message: 'Missing required fields: schoolId and receiptNumber are required in URL parameters.',
      });
    }

    if (schoolId !== userSchoolId) {
      return res.status(403).json({
        hasError: true,
        message: 'Access denied: You do not have permission to access refund details for this school.',
      });
    }

    const refundDetails = await RefundFees.aggregate([
      {
        $match: {
          schoolId,
          receiptNumber,
        },
      },
      {
        $group: {
          _id: { schoolId: "$schoolId", receiptNumber: "$receiptNumber" },
          totalRefundAmount: { $sum: "$refundAmount" },
          refunds: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "classandsections",
          localField: "refunds.classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      {
        $unwind: {
          path: "$classDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "classDetails.sections": {
            $filter: {
              input: "$classDetails.sections",
              as: "section",
              cond: {
                $in: [
                  "$$section._id",
                  {
                    $map: {
                      input: "$refunds",
                      as: "r",
                      in: "$$r.sectionId",
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unwind: {
          path: "$refunds",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "feestypes", 
          localField: "refunds.feeTypeRefunds.feeType",
          foreignField: "_id",
          as: "refunds.feeTypeDetails",
        },
      },
      {
        $addFields: {
          "refunds.feeTypeRefunds": {
            $map: {
              input: "$refunds.feeTypeRefunds",
              as: "fee",
              in: {
                $mergeObjects: [
                  "$$fee",
                  {
                    feesTypeName: {
                      $arrayElemAt: [
                        "$refunds.feeTypeDetails.feesTypeName",
                        {
                          $indexOfArray: [
                            "$refunds.feeTypeDetails._id",
                            "$$fee.feeType",
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          "refunds.feeTypeDetails": "$$REMOVE",
        },
      },
      {
        $group: {
          _id: "$_id",
          totalRefundAmount: { $first: "$totalRefundAmount" },
          refunds: { $push: "$refunds" },
          classDetails: { $first: "$classDetails" },
        },
      },
      {
        $project: {
          totalRefundAmount: 1,
          refunds: {
            $map: {
              input: "$refunds",
              as: "refund",
              in: {
                _id: "$$refund._id",
                schoolId: "$$refund.schoolId",
                existancereceiptNumber: "$$refund.existancereceiptNumber",
                academicYear: "$$refund.academicYear",
                additionalComment: "$$refund.additionalComment",
                admissionNumber: "$$refund.admissionNumber",
                balance: "$$refund.balance",
                bankName: "$$refund.bankName",
                cancelReason: "$$refund.cancelReason",
                cancelledAmount: "$$refund.cancelledAmount",
                cancelledDate: "$$refund.cancelledDate",
                chequeNumber: "$$refund.chequeNumber",
                classId: "$$refund.classId",
                createdAt: "$$refund.createdAt",
                feeTypeRefunds: {
                  $map: {
                    input: "$$refund.feeTypeRefunds",
                    as: "fee",
                    in: {
                      feesTypeName: "$$fee.feesTypeName", 
                      refundAmount: "$$fee.refundAmount",
                      cancelledAmount: "$$fee.cancelledAmount",
                      paidAmount: "$$fee.paidAmount",
                      balance: "$$fee.balance",
                      _id: "$$fee._id",
                    },
                  },
                },
                firstName: "$$refund.firstName",
                installmentName: "$$refund.installmentName",
                lastName: "$$refund.lastName",
                paidAmount: "$$refund.paidAmount",
                paymentDate: "$$refund.paymentDate",
                paymentMode: "$$refund.paymentMode",
                receiptNumber: "$$refund.receiptNumber",
                refundAmount: "$$refund.refundAmount",
                refundDate: "$$refund.refundDate",
                refundType: "$$refund.refundType",
                registrationNumber: "$$refund.registrationNumber",
                sectionId: "$$refund.sectionId",
                status: "$$refund.status",
                updatedAt: "$$refund.updatedAt",
              },
            },
          },
          "classDetails.className": 1,
          "classDetails.sections": 1,
        },
      },
    ]);

    if (!refundDetails || refundDetails.length === 0) {
      return res.status(404).json({
        hasError: true,
        message: `No refund found for receipt number ${receiptNumber} and schoolId ${schoolId}.`,
      });
    }

    return res.status(200).json({
      hasError: false,
      message: 'Refund details retrieved successfully.',
      data: {
        totalRefundAmount: refundDetails[0].totalRefundAmount,
        refunds: refundDetails[0].refunds,
        classDetails: refundDetails[0].classDetails,
      },
    });
  } catch (error) {
    console.error('Error retrieving refund details:', error);
    return res.status(500).json({
      hasError: true,
      message: `Server error while retrieving refund details: ${error.message}`,
    });
  }
};

export default getCRNByReceiptNumber;