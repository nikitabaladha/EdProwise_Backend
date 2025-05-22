import AdmissionForm from '../../../../models/FeesModule/AdmissionForm.js';
import BoardRegistrationFeePayment from '../../../../models/FeesModule/BoardRegistrationFeePayment.js'; 

const getAdmissionForms = async (req, res) => {
  try {
    const { schoolId, academicYear, masterDefineClass, section } = req.params;

    const query = { schoolId, academicYear };
    if (masterDefineClass) query.masterDefineClass = masterDefineClass;
    if (section) query.section = section;

    const students = await AdmissionForm.find(query)
      .populate('masterDefineClass', 'className sections');

    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const sectionObj = student.masterDefineClass?.sections.find(
          sec => sec._id.toString() === student.section.toString()
        );

        const boardFee = await BoardRegistrationFeePayment.findOne({
          admissionId: student._id,
          academicYear,
          schoolId,
        });

        return {
          ...student.toObject(),
          sectionName: sectionObj?.name || null,
          boardRegistrationStatus: boardFee?.status || 'Pending',
          paymentMode: boardFee?.paymentMode || 'N/A', 
          chequeNumber: boardFee?.chequeNumber || 'N/A', 
          bankName: boardFee?.bankName || 'N/A',
           receiptNumberBrf:boardFee?.receiptNumberBrf
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enrichedStudents
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default getAdmissionForms;
