import TCFormModel from '../../../../models/FeesModule/TCForm.js';
import { TCFormValidator } from '../../../../validators/FeesModule/TcValidator/TCForm.js';

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
    
    const existingForm = await TCFormModel.findOne({ AdmissionNumber, schoolId });

    if (existingForm) {
      return res.status(400).json({
        hasError: true,
        message: `TC Form for admission number ${AdmissionNumber} already exists.`
      });
    }


    const form = new TCFormModel({
      ...req.body,
      schoolId
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
