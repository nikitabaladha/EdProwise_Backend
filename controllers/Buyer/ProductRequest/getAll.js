import ProductRequest from "../../../models/Buyer/ProductRequest.js";


async function getAllProductRequest(req, res) {
  try {
    const request = await ProductRequest.find().lean();

    return res.status(200).json({
      message: "Product Request fetched successfully!",
      data: request,
      hasError: false,
    });
  } catch (error) {
    console.error("Error fetching Product  Request:", error);
    return res.status(500).json({
      message: "Failed to fetch Product Request.",
      error: error.message,
    });
  }
}

export default getAllProductRequest;