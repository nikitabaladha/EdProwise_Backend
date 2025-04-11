import QuotePoposalSendToSchoolEmailTemplate from "../../../models/EmailTeamplates/QuotePoposalSendToSchoolEmailTemplate.js";

const createAndUpdate = async (req, res) => {
    try {
        const { subject, content, mailFrom } = req.body;

        if (!subject || !content ) {
            return res.status(400).json({ hasError: true, message: "All fields are required." });
        }

        let emailTemplate = await QuotePoposalSendToSchoolEmailTemplate.findOne();
        
        if (emailTemplate) {
            emailTemplate.mailFrom = mailFrom;
            emailTemplate.subject = subject;
            emailTemplate.content = content;
        } else {
            emailTemplate = new QuotePoposalSendToSchoolEmailTemplate({ mailFrom: mailFrom , subject, content });
        }

        await emailTemplate.save();
        res.status(200).json({ hasError: false, message: "Quote Propsal Send To School template saved successfully!" });

    } catch (error) {
        res.status(500).json({ hasError: true, message: "Quote Propsal Send To School Email template Not saved" });
    }
};

export default createAndUpdate;