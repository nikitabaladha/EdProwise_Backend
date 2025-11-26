import StudentAdmissionfrom from "../../../../models/FeesModule/AdmissionForm.js"

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
    const { TCStatus } = req.body;

  
    if (!TCStatus || !['Active', 'Inactive'].includes(TCStatus)) {
      return res.status(400).json({ message: 'Invalid TCStatus value. Must be "Active" or "Inactive"' });
    }

    const admission = await StudentAdmissionfrom.findById(id);

    if (!admission) {
      return res.status(404).json({ message: 'AdmissionForm not found' });
    }

  
    if (TCStatus === 'Inactive' && admission.TCStatus === 'Active') {
      admission.TCStatus = 'Inactive';
      admission.TCStatusDate = new Date();
    } else if (TCStatus === 'Active' && admission.TCStatus === 'Inactive') {
      admission.TCStatus = 'Active';
    } else {
      return res.status(400).json({
        message: `TCStatus is already ${admission.TCStatus}. Update only allowed from Active to Inactive or Inactive to Active`,
      });
    }

    await admission.save();

    res.status(200).json({
      message: `TCStatus updated to ${TCStatus} successfully`,
      data: {
        id: admission._id,
        schoolId: admission.schoolId,
        admissionNumber: admission.AdmissionNumber,
        TCStatus: admission.TCStatus,
        TCStatusDate: admission.TCStatusDate,
      },
    });
  } catch (error) {
    console.error('Error updating TCStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default TCStatus;
