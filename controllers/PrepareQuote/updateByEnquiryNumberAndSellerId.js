import PrepareQuote from "../../models/PrepareQuote.js";
import PrepareQuoteValidator from "../../validators/PrepareQuote.js";

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

    // Validate product data
    const { error } =
      PrepareQuoteValidator.prepareQuoteUpdate.validate(productData);
    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    // Find the existing quote to update
    const existingQuote = await PrepareQuote.findOne({
      sellerId: sellerId,
      enquiryNumber: enquiryNumber,
      _id: id,
    });

    if (!existingQuote) {
      return res.status(404).json({
        hasError: true,
        message: `No Prepare quote found with ID ${id} for enquiry number ${enquiryNumber} and seller ID ${sellerId}.`,
      });
    }

    // Update the existing PrepareQuote with new data
    existingQuote.subcategoryName =
      productData.subcategoryName || existingQuote.subcategoryName;
    existingQuote.hsnSacc = productData.hsnSacc || existingQuote.hsnSacc;
    existingQuote.listingRate =
      productData.listingRate || existingQuote.listingRate;
    existingQuote.edprowiseMargin =
      productData.edprowiseMargin || existingQuote.edprowiseMargin;
    existingQuote.quantity = productData.quantity || existingQuote.quantity;
    existingQuote.finalRateBeforeDiscount =
      productData.finalRateBeforeDiscount ||
      existingQuote.finalRateBeforeDiscount;
    existingQuote.discount = productData.discount || existingQuote.discount;
    existingQuote.finalRate = productData.finalRate || existingQuote.finalRate;
    existingQuote.taxableValue =
      productData.taxableValue || existingQuote.taxableValue;
    existingQuote.cgstRate = productData.cgstRate || existingQuote.cgstRate;
    existingQuote.cgstAmount =
      productData.cgstAmount || existingQuote.cgstAmount;
    existingQuote.sgstRate = productData.sgstRate || existingQuote.sgstRate;
    existingQuote.sgstAmount =
      productData.sgstAmount || existingQuote.sgstAmount;
    existingQuote.igstRate = productData.igstRate || existingQuote.igstRate;
    existingQuote.igstAmount =
      productData.igstAmount || existingQuote.igstAmount;
    existingQuote.amountBeforeGstAndDiscount =
      productData.amountBeforeGstAndDiscount ||
      existingQuote.amountBeforeGstAndDiscount;
    existingQuote.discountAmount =
      productData.discountAmount || existingQuote.discountAmount;
    existingQuote.gstAmount = productData.gstAmount || existingQuote.gstAmount;
    existingQuote.totalAmount =
      productData.totalAmount || existingQuote.totalAmount;

    // Handle single image upload
    if (uploadedImage) {
      existingQuote.prepareQuoteImage = `/Images/PrepareQuoteImage/${uploadedImage.filename}`;
    }

    // Save the updated entry
    const updatedEntry = await existingQuote.save();

    return res.status(200).json({
      hasError: false,
      message: "Quote updated successfully.",
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Error updating Prepare quote:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default updateSingleProduct;
