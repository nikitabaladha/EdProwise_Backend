import EdprowiseBankDetail from "../../models/EdprowiseBankDetail.js";

async function remove(req, res) {
  try {
    const { id } = req.params;

    const existingBankDetail = await EdprowiseBankDetail.findById(id);
    if (!existingBankDetail) {
      return res.status(404).json({
        hasError: true,
        message: "Bank Detail not found.",
      });
    }

    await EdprowiseBankDetail.findByIdAndDelete(id);

    return res.status(200).json({
      hasError: false,
      message: "Bank Detail deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting Bank Detail:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to delete Bank Detail. Please try again later.",
      error: error.message,
    });
  }
}

export default remove;
