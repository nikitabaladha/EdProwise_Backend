import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
import mongoose from 'mongoose';

const promoteStudent = async (req, res) => {
  const { schoolId, admissionNumber, newAcademicYear, newClass, newSection, newShift } = req.body;

 
  if (!schoolId || !admissionNumber || !newAcademicYear || !newClass || !newSection || !newShift) {
    return res.status(400).json({ hasError: true, message: 'All fields are required.' });
  }


  if (!mongoose.Types.ObjectId.isValid(newClass) || !mongoose.Types.ObjectId.isValid(newSection) || !mongoose.Types.ObjectId.isValid(newShift)) {
    return res.status(400).json({ hasError: true, message: 'Invalid class, section, or shift ID.' });
  }


  const [startYear, endYear] = newAcademicYear.split('-').map(Number);
  const previousAcademicYear = `${startYear - 1}-${endYear - 1}`;

  try {

    const student = await AdmissionFormModel.findOne({
      schoolId: schoolId.toString(),
      AdmissionNumber: admissionNumber,
      academicYear: previousAcademicYear,
    });

    if (!student) {
      return res.status(404).json({
        hasError: true,
        message: `No student found for Admission Number: ${admissionNumber} in academic year: ${previousAcademicYear}`,
      });
    }


    const existingEntry = student.academicHistory.find(
      (entry) => entry.academicYear === newAcademicYear
    );
    if (existingEntry) {
      return res.status(400).json({
        hasError: true,
        message: `Student already promoted for academic year: ${newAcademicYear}`,
      });
    }


    student.academicHistory.push({
      academicYear: newAcademicYear,
      masterDefineClass: new mongoose.Types.ObjectId(newClass),
      section: new mongoose.Types.ObjectId(newSection),
      masterDefineShift: new mongoose.Types.ObjectId(newShift),
    });


    await student.save();

    res.status(200).json({
      hasError: false,
      message: 'Student promoted successfully.',
      data: student,
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: `Error promoting student: ${err.message}`,
    });
  }
};

export default promoteStudent;