
// import Message from "../../../models/OperationalModule/Message.js";

// const getMessages = async (req, res) => {
//   try {
//     const { conversationId } = req.query;
//     if (!conversationId) {
//       return res
//         .status(400)
//         .json({ hasError: true, message: "conversationId is required" });
//     }

//     const messages = await Message.find({ conversationId }).sort({
//       createdAt: 1,
//     });
//     return res.status(200).json({ success: true, messages });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ hasError: true, message: "Internal server error" });
//   }
// };

// export default getMessages;
// controllers/chat/getMessages.js
// import Message from "../../../models/OperationalModule/Message.js";

// const getMessages = async (req, res) => {
//   try {
//     const { conversationId } = req.params;
// console.log("get messages",conversationId);

//     const messages = await Message.find({ conversationId })
//       .sort({ createdAt: 1 }) 
//       .lean();

//       console.log("get messages", messages);
      
//     res.status(200).json({
//       success: true,
//       conversationId,
//       messages,
//     });
    
//   } catch (error) {
//     console.error("Error in getMessages:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export default getMessages;

import Message from "../../../models/OperationalModule/Message.js";
import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
import School from "../../../models/School.js";
import User from "../../../models/User.js";

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log("get messages", conversationId);

    // Fetch messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    if (!messages.length) {
      return res.status(200).json({
        success: true,
        conversationId,
        messages: [],
      });
    }

    // Collect unique senderIds
    const senderIds = [
      ...new Set(messages.map((msg) => msg.senderId?.toString())),
    ];

    // Fetch details from different models
    const [students, employees, users] = await Promise.all([
      AdmissionForm.find({ _id: { $in: senderIds } })
        .select("_id firstName middleName lastName studentPhoto")
        .lean(),
      EmployeeRegistration.find({ _id: { $in: senderIds } })
        .select("_id firstName middleName lastName profileImage designation")
        .lean(),
      User.find({ _id: { $in: senderIds } })
        .select("_id userId role schoolId")
        .lean(),
    ]);

    // Create map for fast lookup
    const userMap = new Map();

    // Students
    students.forEach((student) => {
      userMap.set(student._id.toString(), {
        _id: student._id,
        name: `${student.firstName || ""} ${student.middleName || ""} ${
          student.lastName || ""
        }`.trim(),
        profileImage: student.studentPhoto,
        role: "Student",
      });
    });

    // Employees
    employees.forEach((employee) => {
      userMap.set(employee._id.toString(), {
        _id: employee._id,
        name: `${employee.firstName || ""} ${employee.middleName || ""} ${
          employee.lastName || ""
        }`.trim(),
        profileImage: employee.profileImage,
        role: employee.designation || "Employee",
      });
    });

    // Users (School, Principal, Auditor, etc.)
    for (let user of users) {
      const school = await School.findOne({ schoolId: user.schoolId }).select(
        "schoolName profileImage"
      );

      userMap.set(user._id.toString(), {
        _id: user._id,
        userId: user.userId,
        name: school ? school.schoolName : "Unknown School User",
        profileImage: school ? school.profileImage : "",
        role: user.role,
        schoolId: user.schoolId,
      });
    }

    // Attach sender details to each message
    const enrichedMessages = messages.map((msg) => {
      const senderInfo = userMap.get(msg.senderId?.toString());
      return {
        ...msg,
        senderDetails: senderInfo || {
          _id: msg.senderId,
          name: "Unknown User",
          profileImage: "",
          role: "Unknown",
        },
      };
    });

    res.status(200).json({
      success: true,
      conversationId,
      messages: enrichedMessages,
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getMessages;
