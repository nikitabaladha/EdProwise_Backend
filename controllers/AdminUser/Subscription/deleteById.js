import Subscription from "../../../models/Subscription.js";

async function deleteById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        hasError: true,
        message: "Subscription ID is required.",
      });
    }

    const existingSubscription = await Subscription.findById(id);

    if (!existingSubscription) {
      return res.status(404).json({
        hasError: true,
        message: "Subscription not found with the provided ID.",
      });
    }

    await Subscription.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Subscription deleted successfully!",
      hasError: false,
    });
  } catch (error) {
    console.error("Error deleting Subscription:", error);
    return res.status(500).json({
      message: "Failed to delete Subscription.",
      error: error.message,
    });
  }
}

export default deleteById;
