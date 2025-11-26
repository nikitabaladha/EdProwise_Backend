import Conversation from "../../../../models/OperationalModule/Conversation.js";
const createConversation = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newConversation = new Conversation({ members: [senderId, receiverId] });
        await newConversation.save();
        res.status(200).send("Conversation created successfully");
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).send("Internal Server Error");
    }
};

export default createConversation;