import Product from "../../models/Product.js";
import QuoteRequest from "../../models/QuoteRequest.js";
import ProductValidator from "../../validators/Product.js";
import mongoose from "mongoose";

function generateEnquiryNumber() {
  const prefix = "ENQ";
  const randomSuffix = Math.floor(Math.random() * 100000000);
  const formattedSuffix = String(randomSuffix).padStart(8, "0");
  return `${prefix}${formattedSuffix}`;
}

async function create(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
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

    if (typeof products === "string") {
      try {
        products = JSON.parse(products);

        console.log("Number of products:", products.length);
      } catch (error) {
        return res.status(400).json({
          hasError: true,
          message: "Invalid products data format.",
        });
      }
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "At least one product must be provided.",
      });
    }

    const uploadedImages = req.files || [];
    const createdEntries = [];
    const enquiryNumber = generateEnquiryNumber();

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

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

      const requiredFields = [
        "categoryId",
        "subCategoryId",
        "unit",
        "quantity",
      ];

      for (const field of requiredFields) {
        if (product[field] === undefined || product[field] === null) {
          return res.status(400).json({
            hasError: true,
            message: `Field '${field}' is required`,
          });
        }
      }

      const productImageKey = `products[${i}][productImage]`;
      const productImage = req.files[productImageKey]
        ? `/Images/ProductImage/${req.files[productImageKey][0].filename}`
        : null;

      const newProduct = new Product({
        schoolId,
        productImage,
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId,
        description: product.description || "No description provided",
        unit: product.unit,
        quantity: product.quantity,
        enquiryNumber,
      });

      const savedEntry = await newProduct.save({ session });
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

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      hasError: false,
      message: "Quotes and Quote Proposal created successfully.",
      data: {
        products: createdEntries,
        quoteRequest: newQuoteRequest,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating Product:", error.message);
    console.error(error.stack);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default create;
