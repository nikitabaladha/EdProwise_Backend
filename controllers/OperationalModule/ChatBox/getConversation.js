// controllers/chat/getConversations.js
// import Conversation from "../../../models/OperationalModule/Conversation.js";
// import Message from "../../../models/OperationalModule/Message.js";

// const getConversations = async (req, res) => {
//   try {
//     const { userId } = req.params; 

//     let conversations = await Conversation.find({
//       "members.userId": userId,
//     })
//     .populate('members.userId', 'firstName lastName name profileImage') // Populate user details
//     .lean();

//     const conversationsWithLastMessage = await Promise.all(
//       conversations.map(async (conv) => {
//         const lastMsg = await Message.findOne({ conversationId: conv._id })
//           .sort({ createdAt: -1 })
//           .lean();

//         return {
//           ...conv,
//           lastMessage: lastMsg || null,
//         };
//       })
//     );

//     conversationsWithLastMessage.sort((a, b) => {
//       if (!a.lastMessage) return 1;
//       if (!b.lastMessage) return -1;
//       return (
//         new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
//       );
//     });

//     res.status(200).json(conversationsWithLastMessage);
//   } catch (error) {
//     console.error("Error in getConversations:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }

// };

// export default getConversations;

// controllers/chat/getConversations.js - OPTIMIZED VERSION
// import Conversation from "../../../models/OperationalModule/Conversation.js";
// import Message from "../../../models/OperationalModule/Message.js";
// import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
// import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
// import School from "../../../models/School.js";
// import User from "../../../models/User.js";
// const getConversations = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     let conversations = await Conversation.find({
//       "members.userId": userId,
//     })
//       .populate('members.userId', 'firstName lastName name profileImage')
//       .lean();

//     // Get all other user IDs from one-to-one conversations
//     const otherUserIds = [];
//     conversations.forEach(conv => {
//       if (!conv.isGroup) {
//         const otherMember = conv.members.find(
//           member => member.userId._id.toString() !== userId
//         );
//         if (otherMember) {
//           otherUserIds.push(otherMember.userId._id);
//         }
//       }
//     });

//     // Fetch all user details in bulk
//     const [students, employees] = await Promise.all([
//       AdmissionForm.find({ _id: { $in: otherUserIds } })
//         .select('_id firstName middleName lastName studentPhoto className sectionName')
//         .lean(),
//       EmployeeRegistration.find({ _id: { $in: otherUserIds } })
//         .select('_id firstName middleName lastName profileImage designation')
//         .lean(),
//     ]);

//     // Create a map for quick user lookup
//     const userMap = new Map();
    
//     students.forEach(student => {
//       userMap.set(student._id.toString(), {
//         _id: student._id,
//         name: `${student.firstName || ''} ${student.middleName || ''} ${student.lastName || ''}`.trim(),
//         profileImage: student.studentPhoto,
//         role: "Student",
//         className: student.className,
//         sectionName: student.sectionName,
//       });
//     });

//     employees.forEach(employee => {
//       userMap.set(employee._id.toString(), {
//         _id: employee._id,
//         name: `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.trim(),
//         profileImage: employee.profileImage,
//         role: employee.designation || "Employee",
//         designation: employee.designation,
//       });
//     });

//     // Get last messages for all conversations
//     const conversationsWithLastMessage = await Promise.all(
//       conversations.map(async (conv) => {
//         const lastMsg = await Message.findOne({ conversationId: conv._id })
//           .sort({ createdAt: -1 })
//           .lean();

//         // Add other user details for one-to-one conversations
//         if (!conv.isGroup) {
//           const otherMember = conv.members.find(
//             member => member.userId._id.toString() !== userId
//           );
          
//           if (otherMember) {
//             const otherUserId = otherMember.userId._id.toString();
//             conv.otherUser = userMap.get(otherUserId) || {
//               _id: otherMember.userId._id,
//               name: "Unknown User",
//               profileImage: "",
//               role: "Unknown",
//             };
//           }
//         }

//         return {
//           ...conv,
//           lastMessage: lastMsg || null,
//         };
//       })
//     );

//     // Sort by last message timestamp
//     conversationsWithLastMessage.sort((a, b) => {
//       if (!a.lastMessage) return 1;
//       if (!b.lastMessage) return -1;
//       return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
//     });

//     res.status(200).json(conversationsWithLastMessage);
//   } catch (error) {
//     console.error("Error in getConversations:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export default getConversations;

import Conversation from "../../../models/OperationalModule/Conversation.js";
import Message from "../../../models/OperationalModule/Message.js";
import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
import School from "../../../models/School.js";
import User from "../../../models/User.js";

const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    let conversations = await Conversation.find({
      "members.userId": userId,
    })
      .populate("members.userId", "firstName lastName name profileImage")
      .lean();

    // Get all other user IDs from one-to-one conversations
    const otherUserIds = [];
    conversations.forEach((conv) => {
      if (!conv.isGroup) {
        const otherMember = conv.members.find(
          (member) => member.userId._id.toString() !== userId
        );
        if (otherMember) {
          otherUserIds.push(otherMember.userId._id);
        }
      }
    });

    // Fetch all user details in bulk
    const [students, employees, users] = await Promise.all([
      AdmissionForm.find({ _id: { $in: otherUserIds } })
        .select(
          "_id firstName middleName lastName studentPhoto className sectionName"
        )
        .lean(),
      EmployeeRegistration.find({ _id: { $in: otherUserIds } })
        .select("_id firstName middleName lastName profileImage designation")
        .lean(),
      User.find({ _id: { $in: otherUserIds } })
        .select("_id userId role schoolId")
        .lean(),
    ]);

    // Map for fast lookup
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
        className: student.className,
        sectionName: student.sectionName,
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
        designation: employee.designation,
      });
    });

    // Users (School/Principal/Auditor/User)
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

    // Get last messages for all conversations
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 })
          .lean();

        if (!conv.isGroup) {
          const otherMember = conv.members.find(
            (member) => member.userId._id.toString() !== userId
          );

          if (otherMember) {
            const otherUserId = otherMember.userId._id.toString();
            conv.otherUser = userMap.get(otherUserId) || {
              _id: otherMember.userId._id,
              name: "Unknown User",
              profileImage: "",
              role: "Unknown",
            };
          }
        }

        return {
          ...conv,
          lastMessage: lastMsg || null,
        };
      })
    );

    // Sort by last message timestamp
    conversationsWithLastMessage.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
    });

    res.status(200).json(conversationsWithLastMessage);
  } catch (error) {
    console.error("Error in getConversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default getConversations;
