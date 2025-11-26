import AdmissionFormModel from '../../../../models/FeesModule/AdmissionForm.js';
import mongoose from 'mongoose';

const promoteStudentsBulk = async (req, res) => {
  const { schoolId, admissionNumbers, newAcademicYear, newClass, newSection, newShift } = req.body;

  if (!schoolId || !admissionNumbers || !Array.isArray(admissionNumbers) || !newAcademicYear || !newClass || !newSection || !newShift) {
    return res.status(400).json({ hasError: true, message: 'All fields are required and admissionNumbers must be an array.' });
  }

  if (!mongoose.Types.ObjectId.isValid(newClass) || !mongoose.Types.ObjectId.isValid(newSection) || !mongoose.Types.ObjectId.isValid(newShift)) {
    return res.status(400).json({ hasError: true, message: 'Invalid class, section, or shift ID.' });
  }

  const [startYear, endYear] = newAcademicYear.split('-').map(Number);
  const previousAcademicYear = `${startYear - 1}-${endYear - 1}`;

  try {
    const students = await AdmissionFormModel.find({
      schoolId: schoolId.toString(),
      AdmissionNumber: { $in: admissionNumbers },
      academicYear: previousAcademicYear,
    });

    if (!students.length) {
      return res.status(404).json({
        hasError: true,
        message: `No students found for the provided admission numbers in academic year: ${previousAcademicYear}`,
      });
    }

    const updatedStudents = [];
    const errors = [];

    for (const student of students) {
      const existingEntry = student.academicHistory.find(
        (entry) => entry.academicYear === newAcademicYear
      );
      if (existingEntry) {
        errors.push(`Student ${student.AdmissionNumber} already promoted for academic year: ${newAcademicYear}`);
        continue;
      }

      student.academicHistory.push({
        academicYear: newAcademicYear,
        masterDefineClass: new mongoose.Types.ObjectId(newClass),
        section: new mongoose.Types.ObjectId(newSection),
        masterDefineShift: new mongoose.Types.ObjectId(newShift),
      });

      await student.save();
      updatedStudents.push(student.AdmissionNumber);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        hasError: true,
        message: `Some students could not be promoted: ${errors.join(', ')}`,
        data: { updatedStudents },
      });
    }

    res.status(200).json({
      hasError: false,
      message: 'Students promoted successfully.',
      data: { updatedStudents },
    });
  } catch (err) {
    res.status(500).json({
      hasError: true,
      message: `Error promoting students: ${err.message}`,
    });
  }
};

export default promoteStudentsBulk;