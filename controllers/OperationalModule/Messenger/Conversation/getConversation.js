// const Users = require("../../../models/User");
import Conversation from "../../../../models/OperationalModule/Conversation.js";
import AdmissionForm from "../../../../models/FeesModule/AdmissionForm.js";
const getConversationsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversation.find({ members: { $in: [userId] } });
        
        const conversationUserData = await Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId);
            const user = await AdmissionForm.findById(receiverId);

            // Check if user is not null
            if (!user) {
                console.warn(`User with ID ${receiverId} not found.`);
                return null; // or handle this case as you see fit
            }

            return {
                user: { 
                    receiverId: user.id, 
                    email: user.email, 
                    name: user.name, 
                    profileImage: user.profileImage, 
                    role: user.role 
                },
                conversationId: conversation._id
            };
        }));

        // Filter out any null values from the conversationUserData array
        const filteredConversationUserData = conversationUserData.filter(data => data !== null);

        res.status(200).json(filteredConversationUserData);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = getConversationsByUserId;