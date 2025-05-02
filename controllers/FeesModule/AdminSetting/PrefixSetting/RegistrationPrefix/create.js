import PrefixSetting from '../../../../../models/FeesModule/RegistrationPrefix.js';
import validatePrefixSetting from '../../../../../validators/FeesModule/PrefixSetting.js';

export const createprefix = async (req, res) => {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: "Access denied: You do not have permission to create prefix setting.",
    });
  }

  const { error } = validatePrefixSetting(req.body);
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message,
    });
  }

  try {
    const existing = await PrefixSetting.findOne({ schoolId });
    if (existing) {
      return res.status(400).json({
        hasError: true,
        message: "Prefix already exists for this school. Only one is allowed.",
      });
    }

    const { type, value, prefix, number } = req.body;

    const payload = { schoolId, type };

    if (type === 'numeric') {
      payload.value = value;
    }

    if (type === 'alphanumeric') {
      payload.prefix = prefix;
      payload.number = number;
    }

    const saved = await PrefixSetting.create(payload);

    res.status(201).json({
      hasError: false,
      message: 'Prefix  saved successfully.',
      data: saved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: 'Server error while saving prefix setting.',
    });
  }
};

export default createprefix;
