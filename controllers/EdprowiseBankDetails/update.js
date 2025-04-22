import EdprowiseBankDetail from "../../models/EdprowiseBankDetail.js";
import EdprowiseBankDetailValidator from "../../validators/EdprowiseBankDetails.js";

async function update(req, res) {
  try {
    const { id } = req.params;

    const { error } =
      EdprowiseBankDetailValidator.EdprowiseBankDetailsUpdate.validate(
        req.body,
        { allowUnknown: true }
      );
    if (error?.details?.length) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({ hasError: true, message: errorMessages });
    }

    const { accountNumber, bankName, ifscCode, accountType } = req.body;

    const existingBankDetail = await EdprowiseBankDetail.findById(id);
    if (!existingBankDetail) {
      return res
        .status(404)
        .json({ hasError: true, message: "Bank Detail not found." });
    }

    existingBankDetail.accountNumber =
      accountNumber || existingBankDetail.accountNumber;
    existingBankDetail.bankName = bankName || existingBankDetail.bankName;
    existingBankDetail.ifscCode = ifscCode || existingBankDetail.ifscCode;
    existingBankDetail.accountType =
      accountType || existingBankDetail.accountType;

    await existingBankDetail.save();

    return res.status(200).json({
      hasError: false,
      message: "Bank Detail updated successfully!",
      data: existingBankDetail,
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

    console.error("Error updating Bank Details:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default update;
