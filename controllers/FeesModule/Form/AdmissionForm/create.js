import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js'; 
import StudentRegistration from '../../../../models/FeesModule/RegistrationForm.js';
import { AdmissionValidator } from '../../../../validators/FeesModule/AdmissionValidator/Admissionvalidator.js';

const getFilePath = (file) => {
  if (!file) return '';
  return file.mimetype.startsWith('image/')
    ? `/Images/AdmissionForm/${file.filename}`
    : `/Documents/AdmissionForm/${file.filename}`;
};

const admissionform = async (req, res) => {
  const schoolId = req.user?.schoolId;

  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.'
    });
  }

  const { error } = AdmissionValidator.validate(req.body);
  if (error) {
    return res.status(400).json({
      hasError: true,
      message: error.details[0].message
    });
  }

  try {
    const { registrationNumber } = req.body;

   
    const existingAdmission = await AdmissionFormModel.findOne({ schoolId, registrationNumber });

    if (existingAdmission) {
      return res.status(409).json({
        hasError: true,
        message: `An admission form with registration number ${registrationNumber} already exists.`,
        admission: existingAdmission
      });
    }

    const files = req.files || {};


    const registeredStudent = await StudentRegistration.findOne({ schoolId, registrationNumber });

    const newAdmission = new AdmissionFormModel({
      ...req.body,
      schoolId,
      studentPhoto: files?.studentPhoto?.[0]
      ? getFilePath(files.studentPhoto[0])
      : registeredStudent?.studentPhoto|| '',
      aadharPassportFile: files?.aadharPassportFile?.[0]
        ? getFilePath(files.aadharPassportFile[0])
        : registeredStudent?.aadharPassportFile || '',
      castCertificate: files?.castCertificate?.[0]
        ? getFilePath(files.castCertificate[0])
        : registeredStudent?.castCertificate || '',
      tcCertificate: files?.tcCertificate?.[0]
        ? getFilePath(files.tcCertificate[0])
        : registeredStudent?.tcCertificate || '',
      previousSchoolResult: files?.previousSchoolResult?.[0]
        ? getFilePath(files.previousSchoolResult[0])
        : registeredStudent?.previousSchoolResult || '',
      idCardFile: files?.idCardFile?.[0]
        ? getFilePath(files.idCardFile[0])
        : registeredStudent?.idCardFile || '',
      proofOfResidence: files?.proofOfResidence?.[0]
        ? getFilePath(files.proofOfResidence[0])
        : registeredStudent?.proofOfResidence || ''
    });

    await newAdmission.save();

    res.status(201).json({
      hasError: false,
      message: 'Admission form submitted successfully.',
      admission: newAdmission
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: err.message
    });
  }
};

export default admissionform;
