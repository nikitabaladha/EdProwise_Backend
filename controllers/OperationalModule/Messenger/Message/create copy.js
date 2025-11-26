const Conversation = require("../../../models/Conversation");
const Messages = require("../../../models/Messenger");

const createMessage = async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body;
        if(!senderId || !message) return res.status(400).send('Please fill all required fields')
            if(conversationId === 'new' && receiverId){
                const newConversation = new Conversation({ members: [senderId, receiverId]})
                await newConversation.save();
                const newMessage = new Messages({conversationId: newConversation._id, senderId, message})
                await newMessage.save();
                return res.status(200).send("Message sent successfully")
            }else if(!conversationId && receiverId){
                return res.status(400).send('Please fill all required fields')
            }
        const newMessage = new Messages({ conversationId, senderId, message });
        await newMessage.save();

        res.status(200).send("Message sent successfully");
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = createMessage;
