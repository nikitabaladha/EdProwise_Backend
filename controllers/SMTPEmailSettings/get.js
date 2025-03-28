import SmtpEmailSetting from '../../models/SMTPEmailSetting.js';

 const get = async (req, res) => {
  try {
    const smtpSettings = await SmtpEmailSetting.findOne();
    
    if (!smtpSettings) {
      return res.status(404).json({
        hasError: true,
        message: 'No SMTP settings found'
      });
    }
    
    return res.status(200).json({
      hasError: false,
      data: smtpSettings
    });
    
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      message: 'Error retrieving SMTP settings',
      error: error.message
    });
  }
};

export default get;