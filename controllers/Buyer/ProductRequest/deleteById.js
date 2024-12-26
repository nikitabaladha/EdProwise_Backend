import ProductRequest from "../../../models/Buyer/ProductRequest.js";
async function deleteById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Product Request is required.",
      });
    }

    const existingProductRequest = await ProductRequest.findById(id);

    if (!existingProductRequest) {
      return res.status(404).json({
        hasError: true,
        message: "Product Request not found with the provided ID.",
      });
    }

    await ProductRequest.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Product Request deleted successfully!",
      hasError: false,
    });
  } catch (error) {
    console.error("Error deleting Product Request:", error);
    return res.status(500).json({
      message: "Failed to delete Product Request.",
      error: error.message,
    });
  }
}

export default deleteById;