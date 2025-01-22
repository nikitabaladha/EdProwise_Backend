import Product from "../../models/AdminUser/Product.js";
import QuoteRequest from "../../models/AdminUser/QuoteRequest.js";
import ProductValidator from "../../validators/Product.js";

function generateEnquiryNumber() {
  const prefix = "ENQ";
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}${randomSuffix}`;
}

async function create(req, res) {
  try {
    const schoolId = req.user?.id;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to request for a quote.",
      });
    }

    const products = JSON.parse(req?.body?.data)?.products;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        hasError: true,
        message: "Products must be an array and cannot be empty.",
      });
    }

    const validationErrors = [];
    for (const product of products) {
      const { error } = ProductValidator.createProduct.validate(product);
      if (error) {
        validationErrors.push(
          error.details.map((err) => err.message).join(", ")
        );
      }
    }

    if (validationErrors.length) {
      return res.status(400).json({
        hasError: true,
        message: validationErrors.join(", "),
      });
    }

    const savedProducts = [];
    const productImagePath = "/Images/ProductImage";

    const enquiryNumber = generateEnquiryNumber();

    for (const product of products) {
      const { categoryId, subCategoryId, description, unit, quantity } =
        product;

      const productImage = req.files?.productImage
        ? `${productImagePath}/${req.files.productImage[0].filename}`
        : null;

      const newProduct = new Product({
        schoolId,
        categoryId,
        subCategoryId,
        description,
        productImage,
        unit,
        quantity,
        enquiryNumber,
      });

      await newProduct.save();
      savedProducts.push(newProduct);
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
      supplierStatus: "Quote Requested From EdProwise",
      edprowiseStatus: "Quote Requested From Buyer",
    });

    await newQuoteRequest.save();

    return res.status(201).json({
      hasError: false,
      message: "Products created successfully and Quote Request stored.",
      data: {
        products: savedProducts,
        quoteRequest: newQuoteRequest,
      },
    });
  } catch (error) {
    console.error("Error creating Product:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to create Product.",
      error: error.message,
    });
  }
}

export default create;
