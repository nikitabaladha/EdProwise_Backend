import SchoolOrderPlaceEmailTemplate from "../../../models/EmailTeamplates/SchoolOrderPlaceEmailTemplate.js";

const createAndUpdateOrderPlace = async (req, res) => {
    try {
        const { subject, content, mailFrom } = req.body;

        if (!subject || !content ) {
            return res.status(400).json({ hasError: true, message: "All fields are required." });
        }

        let emailTemplate = await SchoolOrderPlaceEmailTemplate.findOne();
        
        if (emailTemplate) {
            emailTemplate.mailFrom = mailFrom;
            emailTemplate.subject = subject;
            emailTemplate.content = content;
        } else {
            emailTemplate = new SchoolOrderPlaceEmailTemplate({ mailFrom: mailFrom , subject, content });
        }

        await emailTemplate.save();
        res.status(200).json({ hasError: false, message: "Order Place template saved successfully!" });

    } catch (error) {
        res.status(500).json({ hasError: true, message: "Order Place Email template Not saved" });
    }
};

export default createAndUpdateOrderPlace;