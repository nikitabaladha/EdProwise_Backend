import SchoolRequestForQuoteEmailTemplate from "../../../models/EmailTeamplates/SchoolRequestForQuoteEmailTemplate.js";

const createAndUpdate = async (req, res) => {
    try {
        const { subject, content, mailFrom } = req.body;

        if (!subject || !content ) {
            return res.status(400).json({ hasError: true, message: "All fields are required." });
        }

        let emailTemplate = await SchoolRequestForQuoteEmailTemplate.findOne();
        
        if (emailTemplate) {
            emailTemplate.mailFrom = mailFrom;
            emailTemplate.subject = subject;
            emailTemplate.content = content;
        } else {
            emailTemplate = new SchoolRequestForQuoteEmailTemplate({ mailFrom: mailFrom , subject, content });
        }

        await emailTemplate.save();
        res.status(200).json({ hasError: false, message: "Request Quote template saved successfully!" });

    } catch (error) {
        res.status(500).json({ hasError: true, message: "Request Quote Email template Not saved" });
    }
};

export default createAndUpdate;