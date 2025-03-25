import EdprowiseBankDetail from "../../models/EdprowiseBankDetail.js";

async function getAll(req, res) {
  try {
    const bankDetails = await EdprowiseBankDetail.find();

    if (!bankDetails.length) {
      return res.status(404).json({
        hasError: true,
        message: "No bank details found.",
        data: [],
      });
    }

    return res.status(200).json({
      hasError: false,
      message: "Bank details retrieved successfully!",
      data: bankDetails,
    });
  } catch (error) {
    console.error("Error retrieving bank details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default getAll;
