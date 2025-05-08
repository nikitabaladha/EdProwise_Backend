import TCFormModel from '../../../../models/FeesModule/TCForm.js';
import { TCFormValidator } from '../../../../validators/FeesModule/TcValidator/TCForm.js';

const getFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/TCForm/${file.filename}`
    : '';
};

const updateTCFormById = async (req, res) => {
  const { id } = req.params;
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  const { error } = TCFormValidator.validate({ ...req.body, schoolId });
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message,
    });
  }

  try {
    const existingForm = await TCFormModel.findOne({ _id: id, schoolId });

    if (!existingForm) {
      return res.status(404).json({
        hasError: true,
        message: 'TC Form not found.',
      });
    }

    const updatedFields = {
      ...req.body,
      schoolId,
      studentPhoto: req.files?.studentPhoto?.[0]
        ? getFilePath(req.files.studentPhoto[0])
        : existingForm.studentPhoto,
    };

    const updatedForm = await TCFormModel.findOneAndUpdate(
      { _id: id, schoolId },
      updatedFields,
      { new: true }
    );

    res.status(200).json({
      hasError: false,
      message: 'TC Form updated successfully.',
      form: updatedForm,
    });

  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message,
    });
  }
};

export default updateTCFormById;
