import PreviousEmploymentIncome from "../../../../models/PayrollModule/Employee/PreviousEmploymentIncome.js";

const savePreviousEmploymentIncome = async (req, res) => {
  try {
    
    const { schoolId, employeeId, academicYear, incomeDetails } = req.body;

    const validIncomeDetails = {};
    for (const [key, value] of Object.entries(incomeDetails)) {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        validIncomeDetails[key] = parsedValue;
      }
    }

    // Find existing record or create a new one
    let incomeRecord = await PreviousEmploymentIncome.findOne({
      schoolId,
      employeeId,
      academicYear,
    });

    if (incomeRecord) {
      // Update existing record
      incomeRecord.incomeDetails = new Map(Object.entries(validIncomeDetails));
      incomeRecord.updatedAt = Date.now();
    } else {
      // Create new record
      incomeRecord = new PreviousEmploymentIncome({
        schoolId,
        employeeId,
        academicYear,
        incomeDetails: new Map(Object.entries(validIncomeDetails)),
      });
    }

    await incomeRecord.save();

    return res.status(200).json({
      hasError: false,
      message: 'Previous employment income saved successfully',
      data: {
        schoolId: incomeRecord.schoolId,
        employeeId: incomeRecord.employeeId,
        academicYear: incomeRecord.academicYear,
        incomeDetails: Object.fromEntries(incomeRecord.incomeDetails), // Convert Map to object for frontend
        createdAt: incomeRecord.createdAt,
        updatedAt: incomeRecord.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error saving previous employment income:', error);
    return res.status(500).json({
      hasError: true,
      message: 'Error saving previous employment income',
    });
  }
};

export default savePreviousEmploymentIncome;