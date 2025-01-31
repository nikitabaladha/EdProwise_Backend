import Product from "../../models/Product.js";
import QuoteRequest from "../../models/QuoteRequest.js";

async function getByEnquiryNumber(req, res) {
  try {
    const { enquiryNumber } = req.params;

    const quoteRequest = await QuoteRequest.findOne({ enquiryNumber });

    if (!quoteRequest) {
      return res.status(404).json({
        hasError: true,
        message: "Quote request not found.",
      });
    }

    const products = await Product.find({ enquiryNumber })
      .populate("categoryId", "categoryName")
      .populate("subCategoryId", "subCategoryName");

    const formattedProducts = products.map((product) => ({
      id: product._id,
      schoolId: product.schoolId,
      categoryId: product.categoryId?._id || null,
      categoryName: product.categoryId?.categoryName || null,
      subCategoryId: product.subCategoryId?._id || null,
      subCategoryName: product.subCategoryId?.subCategoryName || null,
      description: product.description,
      productImage: product.productImage,
      unit: product.unit,
      quantity: product.quantity,
      enquiryNumber: product.enquiryNumber,

      // quote request table data

      quoteRequestId: quoteRequest._id,
      deliveryAddress: quoteRequest.deliveryAddress,
      deliveryLocation: quoteRequest.deliveryLocation,
      deliveryLandMark: quoteRequest.deliveryLandMark,
      deliveryPincode: quoteRequest.deliveryPincode,
      expectedDeliveryDate: quoteRequest.expectedDeliveryDate,
      buyerStatus: quoteRequest.buyerStatus,
      supplierStatus: quoteRequest.supplierStatus,
      edprowiseStatus: quoteRequest.edprowiseStatus,
      createdAt: quoteRequest.createdAt,
      updatedAt: quoteRequest.updatedAt,
    }));

    return res.status(200).json({
      hasError: false,
      message: "Data fetched successfully.",
      data: {
        products: formattedProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching data by enquiry number:", error.message);
    return res.status(500).json({
      hasError: true,
      message: "Failed to fetch data.",
      error: error.message,
    });
  }
}

export default getByEnquiryNumber;
