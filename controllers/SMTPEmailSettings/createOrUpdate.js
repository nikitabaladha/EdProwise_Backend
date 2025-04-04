import SmtpEmailSetting from '../../models/SMTPEmailSetting.js';

 const createOrUpdate = async (req, res) => {
  try {
    const { 
      mailType,
      mailHost,
      mailPort,
      mailUsername,
      mailPassword,
      mailEncryption,
      mailFromAddress,
      mailFromName
    } = req.body;

    // Basic required field validation
    if (!mailType || !mailHost || !mailPort || !mailUsername || 
        !mailPassword || !mailEncryption || !mailFromAddress || !mailFromName) {
      return res.status(400).json({
        hasError: true,
        message: 'All fields are required'
      });
    }

    // Check if settings already exist
    const existingSettings = await SmtpEmailSetting.findOne();
    
    let smtpSettings;
    
    if (existingSettings) {
      // Update existing settings
      smtpSettings = await SmtpEmailSetting.findOneAndUpdate(
        {},
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      // Create new settings
      smtpSettings = new SmtpEmailSetting(req.body);
      await smtpSettings.save();
    }
    
    return res.status(200).json({
      hasError: false,
      message: 'SMTP settings saved successfully',
      data: smtpSettings
    });
    
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: 'Error saving SMTP settings',
      error: error.message
    });
  }
};
export default createOrUpdate;