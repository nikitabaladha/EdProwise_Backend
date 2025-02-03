import PrepareQuote from "../../models/PrepareQuote.js";
import PrepareQuoteValidator from "../../validators/PrepareQuote.js";

async function create(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request for a quote.",
      });
    }

    let { enquiryNumber, products } = req.body;

    if (!enquiryNumber) {
      return res.status(400).json({
        hasError: true,
        message: "Enquiry number is required.",
      });
    }
    if (typeof products === "string") products = JSON.parse(products);

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "At least one product must be provided.",
      });
    }

    // Extract uploaded images
    const uploadedImages = req.files || [];

    // Ensure we match images to the correct entries (if any)
    const createdEntries = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // Validate each product
      const { error } = PrepareQuoteValidator.prepareQuoteCreate.validate({
        sellerId,
        enquiryNumber,
        ...product,
      });

      if (error?.details?.length) {
        const errorMessages = error.details
          .map((err) => err.message)
          .join(", ");
        return res.status(400).json({ hasError: true, message: errorMessages });
      }

      const prepareQuoteImageKey = `products[${i}][prepareQuoteImage]`;
      const prepareQuoteImage = req.files[prepareQuoteImageKey]
        ? `/Images/PrepareQuoteImage/${req.files[prepareQuoteImageKey][0].filename}`
        : null;

      console.log("Uploaded files:", req.files);

      // Create and save the new entry
      const newPrepareQuote = new PrepareQuote({
        sellerId,
        enquiryNumber,
        prepareQuoteImage,
        subcategoryName: product.subcategoryName,
        hsnSacc: product.hsnSacc,
        listingRate: product.listingRate,
        edprowiseMargin: product.edprowiseMargin,
        quantity: product.quantity,
        finalRateBeforeDiscount: product.finalRateBeforeDiscount,
        discount: product.discount,
        finalRate: product.finalRate,
        taxableValue: product.taxableValue,
        cgstRate: product.cgstRate,
        cgstAmount: product.cgstAmount,
        sgstRate: product.sgstRate,
        sgstAmount: product.sgstAmount,
        igstRate: product.igstRate,
        igstAmount: product.igstAmount,
        amountBeforeGstAndProducts: product.amountBeforeGstAndProducts,
        discountAmount: product.discountAmount,
        gstAmount: product.gstAmount,
        totalAmount: product.totalAmount,
      });

      const savedEntry = await newPrepareQuote.save();
      createdEntries.push(savedEntry);
    }

    return res.status(201).json({
      hasError: false,
      message: "Quotes created successfully.",
      data: createdEntries,
    });
  } catch (error) {
    console.error("Error creating quotes:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default create;
