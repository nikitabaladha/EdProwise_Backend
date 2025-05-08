import TCFormModel from '../../../../models/FeesModule/TCForm.js';
import { TCFormValidator } from '../../../../validators/FeesModule/TcValidator/TCForm.js';
import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';

const getFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/TCForm/${file.filename}`
    : '';
};

const createTCForm = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.'
    });
  }

  const { AdmissionNumber } = req.body;

  const { error } = TCFormValidator.validate({ ...req.body, schoolId });
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message
    });
  }

  try {
    const studentExists = await AdmissionFormModel.findOne({ schoolId, AdmissionNumber });
    if (!studentExists) {
      return res.status(404).json({
        hasError: true,
        message: `No student found with Admission Number ${AdmissionNumber} in this school.`,
      });
    }

    const existingForm = await TCFormModel.findOne({ schoolId, AdmissionNumber });
    if (existingForm) {
      return res.status(400).json({
        hasError: true,
        message: `TC Form for admission number ${AdmissionNumber} already exists.`,
      });
    }

    const admissionPhoto = studentExists?.studentPhoto || null;


    const form = new TCFormModel({
      ...req.body,
      schoolId,
      studentPhoto: req.files?.studentPhoto?.[0]
        ? getFilePath(req.files.studentPhoto[0])
        : admissionPhoto,
    });
    
    

    await form.save();

    res.status(201).json({
      hasError: false,
      message: 'TC Form submitted successfully.',
      form
    });

  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message
    });
  }
};

export default createTCForm;
