import PayrollSmtpEmailSetting from '../../../../models/PayrollModule/AdminSettings/PayrollSmtpEmailSetting.js';

const createOrUpdate = async (req, res) => {
  try {
    const {
      schoolId,
      mailType,
      mailHost,
      mailPort,
      mailUsername,
      mailPassword,
      mailEncryption,
      mailFromAddress,
      mailFromName,
    } = req.body;

    // Validation
    if (!schoolId || !mailType || !mailHost || !mailPort || !mailUsername ||
        !mailPassword || !mailEncryption || !mailFromAddress || !mailFromName) {
      return res.status(400).json({
        hasError: true,
        message: "All fields are required",
      });
    }

    const existing = await PayrollSmtpEmailSetting.findOne({ schoolId });

    let smtpSettings;
    if (existing) {
      smtpSettings = await PayrollSmtpEmailSetting.findOneAndUpdate(
        { schoolId },
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      smtpSettings = new PayrollSmtpEmailSetting(req.body);
      await smtpSettings.save();
    }

    return res.status(200).json({
      hasError: false,
      message: "SMTP settings saved successfully",
      data: smtpSettings,
    });
  } catch (error) {
    console.error("Error in createOrUpdate:", error); // Add logging
    return res.status(500).json({
      hasError: true,
      message: "Error saving SMTP settings",
      error: error.message,
    });
  }
};

export default createOrUpdate;