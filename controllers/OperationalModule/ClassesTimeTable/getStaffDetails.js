
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
const getStaffDetails = async (req, res) => {
 try {
    const { schoolId } = req.params;

    const employees = await EmployeeRegistration.find(
      { schoolId },
      {
        employeeId: 1,
        employeeName: 1,
        joiningDate: 1,
        status: 1,
      }
    );

    if (!employees || employees.length === 0) {
      return res.status(404).json({ message: "No employees found for this schoolId" });
    }

    res.json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }

};

export default getStaffDetails;
