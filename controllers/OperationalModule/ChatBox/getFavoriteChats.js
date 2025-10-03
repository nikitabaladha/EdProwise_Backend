// import FavoriteChat from "../../../models/OperationalModule/FavoriteChat.js";

// const getFavoriteChats = async (req, res) => {
//  try {
//      const { userId } = req.params;
 
//      const favorites = await FavoriteChat.find({ userId })
//        .populate("conversationId")
//        .sort({ createdAt: -1 });
 
//      res.json({
//        success: true,
//        data: favorites,
//      });
//    } catch (error) {
//      console.error("Error fetching favorites:", error);
//      res.status(500).json({
//        success: false,
//        message: "Internal server error",
//      });
//    }
// };

// export default getFavoriteChats;

import FavoriteChat from "../../../models/OperationalModule/FavoriteChat.js";
import Conversation from "../../../models/OperationalModule/Conversation.js";
import Message from "../../../models/OperationalModule/Message.js";
import AdmissionForm from "../../../models/FeesModule/AdmissionForm.js";
import EmployeeRegistration from "../../../models/PayrollModule/Employer/EmployeeRegistration.js";
import School from "../../../models/School.js";
import User from "../../../models/User.js";

const getFavoriteChats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get favorite chats
    const favorites = await FavoriteChat.find({ userId })
      .populate("conversationId")
      .sort({ createdAt: -1 })
      .lean();

    if (favorites.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Extract conversation IDs
    const conversationIds = favorites.map((fav) => fav.conversationId._id);

    // Get conversations with members populated
    let conversations = await Conversation.find({
      _id: { $in: conversationIds },
    })
      .populate("members.userId", "firstName lastName name profileImage")
      .lean();

    // Get user details for one-to-one chats
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

    // Fetch user details (same as your getConversations)
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

    // Create user map
    const userMap = new Map();

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

    // Get last messages and enrich conversations
    const favoriteChatsWithDetails = await Promise.all(
      favorites.map(async (favorite) => {
        const conversation = conversations.find(
          (conv) =>
            conv._id.toString() === favorite.conversationId._id.toString()
        );

        if (!conversation) {
          return null;
        }

        const lastMsg = await Message.findOne({
          conversationId: conversation._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        let displayUser = null;

        if (conversation.isGroup) {
          displayUser = {
            _id: conversation._id,
            name: conversation.groupName,
            profileImage: conversation.groupImage,
            isGroup: true,
            groupName: conversation.groupName,
            groupImage: conversation.groupImage,
          };
        } else {
          const otherMember = conversation.members.find(
            (member) => member.userId._id.toString() !== userId
          );
          if (otherMember) {
            const otherUserId = otherMember.userId._id.toString();
            const userDetails = userMap.get(otherUserId);
            displayUser = userDetails
              ? {
                  _id: userDetails._id,
                  name: userDetails.name,
                  profileImage: userDetails.profileImage,
                  isGroup: false,
                  role: userDetails.role,
                  className: userDetails.className,
                  sectionName: userDetails.sectionName,
                  designation: userDetails.designation,
                }
              : {
                  _id: otherMember.userId._id,
                  name: "Unknown User",
                  profileImage: "",
                  isGroup: false,
                  role: "Unknown",
                };
          }
        }

        return {
          _id: favorite._id,
          conversationId: conversation._id,
          isGroup: conversation.isGroup,
          groupName: conversation.groupName,
          groupImage: conversation.groupImage,
          lastMessage: lastMsg,
          otherUser: displayUser,
          createdAt: favorite.createdAt,
          updatedAt: favorite.updatedAt,
        };
      })
    );

    // Filter out null values and return
    const validFavorites = favoriteChatsWithDetails.filter(
      (fav) => fav !== null
    );

    res.json({
      success: true,
      data: validFavorites,
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getFavoriteChats;