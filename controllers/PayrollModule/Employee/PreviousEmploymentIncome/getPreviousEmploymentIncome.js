import PreviousEmploymentIncome from "../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js";
const getPreviousEmploymentIncome = async (req, res) => {
  try {
    const { schoolId, employeeId } = req.params;
    const { academicYear } = req.query;

    // Validate required parameters
    if (!schoolId || !employeeId || !academicYear) {
      return res.status(400).json({
        hasError: true,
        message: 'Missing required parameters: schoolId, employeeId, or academicYear',
      });
    }

    const incomeDetails = await PreviousEmploymentIncome.findOne({
      schoolId,
      employeeId,
      academicYear,
    });

    if (!incomeDetails) {
      return res.status(404).json({
        hasError: true,
        message: 'Previous employment income details not found',
      });
    }

    return res.status(200).json({
      hasError: false,
      data: {
        data: {
          schoolId: incomeDetails.schoolId,
          employeeId: incomeDetails.employeeId,
          academicYear: incomeDetails.academicYear,
          incomeDetails: Object.fromEntries(incomeDetails.incomeDetails), // Convert Map to object
          createdAt: incomeDetails.createdAt,
          updatedAt: incomeDetails.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching previous employment income:', error);
    return res.status(500).json({
      hasError: true,
      message: 'Error fetching previous employment income',
    });
  }
};

export default getPreviousEmploymentIncome;