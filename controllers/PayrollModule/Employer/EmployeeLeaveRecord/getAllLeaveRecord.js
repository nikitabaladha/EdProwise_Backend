import EmployeeLeave from '../../../../models/PayrollModule/Employee/EmployeeLeave.js';

const getAllLeaveRecords = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.query;

    if (!schoolId || !academicYear) {
      return res.status(400).json({ hasError: true, message: 'Missing schoolId or academicYear' });
    }

    const allLeaves = await EmployeeLeave.find({ schoolId });

    const allRecords = [];

    allLeaves.forEach((doc) => {
      const employeeId = doc.employeeId;
      const leaveArray = doc.leaveRecords?.get(academicYear) || [];

      leaveArray.forEach((leaveEntry) => {
        allRecords.push({
          employeeId,
          schoolId,
          academicYear,
          ...leaveEntry.toObject() // << key fix here
        });
      });
    });

    // Sort by most recent 'fromDate'
    allRecords.sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate));

    return res.status(200).json({
      hasError: false,
      message: 'All leave records fetched successfully',
      data: allRecords,
    });

  } catch (err) {
    console.error('Error in getAllLeaveRecords:', err);
    return res.status(500).json({
      hasError: true,
      message: 'Server error while fetching leave records',
    });
  }
};



export default getAllLeaveRecords;
