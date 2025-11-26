// const Conversation = require("../../../models/Conversation");
// const Messages = require("../../../models/Messenger");

// const deleteConversation = async (req, res) => {
//     try {
//         const { conversationId } = req.params.conversationId;
//         console.log(conversationId)

//         if (!conversationId) {
//             return res.status(400).send("Conversation ID is required");
//         }
//         const conversation = await Conversation.findByIdAndDelete(conversationId);
//         if (!conversation) {
//             return res.status(404).send("Conversation not found");
//         }

//         await Messages.deleteMany({ conversationId });

//         res.status(200).send("Conversation and associated messages deleted successfully");
//     } catch (error) {
//         console.error("Error deleting conversation:", error);
//         res.status(500).send("Internal Server Error");
//     }
// };

// module.exports = deleteConversation;

const Conversation = require("../../../models/Conversation");
const Messages = require("../../../models/Messenger");

const deleteConversation = async (req, res) => {
    try {
        console.log("req.params:", req.params); // Debug req.params
        const conversationId = req.params.conversationId;
        console.log(conversationId) // Directly access

        if (!conversationId) {
            return res.status(400).send("Conversation ID is required");
        }

        const conversation = await Conversation.findByIdAndDelete(conversationId);
        if (!conversation) {
            return res.status(404).send("Conversation not found");
        }

        await Messages.deleteMany({ conversationId });

        res.status(200).send("Conversation and associated messages deleted successfully");
    } catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).send("Internal Server Error");
    }
};


module.exports = deleteConversation;
