// import ProvidentFund from "../../../../models/PayrollModule/Employee/EmployeeProvidentFund.js";

// const getEmployeePFDetails = async (req, res) => {
//   try {
//     const { schoolId, employeeId, monthKey } = req.params;

//     if (!schoolId || !employeeId || !monthKey) {
//       return res.status(400).json({ hasError: true, message: "Missing parameters" });
//     }

//     const pfRecord = await ProvidentFund.findOne({ schoolId, employeeId });

//     if (!pfRecord) {
//       return res.status(404).json({ hasError: true, message: "No PF record found" });
//     }

//     const pfDetail = pfRecord.pfDetails.get(monthKey);

//     if (!pfDetail) {
//       return res.status(404).json({ hasError: true, message: "No PF data for selected month" });
//     }

//     return res.status(200).json({ hasError: false, data: pfDetail });
//   } catch (error) {
//     console.error("GET PF Error:", error);
//     return res.status(500).json({ hasError: true, message: "Server error while fetching PF details" });
//   }
// };

// export default getEmployeePFDetails;

import EmployeeProvidentFund from "../../../../models/PayrollModule/Employee/EmployeeProvidentFund.js";

const getEmployeePFDetails = async (req, res) => {
  const { schoolId, employeeId, academicYear } = req.params;

  if (!schoolId || !employeeId || !academicYear) {
    return res.status(400).json({ hasError: true, message: "Missing parameters" });
  }

  try {
    const data = await EmployeeProvidentFund.findOne({ schoolId, employeeId, academicYear });

    return res.status(200).json({
      hasError: false,
      data: data || {},
    });
  } catch (error) {
    return res.status(500).json({ hasError: true, message: error.message });
  }
};

export default getEmployeePFDetails;
