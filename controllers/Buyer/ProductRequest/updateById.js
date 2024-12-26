import ProductRequest from "../../../models/Buyer/ProductRequest.js";
import ProductRequestValidator from "../../../validators/Buyer/ProductRequestValidator.js";
async function updateById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Product Request ID is required to update.",
      });
    }

    const { error } =
      ProductRequestValidator.ProductRequestUpdateValidator.validate(
        req.body
      );

    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const existingProductRequest = await ProductRequest.findById(id);

    if (!existingProductRequest) {
      return res.status(404).json({
        hasError: true,
        message: "Product Request not found with the provided ID.",
      });
    }

    const {
        productName,
        productDescription,
        unitsQuantity,
        productQuantity,
        deliveryExpectedDate,
        deliveryAddress,
        deliveryLocation,
        pinCode,
        quoteStatus
    } = req.body;

    const productImagePath = "/Images/BuyerProductRequest";
    const productImage = req.files?.productImage
      ? `${productImagePath}/${req.files.productImage[0].filename}`
      : existingProductRequest.productImage;

    
    const updatedData = {
      productName: productName || existingProductRequest.productName,
      productDescription: productDescription || existingProductRequest.productDescription,
      unitsQuantity: unitsQuantity || existingProductRequest.unitsQuantity,
      productQuantity: productQuantity || existingProductRequest.productQuantity,
      deliveryExpectedDate: deliveryExpectedDate|| existingProductRequest.deliveryExpectedDate,
      deliveryAddress: deliveryAddress || existingProductRequest.deliveryAddress,
      deliveryLocation: deliveryLocation || existingProductRequest.deliveryLocation,
      pinCode: pinCode || existingProductRequest.pinCode,
      quoteStatus:quoteStatus||existingProductRequest.quoteStatus,
      productImage,
    };

    console.log("Updated Data:", updatedData);

    const updatedProductRequest = await ProductRequest.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    );

    return res.status(200).json({
      message: "Product Request updated successfully!",
      data: updatedProductRequest,
      hasError: false,
    });
  } catch (error) {
    console.error("Error updating Product Request:", error);
    return res.status(500).json({
      message: "Failed to update Product Request.",
      error: error.message,
    });
  }
}

export default updateById;