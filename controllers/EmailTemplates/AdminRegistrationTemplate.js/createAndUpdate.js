import AdminRegistrationEmailTemplate from "../../../models/EmailTeamplates/AdminRegistrationEmailTemplate.js";
const createAndUpdateTemplate = async (req, res) => {
    try {
        const { subject, content, mailFrom } = req.body;

        if (!subject || !content ) {
            return res.status(400).json({ hasError: true, message: "All fields are required." });
        }

        let adminTemplate = await AdminRegistrationEmailTemplate.findOne();
        
        if (adminTemplate) {
            adminTemplate.mailFrom = mailFrom;
            adminTemplate.subject = subject;
            adminTemplate.content = content;
        } else {
            adminTemplate = new AdminRegistrationEmailTemplate({ mailFrom: mailFrom , subject, content });
        }

        await adminTemplate.save();
        res.status(200).json({ hasError: false, message: "Admin Registration template saved successfully!" });

    } catch (error) {
        res.status(500).json({ hasError: true, message: "Admin Registration Email template Not saved" });
    }
};

export default createAndUpdateTemplate;