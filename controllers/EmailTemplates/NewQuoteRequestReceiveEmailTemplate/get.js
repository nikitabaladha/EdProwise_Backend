import NewQuoteRequestReceiveEmailTemplate from "../../../models/EmailTeamplates/NewQuoteRequestReceiveEmailTemplate.js";

const get = async (req, res) => {
    try {
        const emailTemplate = await NewQuoteRequestReceiveEmailTemplate.findOne();
        
        if (!emailTemplate) {
            return res.status(404).json({ hasError: true, message: "No email template found." });
        }

        res.status(200).json({ hasError: false, data: emailTemplate });
    } catch (err) {
        res.status(500).json({ hasError: true, message: "Internal Server Error", error: err.message });
    }
};

export default get;