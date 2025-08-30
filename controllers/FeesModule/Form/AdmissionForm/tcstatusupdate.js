import StudentAdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";

const TCStatus = async (req, res) => {
  const schoolId = req.user?.schoolId;
  if (!schoolId) {
    return res.status(401).json({
      hasError: true,
      message: 'Access denied: School ID missing.',
    });
  }

  try {
    const { id } = req.params;
    const { TCStatus, dropoutStatus, dropoutReason,dropoutStatusYear } = req.body;

   
    if (!TCStatus || !['Active', 'Inactive'].includes(TCStatus)) {
      return res.status(400).json({
        hasError: true,
        message: 'Invalid TCStatus value. Must be "Active" or "Inactive"',
      });
    }


    if (TCStatus === 'Inactive') {
      if (!dropoutStatus || dropoutStatus !== 'Dropout') {
        return res.status(400).json({
          hasError: true,
          message: 'dropoutStatus must be "Dropout" when setting TCStatus to Inactive',
        });
      }
      if (!dropoutReason || typeof dropoutReason !== 'string' || dropoutReason.trim() === '') {
        return res.status(400).json({
          hasError: true,
          message: 'dropoutReason is required and must be a non-empty string when setting TCStatus to Inactive',
        });
      }
    }

    const admission = await StudentAdmissionForm.findById(id);

    if (!admission) {
      return res.status(404).json({
        hasError: true,
        message: 'AdmissionForm not found',
      });
    }


    if (TCStatus === 'Inactive' && admission.TCStatus === 'Active') {
      admission.TCStatus = 'Inactive';
      admission.TCStatusDate = new Date();
      admission.dropoutStatus = dropoutStatus;
      admission.dropoutReason = dropoutReason;
      admission.dropoutStatusYear = dropoutStatusYear;
    } else if (TCStatus === 'Active' && admission.TCStatus === 'Inactive') {
      admission.TCStatus = 'Active';
      admission.TCStatusDate = null;
      admission.dropoutStatus = null;
      admission.dropoutReason = null;
      admission.dropoutStatusYear = null; 
    } else {
      return res.status(400).json({
        hasError: true,
        message: `TCStatus is already ${admission.TCStatus}. Update only allowed from Active to Inactive or Inactive to Active`,
      });
    }

    await admission.save();

    res.status(200).json({
      hasError: false,
      message: `TCStatus updated to ${TCStatus} successfully`,
      data: {
        id: admission._id,
        schoolId: admission.schoolId,
        admissionNumber: admission.AdmissionNumber,
        TCStatus: admission.TCStatus,
        TCStatusDate: admission.TCStatusDate,
        dropoutStatus: admission.dropoutStatus,
        dropoutReason: admission.dropoutReason,
        dropoutStatusYear: admission.dropoutStatusYear,
      },
    });
  } catch (error) {
    console.error('Error updating TCStatus:', error);
    res.status(500).json({
      hasError: true,
      message: 'Server error',
      error: error.message,
    });
  }
};

export default TCStatus;