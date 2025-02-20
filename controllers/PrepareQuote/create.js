import PrepareQuote from "../../models/PrepareQuote.js";
import PrepareQuoteValidator from "../../validators/PrepareQuote.js";
import QuoteProposal from "../../models/QuoteProposal.js";

function generateQuoteNumber() {
  const prefix = "QUOTE";
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}${randomSuffix}`;
}

async function create(req, res) {
  try {
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({
        hasError: true,
        message: "Access denied: You do not have permission to Prepare quote.",
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

    const uploadedImages = req.files || [];
    const createdEntries = [];

    // Initialize totals for QuoteProposal
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

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // Validate the product data
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

      // Check for required fields
      const requiredFields = [
        "listingRate",
        "edprowiseMargin",
        "quantity",
        "discount",
        "cgstRate",
        "sgstRate",
        "igstRate",
      ];

      for (const field of requiredFields) {
        if (product[field] === undefined || product[field] === null) {
          return res.status(400).json({
            hasError: true,
            message: `Field '${field}' is required for calculations.`,
          });
        }
      }

      // Prepare image path
      const prepareQuoteImageKey = `products[${i}][prepareQuoteImage]`;
      const prepareQuoteImage = req.files[prepareQuoteImageKey]
        ? `/Images/PrepareQuoteImage/${req.files[prepareQuoteImageKey][0].filename}`
        : null;

      // Perform calculations
      const listingRate = parseFloat(product.listingRate);
      const edprowiseMargin = parseFloat(product.edprowiseMargin);
      const quantity = parseFloat(product.quantity);
      const discount = parseFloat(product.discount);
      const cgstRate = parseFloat(product.cgstRate);
      const sgstRate = parseFloat(product.sgstRate);
      const igstRate = parseFloat(product.igstRate);

      // Calculate finalRateBeforeDiscount
      const finalRateBeforeDiscount =
        listingRate + (listingRate * edprowiseMargin) / 100;

      // Calculate finalRate
      const finalRate =
        finalRateBeforeDiscount - (finalRateBeforeDiscount * discount) / 100;

      // Calculate taxableValue
      const taxableValue = finalRate * quantity;

      // Calculate GST amounts
      const cgstAmount = (taxableValue * cgstRate) / 100;
      const sgstAmount = (taxableValue * sgstRate) / 100;
      const igstAmount = (taxableValue * igstRate) / 100;

      // Calculate amountBeforeGstAndDiscount
      const amountBeforeGstAndDiscount = finalRateBeforeDiscount * quantity;

      // Calculate discountAmount
      const discountAmount = (amountBeforeGstAndDiscount * discount) / 100;

      // Calculate gstAmount
      const gstAmount = cgstAmount + sgstAmount + igstAmount;

      // Calculate totalAmount
      const totalAmountForProduct =
        amountBeforeGstAndDiscount - discountAmount + gstAmount;

      // Update totals for QuoteProposal
      totalQuantity += quantity;
      totalFinalRateBeforeDiscount += finalRateBeforeDiscount;
      totalAmountBeforeGstAndDiscount += amountBeforeGstAndDiscount;
      totalDiscountAmount += discountAmount;
      totalGstAmount += gstAmount;
      totalAmount += totalAmountForProduct;
      totalTaxableValue += taxableValue;
      totalCgstAmount += cgstAmount;
      totalSgstAmount += sgstAmount;
      totalIgstAmount += igstAmount;
      totalTaxAmount += gstAmount;

      // Create new PrepareQuote entry
      const newPrepareQuote = new PrepareQuote({
        sellerId,
        enquiryNumber,
        prepareQuoteImage,
        subcategoryName: product.subcategoryName,
        hsnSacc: product.hsnSacc,
        listingRate: listingRate,
        edprowiseMargin: edprowiseMargin,
        quantity: quantity,
        finalRateBeforeDiscount: finalRateBeforeDiscount,
        discount: discount,
        finalRate: finalRate,
        taxableValue: taxableValue,
        cgstRate: cgstRate,
        cgstAmount: cgstAmount,
        sgstRate: sgstRate,
        sgstAmount: sgstAmount,
        igstRate: igstRate,
        igstAmount: igstAmount,
        amountBeforeGstAndDiscount: amountBeforeGstAndDiscount,
        discountAmount: discountAmount,
        gstAmount: gstAmount,
        totalAmount: totalAmountForProduct,
      });

      // Save the entry
      const savedEntry = await newPrepareQuote.save();
      createdEntries.push(savedEntry);
    }

    const quoteNumber = generateQuoteNumber();

    // Create QuoteProposal entry
    const newQuoteProposal = new QuoteProposal({
      quoteNumber,
      sellerId,
      enquiryNumber,
      totalQuantity,
      totalFinalRateBeforeDiscount,
      totalAmountBeforeGstAndDiscount,
      totalDiscountAmount,
      totalGstAmount,
      totalAmount,
      totalTaxableValue,
      totalCgstAmount,
      totalSgstAmount,
      totalIgstAmount,
      totalTaxAmount,
    });

    // Save the QuoteProposal entry
    await newQuoteProposal.save();

    return res.status(201).json({
      hasError: false,
      message: "Quotes and Quote Proposal created successfully.",
      data: {
        prepareQuotes: createdEntries,
        quoteProposal: newQuoteProposal,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message:
          "Duplicate entry: A prepare quote or quote proposal from this seller for the same enquiry already exists.",
      });
    }
    console.error("Error creating Prepare quotes or Quote Proposal:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default create;
