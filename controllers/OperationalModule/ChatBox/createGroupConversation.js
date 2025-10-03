// // controllers/chat/createGroupConversation.js
// import Conversation from "../../../models/OperationalModule/Conversation.js";
// import path from "path";
// import fs from "fs";

// const createGroupConversation = async (req, res) => {
//   try {
//     const { groupName, members, createdBy } = req.body;
//     if (!groupName || !members || members.length === 0 ) {
//       return res
//         .status(400)
//         .json({ message: "Group name, members, and createdBy are required" });
//     }
//     console.log("groupName", groupName);
// console.log("groupMembers", members);
// console.log("createdBy", createdBy);
//     let groupImagePath = "";
//     if (req.file) {
//       // Save file path (upload handled by multer)
//       groupImagePath = `/Images/GroupImages/${req.file.filename}`;
//     }

//     const conversation = new Conversation({
//       isGroup: true,
//       groupName,
//       groupImage: groupImagePath,
//       members: members.map((m) => ({
//         userId: m.userId,
//         userType: m.userType,
//       })),
//       createdBy,
//     });

//     await conversation.save();

//     return res.status(201).json({
//       success: true,
//       message: "Group created successfully",
//       conversation,
//     });
//   } catch (error) {
//     console.error("Error creating group:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// export default createGroupConversation;

// controllers/chat/createGroupConversation.js
// import Conversation from "../../../models/OperationalModule/Conversation.js";

// const createGroupConversation = async (req, res) => {
//   try {
//     let { groupName, members, createdBy } = req.body;

//     if (typeof members === "string") {
//       try {
//         members = JSON.parse(members);
//       } catch (err) {
//         return res.status(400).json({ message: "Invalid members format" });
//       }
//     } 

//     if (!Array.isArray(members) || members.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Members must be a non-empty array" });
//     }

//     if (!groupName || !createdBy) {
//       return res
//         .status(400)
//         .json({ message: "Group name and createdBy are required" });
//     }

//     console.log(" groupName:", groupName);
//     console.log(" groupMembers:", members);
//     console.log(" createdBy:", createdBy);

//     let groupImagePath = "";
//     if (req.file) {
//       groupImagePath = `/Images/GroupImages/${req.file.filename}`;
//     }

//     const conversation = new Conversation({
//       isGroup: true,
//       groupName,
//       groupImage: groupImagePath,
//       members: members.map((m) => ({
//         userId: m.userId,
//         userType: m.userType,
//       })),
//       createdBy,
//     });

//     await conversation.save();

//     return res.status(201).json({
//       success: true,
//       message: "Group created successfully",
//       conversation,
//     });
//   } catch (error) {
//     console.error("Error creating group:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// export default createGroupConversation;

import Conversation from "../../../models/OperationalModule/Conversation.js";

const createGroupConversation = async (req, res) => {
  try {
    let { groupName, members, createdBy, createdByType } = req.body;

    // if members came as JSON string (from FormData)
    if (typeof members === "string") {
      try {
        members = JSON.parse(members);
      } catch (err) {
        return res.status(400).json({ message: "Invalid members format" });
      }
    }

    if (!Array.isArray(members) || members.length === 0) {
      return res
        .status(400)
        .json({ message: "Members must be a non-empty array" });
    }

    if (!groupName || !createdBy) {
      return res
        .status(400)
        .json({ message: "Group name and createdBy are required" });
    }

    console.log("groupName:", groupName);
    console.log("groupMembers:", members);
    console.log("createdBy:", createdBy);

    let groupImagePath = "";
    if (req.file) {
      groupImagePath = `/Images/GroupImages/${req.file.filename}`;
    }

    // ✅ Ensure the creator is also added to members as Admin
    const creatorMember = {
      userId: createdBy,
      userType: createdByType || "Admin", // default Admin
    };

    const conversation = new Conversation({
      isGroup: true,
      groupName,
      groupImage: groupImagePath,
      members: [
        creatorMember,
        ...members.map((m) => ({
          userId: m.userId,
          userType: m.userType,
        })),
      ],
      createdBy,
    });

    await conversation.save();

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      conversation,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default createGroupConversation;
