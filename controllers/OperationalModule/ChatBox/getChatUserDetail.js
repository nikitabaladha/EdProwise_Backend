// import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
// import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
// import School from "../../../models/School.js";

// const getChatUserDetail = async (req, res) => {
//   try {
//     const { schoolId, role, userId } = req.params;
//     let user = null;

//     if (role === "Student") {
//       // 🔹 Find student by AdmissionNumber + schoolId
//       user = await AdmissionForm.findOne({
//         AdmissionNumber: userId,
//         schoolId,
//       }).select(
//         "firstName middleName lastName name studentPhoto AdmissionNumber schoolId"
//       );

//       if (user) {
//         user = {
//           _id: user._id,
//           userId: user.AdmissionNumber,
//           name:
//             user.name ||
//             `${user.firstName} ${user.middleName || ""} ${user.lastName}`,
//           profileImage: user.studentPhoto,
//           role: "Student",
//           schoolId: user.schoolId,
//         };
//       }
//     } else if (role === "Employee") {
//       // 🔹 Find employee by employeeId + schoolId
//       user = await EmployeeRegistration.findOne({
//         employeeId: userId,
//         schoolId,
//       }).select("employeeName profileImage employeeId schoolId");

//       if (user) {
//         user = {
//           _id: user._id,
//           userId: user.employeeId,
//           name: user.employeeName,
//           profileImage: user.profileImage,
//           role: "Employee",
//           schoolId: user.schoolId,
//         };
//       }
//     } else if (role === "School") {
//       // 🔹 For School, userId === schoolId
//       user = await School.findOne({
//         schoolId: userId,
//       }).select("schoolId schoolName profileImage");

//       if (user) {
//         user = {
//           _id: user._id,
//           userId: user.schoolId,
//           name: user.schoolName,
//           profileImage: user.profileImage,
//           role: "School",
//           schoolId: user.schoolId,
//         };
//       }
//     } else {
//       return res.status(400).json({ message: "Invalid role provided." });
//     }

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     res.status(200).json({ success: true, user });
//   } catch (error) {
//     console.error("Error fetching chat user details:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export default getChatUserDetail;

import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
import School from "../../../models/School.js";

const getChatUserDetail = async (req, res) => {
  try {
    const { schoolId, role, userId } = req.query;
    let user = null;

    if (!schoolId || !role || !userId) {
      return res
        .status(400)
        .json({ message: "schoolId, role, and userId are required." });
    }

    if (role === "Student") {
      // 🔹 Find student by AdmissionNumber + schoolId
      user = await AdmissionForm.findOne({
        AdmissionNumber: userId,
        schoolId,
      }).select(
        "firstName middleName lastName name studentPhoto AdmissionNumber schoolId"
      );

      if (user) {
        user = {
          _id: user._id,
          userId: user.AdmissionNumber,
          name:
            user.name ||
            `${user.firstName} ${user.middleName || ""} ${
              user.lastName
            }`.trim(),
          profileImage: user.studentPhoto,
          role: "Student",
          schoolId: user.schoolId,
        };
      }
    } else if (role === "Employee") {
      // 🔹 Find employee by employeeId + schoolId
      user = await EmployeeRegistration.findOne({
        employeeId: userId,
        schoolId,
      }).select("employeeName profileImage employeeId schoolId");

      if (user) {
        user = {
          _id: user._id,
          userId: user.employeeId,
          name: user.employeeName,
          profileImage: user.profileImage,
          role: "Employee",
          schoolId: user.schoolId,
        };
      }
    } else if (role === "School") {
      // 🔹 For School, userId === schoolId
      user = await School.findOne({
        schoolId: userId,
      }).select("schoolId schoolName profileImage");

      if (user) {
        user = {
          _id: user._id,
          userId: user.schoolId,
          name: user.schoolName,
          profileImage: user.profileImage,
          role: "School",
          schoolId: user.schoolId,
        };
      }
    } else {
      return res.status(400).json({ message: "Invalid role provided." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching chat user details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default getChatUserDetail;
