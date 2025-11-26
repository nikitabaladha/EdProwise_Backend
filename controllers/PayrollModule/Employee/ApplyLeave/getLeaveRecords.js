import EmployeeLeave from '../../../../models/PayrollModule/Employee/EmployeeLeave.js';

const getLeaveRecords = async (req, res) => {
  try {
    const { schoolId, employeeId } = req.params;
    const record = await EmployeeLeave.findOne({ schoolId, employeeId });

    if (!record) {
      return res.status(404).json({ hasError: true, message: 'No leave records found.' });
    }

    res.status(200).json({ hasError: false, data: record });
  } catch (err) {
    res.status(500).json({ hasError: true, message: 'Failed to retrieve leave records.' });
  }
};

export default getLeaveRecords;
