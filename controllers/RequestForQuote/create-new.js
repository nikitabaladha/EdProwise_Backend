import Product from "../../models/Product.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import ProductValidator from "../../validators/Product.js";

function generateEnquiryNumber() {
  const prefix = "ENQ";
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}${randomSuffix}`;
}

async function create(req, res) {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request for a quote.",
      });
    }

    let { products } = req.body;

    if (typeof products === "string") products = JSON.parse(products);

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "At least one product must be provided.",
      });
    }

    const uploadedImages = req.files || [];
    const createdEntries = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // Validate the product data
      const { error } = ProductValidator.createProduct.validate({
        schoolId,
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
        "schoolId",
        "categoryId",
        "subCategoryId",
        "description",
        "unit",
        "quantity",
        "enquiryNumber",
      ];

      for (const field of requiredFields) {
        if (product[field] === undefined || product[field] === null) {
          return res.status(400).json({
            hasError: true,
            message: `Field '${field}' is required`,
          });
        }
      }

      // Prepare image path
      const productImageKey = `products[${i}][productImage]`;
      const productImage = req.files[productImageKey]
        ? `/Images/ProductImage/${req.files[productImageKey][0].filename}`
        : null;

      const enquiryNumber = generateEnquiryNumber();

      // Create new PrepareQuote entry
      const newProduct = new Product({
        schoolId,
        enquiryNumber,
        productImage,
        categoryId,
        subCategoryId,
        description,
        unit,
        quantity,
      });

      // Save the entry
      const savedEntry = await newProduct.save();
      createdEntries.push(savedEntry);
    }

    const {
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
    } = JSON.parse(req.body.data);

    const newQuoteRequest = new QuoteRequest({
      schoolId,
      enquiryNumber,
      deliveryAddress,
      deliveryLocation,
      deliveryLandMark,
      deliveryPincode,
      expectedDeliveryDate,
      buyerStatus: "Quote Requested",
      supplierStatus: "Quote Requested",
      edprowiseStatus: "Quote Requested",
    });

    await newQuoteRequest.save({ session });

    return res.status(201).json({
      hasError: false,
      message: "Quotes and Quote Proposal created successfully.",
      data: {
        products: savedProducts,
        quoteRequest: newQuoteRequest,
      },
    });
  } catch (error) {
    console.error("Error creating Product:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default create;
