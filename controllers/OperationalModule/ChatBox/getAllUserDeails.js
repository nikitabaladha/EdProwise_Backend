import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
const getAllUserDetails = async (req, res) => {
 try {
    const { schoolId } = req.params;

    const users = await AdmissionForm.find(
      { schoolId }
    );

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found for this schoolId" });
    }

    const formattedStudents = users.map((s) => ({
      _id: s._id,
      name: `${s.firstName} ${s.middleName} ${s.lastName}`,
      profileImage: s.studentPhoto,
      role: "Student",
      className: s.className,
      sectionName: s.sectionName,
    }));

    res.json({
      success: true,
      users: [...formattedStudents],
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }

};

export default getAllUserDetails;

// controllers/ChatModule/getAllUserDetails.jsfor ref of employee integration 
// import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
// import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";

// const getAllUserDetails = async (req, res) => {
//   try {
//     const { schoolId } = req.params;

//     // Fetch all students
//     const students = await AdmissionForm.find({ schoolId }).select(
//       "firstName lastName className sectionName studentPhoto"
//     );

//     // Fetch all employees
//     const employees = await EmployeeRegistration.find({ schoolId }).select(
//       "firstName lastName employeePhoto designation"
//     );

//     if ((!students || students.length === 0) && (!employees || employees.length === 0)) {
//       return res.status(404).json({ message: "No users found for this schoolId" });
//     }

//     // Map students & employees into a common format
//     const formattedStudents = students.map((s) => ({
//       _id: s._id,
//       name: `${s.firstName} ${s.lastName}`,
//       profileImage: s.studentPhoto,
//       role: "student",
//       className: s.className,
//       sectionName: s.sectionName,
//     }));

//     const formattedEmployees = employees.map((e) => ({
//       _id: e._id,
//       name: `${e.firstName} ${e.lastName}`,
//       profileImage: e.employeePhoto,
//       role: "employee",
//       designation: e.designation,
//     }));

//     res.json({
//       success: true,
//       users: [...formattedStudents, ...formattedEmployees],
//     });
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// export default getAllUserDetails;
