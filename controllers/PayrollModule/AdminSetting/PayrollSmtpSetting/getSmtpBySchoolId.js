import PayrollSMTPSetting from '../../../../models/PayrollModule/AdminSettings/PayrollSmtpEmailSetting.js';

const getSmtpBySchoolId = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await PayrollSMTPSetting.findOne({ schoolId: id });
    if (!data) {
      return res.status(404).json({
        hasError: true,
        message: "SMTP settings not found",
      });
    }

    return res.status(200).json({
      hasError: false,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: "Error fetching SMTP settings",
      error: error.message,
    });
  }
};

export default getSmtpBySchoolId;