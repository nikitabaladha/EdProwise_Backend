import Cart from "../../models/Cart.js";

async function deleteByCartId(req, res) {
  try {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    if (!schoolId) {
      return res.status(401).json({
        hasError: true,
        message:
          "Access denied: You do not have permission to delete cart details.",
      });
    }

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Cart ID is required.",
      });
    }

    const deleteResult = await Cart.findByIdAndDelete(id);

    if (!deleteResult) {
      return res.status(404).json({
        hasError: true,
        message: "No matching cart data found to delete.",
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Removed from cart successfully.",
    });
  } catch (error) {
    console.error("Error deleting Cart Data:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error.",
    });
  }
}

export default deleteByCartId;
