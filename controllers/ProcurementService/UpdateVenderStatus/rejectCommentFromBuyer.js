import SubmitQuote from "../../../models/ProcurementService/SubmitQuote.js";
import QuoteProposal from "../../../models/ProcurementService/QuoteProposal.js";
import AdminUser from "../../../models/AdminUser.js";
import School from "../../../models/School.js";
import SellerProfile from "../../../models/SellerProfile.js";
import { NotificationService } from "../../../notificationService.js";

import mongoose from "mongoose";

async function rejectCommentFromBuyer(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { enquiryNumber, sellerId } = req.query;
    const { rejectCommentFromBuyer } = req.body;

    if (!enquiryNumber || !sellerId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    if (!rejectCommentFromBuyer || rejectCommentFromBuyer.trim() === "") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        hasError: true,
        message: "Comment is required if you want to reject the quote.",
      });
    }

    const updatedQuote = await SubmitQuote.findOneAndUpdate(
      { enquiryNumber, sellerId },
      {
        rejectCommentFromBuyer,
        venderStatusFromBuyer: "Quote Not Accepted",
      },
      { new: true, session }
    );

    if (!updatedQuote) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Quote not found for the given enquiryNumber and sellerId.",
      });
    }

    const updatedQuoteProposal = await QuoteProposal.findOneAndUpdate(
      { enquiryNumber, sellerId },
      {
        supplierStatus: "Quote Rejected",
      },
      { new: true, session }
    );

    if (!updatedQuoteProposal) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message:
          "Quote Proposal not found for the given enquiryNumber and sellerId.",
      });
    }

    const senderId = req.user.schoolId;

    if (!senderId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({
        hasError: true,
        message: "Unauthorized: schoolId not found in request.",
      });
    }

    const [sellerProfile, relevantEdprowise, schoolProfile] = await Promise.all(
      [
        SellerProfile.findOne({ sellerId }).session(session),
        AdminUser.find({}).session(session),
        School.findOne({ schoolId: senderId }).session(session),
      ]
    );

    if (!sellerProfile || !schoolProfile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        hasError: true,
        message: "Required seller or school profile not found.",
      });
    }

    try {
      // Send notifications (if fails, throw to rollback)
      await NotificationService.sendNotification(
        "SCHOOL_REJECTED_QUOTE",
        [{ id: senderId.toString(), type: "school" }],
        {
          companyName: sellerProfile.companyName,
          quoteNumber: updatedQuoteProposal.quoteNumber,
          enquiryNumber: updatedQuoteProposal.enquiryNumber,
          entityId: updatedQuoteProposal._id,
          entityType: "QuoteProposal Reject",
          senderType: "school",
          senderId: senderId,
          metadata: {
            enquiryNumber,
            type: "quote_rejected_by_school",
          },
        }
      );

      await NotificationService.sendNotification(
        "SELLER_RECEIVE_REJECTED_QUOTE_FROM_SCHOOL",
        [{ id: sellerId.toString(), type: "seller" }],
        {
          companyName: sellerProfile.companyName,
          schoolName: schoolProfile.schoolName,
          quoteNumber: updatedQuoteProposal.quoteNumber,
          enquiryNumber: updatedQuoteProposal.enquiryNumber,
          entityId: updatedQuoteProposal._id,
          entityType: "QuoteProposal Reject",
          senderType: "school",
          senderId: senderId,
          metadata: {
            enquiryNumber,
            type: "quote_rejected_by_school",
          },
        }
      );

      await NotificationService.sendNotification(
        "EDPROWISE_RECEIVE_REJECTED_QUOTE_FROM_SCHOOL",
        relevantEdprowise.map((admin) => ({
          id: admin._id.toString(),
          type: "edprowise",
        })),
        {
          companyName: sellerProfile.companyName,
          schoolName: schoolProfile.schoolName,
          quoteNumber: updatedQuoteProposal.quoteNumber,
          enquiryNumber: updatedQuoteProposal.enquiryNumber,
          entityId: updatedQuoteProposal._id,
          entityType: "QuoteProposal Reject",
          senderType: "school",
          senderId: senderId,
          metadata: {
            enquiryNumber,
            type: "quote_rejected_by_school",
          },
        }
      );
    } catch (notificationError) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        hasError: true,
        message: "Notification sending failed: " + notificationError.message,
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      hasError: false,
      message: "Quote rejected successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Error rejecting quote:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default rejectCommentFromBuyer;
