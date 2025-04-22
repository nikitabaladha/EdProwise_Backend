import EdprowiseBankDetail from "../../models/EdprowiseBankDetail.js";
import EdprowiseBankDetailValidator from "../../validators/EdprowiseBankDetails.js";

async function create(req, res) {
  try {
    const { error } =
      EdprowiseBankDetailValidator.EdprowiseBankDetailsCreate.validate(
        req.body
      );
    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({
        hasError: true,
        message: errorMessages,
      });
    }

    const { accountNumber, bankName, ifscCode, accountType } = req.body;

    const existingBankDetail = await EdprowiseBankDetail.findOne({ ifscCode });
    if (existingBankDetail) {
      return res.status(400).json({
        hasError: true,
        message: "A bank detail with this IFSC Code already exists.",
      });
    }

    const newBankDetail = new EdprowiseBankDetail({
      accountNumber,
      bankName,
      ifscCode,
      accountType,
    });

    await newBankDetail.save();

    return res.status(201).json({
      hasError: false,
      message: "Bank Details Created successfully!",
      data: newBankDetail,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)
        .map((key) => `${key}: ${error.keyValue[key]}`)
        .join(", ");
      return res.status(400).json({
        hasError: true,
        message: `Duplicate entry for ${field}. Bank details with the same account number and IFSC code for this bank already exists.`,
      });
    }

    console.error("Error Creating Bank Details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default create;
