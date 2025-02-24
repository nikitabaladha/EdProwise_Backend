import PrepareQuote from "../../models/PrepareQuote.js";
import PrepareQuoteValidator from "../../validators/PrepareQuote.js";
import QuoteProposal from "../../models/QuoteProposal.js";
import SubmitQuote from "../../models/SubmitQuote.js";

async function updateSingleProduct(req, res) {
  try {
    const { sellerId, enquiryNumber, id } = req.query;
    const productData = req.body;
    const uploadedImage = req.file;

    if (!sellerId || !enquiryNumber || !id) {
      return res.status(400).json({
        hasError: true,
        message: "Seller ID, enquiry number, and product ID are required.",
      });
    }

    // Validate the product data
    const { error } =
      PrepareQuoteValidator.prepareQuoteUpdate.validate(productData);
    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    // Find the existing quote
    const existingQuote = await PrepareQuote.findOne({
      sellerId,
      enquiryNumber,
      _id: id,
    });

    if (!existingQuote) {
      return res.status(404).json({
        hasError: true,
        message: `No PrepareQuote found with ID ${id} for enquiry number ${enquiryNumber} and seller ID ${sellerId}.`,
      });
    }

    // Update fields if new data is provided, otherwise retain existing values
    existingQuote.subcategoryName =
      productData.subcategoryName || existingQuote.subcategoryName;
    existingQuote.hsnSacc = productData.hsnSacc || existingQuote.hsnSacc;
    existingQuote.listingRate =
      productData.listingRate !== undefined
        ? parseFloat(productData.listingRate)
        : existingQuote.listingRate;
    existingQuote.edprowiseMargin =
      productData.edprowiseMargin !== undefined
        ? parseFloat(productData.edprowiseMargin)
        : existingQuote.edprowiseMargin;
    existingQuote.quantity =
      productData.quantity !== undefined
        ? parseFloat(productData.quantity)
        : existingQuote.quantity;
    existingQuote.discount =
      productData.discount !== undefined
        ? parseFloat(productData.discount)
        : existingQuote.discount;
    existingQuote.cgstRate =
      productData.cgstRate !== undefined
        ? parseFloat(productData.cgstRate)
        : existingQuote.cgstRate;
    existingQuote.sgstRate =
      productData.sgstRate !== undefined
        ? parseFloat(productData.sgstRate)
        : existingQuote.sgstRate;
    existingQuote.igstRate =
      productData.igstRate !== undefined
        ? parseFloat(productData.igstRate)
        : existingQuote.igstRate;

    // Update image if uploaded
    if (uploadedImage) {
      existingQuote.prepareQuoteImage = `/Images/PrepareQuoteImage/${uploadedImage.filename}`;
    }

    // Perform calculations with updated or existing values
    const listingRate = existingQuote.listingRate;
    const edprowiseMargin = existingQuote.edprowiseMargin;
    const quantity = existingQuote.quantity;
    const discount = existingQuote.discount;
    const cgstRate = existingQuote.cgstRate;
    const sgstRate = existingQuote.sgstRate;
    const igstRate = existingQuote.igstRate;

    // Recalculate fields
    const finalRateBeforeDiscount =
      listingRate + (listingRate * edprowiseMargin) / 100;
    const finalRate =
      finalRateBeforeDiscount - (finalRateBeforeDiscount * discount) / 100;
    const taxableValue = finalRate * quantity;
    const cgstAmount = (taxableValue * cgstRate) / 100;
    const sgstAmount = (taxableValue * sgstRate) / 100;
    const igstAmount = (taxableValue * igstRate) / 100;
    const amountBeforeGstAndDiscount = finalRateBeforeDiscount * quantity;
    const discountAmount = (amountBeforeGstAndDiscount * discount) / 100;
    const gstAmount = cgstAmount + sgstAmount + igstAmount;
    const totalAmountForProduct =
      amountBeforeGstAndDiscount - discountAmount + gstAmount;

    // Update the existing PrepareQuote
    existingQuote.finalRateBeforeDiscount = finalRateBeforeDiscount;
    existingQuote.finalRate = finalRate;
    existingQuote.taxableValue = taxableValue;
    existingQuote.cgstAmount = cgstAmount;
    existingQuote.sgstAmount = sgstAmount;
    existingQuote.igstAmount = igstAmount;
    existingQuote.amountBeforeGstAndDiscount = amountBeforeGstAndDiscount;
    existingQuote.discountAmount = discountAmount;
    existingQuote.gstAmount = gstAmount;
    existingQuote.totalAmount = totalAmountForProduct;
    existingQuote.updateCountBySeller += 1;

    await existingQuote.save();

    const allPrepareQuotes = await PrepareQuote.find({
      sellerId,
      enquiryNumber,
    });

    let totalQuantity = 0;
    let totalFinalRateBeforeDiscount = 0;
    let totalAmountBeforeGstAndDiscount = 0;
    let totalDiscountAmount = 0;
    let totalGstAmount = 0;
    let totalAmount = 0;
    let totalTaxableValue = 0;
    let totalCgstAmount = 0;
    let totalSgstAmount = 0;
    let totalIgstAmount = 0;
    let totalTaxAmount = 0;

    allPrepareQuotes.forEach((quote) => {
      totalQuantity += quote.quantity;
      totalFinalRateBeforeDiscount += quote.finalRateBeforeDiscount;
      totalAmountBeforeGstAndDiscount += quote.amountBeforeGstAndDiscount;
      totalDiscountAmount += quote.discountAmount;
      totalGstAmount += quote.gstAmount;
      totalAmount += quote.totalAmount;
      totalTaxableValue += quote.taxableValue;
      totalCgstAmount += quote.cgstAmount;
      totalSgstAmount += quote.sgstAmount;
      totalIgstAmount += quote.igstAmount;
      totalTaxAmount += quote.gstAmount;
    });

    // at time of update i want to increase the count  updateCountBySeller in prepareQuote when data is updated

    const existingQuoteProposal = await QuoteProposal.findOne({
      sellerId,
      enquiryNumber,
    });

    if (!existingQuoteProposal) {
      return res.status(404).json({
        hasError: true,
        message: `No QuoteProposal found for enquiry number ${enquiryNumber} and seller ID ${sellerId}.`,
      });
    }

    existingQuoteProposal.totalQuantity = totalQuantity;
    existingQuoteProposal.totalFinalRateBeforeDiscount =
      totalFinalRateBeforeDiscount;
    existingQuoteProposal.totalAmountBeforeGstAndDiscount =
      totalAmountBeforeGstAndDiscount;
    existingQuoteProposal.totalDiscountAmount = totalDiscountAmount;
    existingQuoteProposal.totalGstAmount = totalGstAmount;
    existingQuoteProposal.totalAmount = totalAmount;
    existingQuoteProposal.totalTaxableValue = totalTaxableValue;
    existingQuoteProposal.totalCgstAmount = totalCgstAmount;
    existingQuoteProposal.totalSgstAmount = totalSgstAmount;
    existingQuoteProposal.totalIgstAmount = totalIgstAmount;
    existingQuoteProposal.totalTaxAmount = totalTaxAmount;

    await existingQuoteProposal.save();

    const existingSubmitted = await SubmitQuote.findOne({
      sellerId,
      enquiryNumber,
    });

    if (!existingSubmitted) {
      return res.status(404).json({
        hasError: true,
        message: `No Submitted Quote found for enquiry number ${enquiryNumber} and seller ID ${sellerId}.`,
      });
    }

    existingSubmitted.quotedAmount = totalAmount;
    await existingSubmitted.save();

    return res.status(200).json({
      hasError: false,
      message: "PrepareQuote and QuoteProposal updated successfully.",
      data: {
        updatedPrepareQuote: existingQuote,
        updatedQuoteProposal: existingQuoteProposal,
        updatedSubmitted: existingSubmitted,
      },
    });
  } catch (error) {
    console.error("Error updating PrepareQuote or QuoteProposal:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateSingleProduct;
