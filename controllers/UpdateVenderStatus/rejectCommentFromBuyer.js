import SubmitQuote from "../../models/SubmitQuote.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import AdminUser from "../../models/AdminUser.js";
import School from "../../models/School.js";
import SellerProfile from "../../models/SellerProfile.js";
import { NotificationService } from "../../notificationService.js";

async function rejectCommentFromBuyer(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;
    const { rejectCommentFromBuyer } = req.body;

    if (!enquiryNumber || !sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber and sellerId are required.",
      });
    }

    if (!rejectCommentFromBuyer || rejectCommentFromBuyer.trim() === "") {
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
      { new: true }
    );

    if (!updatedQuote) {
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
      { new: true }
    );

    if (!updatedQuoteProposal) {
      return res.status(404).json({
        hasError: true,
        message:
          "Quote Proposal not found for the given enquiryNumber and sellerId.",
      });
    }

    const senderId = req.user.schoolId;

    // i want to find company name on the basis of sellerId
    const sellerProfile = await SellerProfile.findOne({ sellerId });

    await NotificationService.sendNotification(
      "SCHOOL_REJECTED_QUOTE",
      senderId ? [{ id: senderId.toString(), type: "school" }] : [],
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

    const relevantEdprowise = await AdminUser.find({});

    const schoolProfile = await School.findOne({ schoolId: senderId });

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

    return res.status(200).json({
      hasError: false,
      message: "Quote rejected successfully.",
      data: updatedQuote,
    });
  } catch (error) {
    console.error("Error rejecting quote:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default rejectCommentFromBuyer;
