import mongoose from "mongoose";
import OrderDetailsFromSeller from "../../models/OrderDetailsFromSeller.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import SubmitQuote from "../../models/SubmitQuote.js";

async function updateStatus(req, res) {
  try {
    const { enquiryNumber, sellerId } = req.query;
    const { supplierStatus } = req.body;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "enquiryNumber is required",
      });
    }

    if (!sellerId) {
      return res.status(400).json({
        hasError: true,
        message: "SellerId is required",
      });
    }

    const allowedStatuses = [
      "Work In Progress",
      "Ready For Transit",
      "In-Transit",
      "Delivered",
    ];

    if (!allowedStatuses.includes(supplierStatus)) {
      return res.status(400).json({
        hasError: true,
        message: `Invalid Supplier Status. Allowed values: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    // Find and update all related documents in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existingOrder = await QuoteProposal.findOneAndUpdate(
        { sellerId, enquiryNumber },
        {
          supplierStatus,
          edprowiseStatus: supplierStatus,
          buyerStatus: supplierStatus,
        },
        { new: true, session }
      );

      if (!existingOrder) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          hasError: true,
          message: "Order not found for the given enquiryNumber",
        });
      }

      const existingSubmitQuote = await SubmitQuote.findOneAndUpdate(
        { sellerId, enquiryNumber },
        { venderStatusFromBuyer: supplierStatus },
        { new: true, session }
      );

      if (!existingSubmitQuote) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          hasError: true,
          message: "Submit Quote not found for the given enquiryNumber",
        });
      }

      if (supplierStatus === "Ready For Transit") {
        await OrderDetailsFromSeller.findOneAndUpdate(
          { enquiryNumber, sellerId },
          { invoiceDate: new Date() },
          { new: true, session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        hasError: false,
        message: "Order status updated successfully.",
        data: existingOrder,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error updating Order Status:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateStatus;
