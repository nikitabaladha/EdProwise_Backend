import Fine from '../../../../models/FeesModule/Fine.js';

export const createFine = async (req, res) => {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: "Access denied: You do not have permission to create a fine.",
    });
  }

  const { feeType, frequency, value, maxCapFee, academicYear } = req.body;


  if (!feeType || !['fixed', 'percentage'].includes(feeType)) {
    return res.status(400).json({
      hasError: true,
      message: "Invalid or missing 'feeType'. Must be 'fixed' or 'percentage'.",
    });
  }

  if (!frequency || !['Fixed', 'Daily', 'Monthly', 'Annually'].includes(frequency)) {
    return res.status(400).json({
      hasError: true,
      message: "Invalid or missing 'frequency'.",
    });
  }

  if (value === undefined || value < 0) {
    return res.status(400).json({
      hasError: true,
      message: "Invalid 'value'. It must be a non-negative number.",
    });
  }

  if (feeType === 'percentage' && maxCapFee !== undefined && maxCapFee < 0) {
    return res.status(400).json({
      hasError: true,
      message: "Maximum cap fee cannot be negative.",
    });
  }

  try {
    const payload = {
      schoolId,
      academicYear,
      feeType,
      frequency,
      value,
      maxCapFee
    };

    const saved = await Fine.create(payload);

    res.status(201).json({
      hasError: false,
      message: "Fine saved successfully.",
      data: saved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      hasError: true,
      message: "Server error while saving fine.",
    });
  }
};

export default createFine;
