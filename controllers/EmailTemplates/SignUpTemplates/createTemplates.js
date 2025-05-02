import SignUpEmailTemplate from "../../../models/SignUpEmailTemplate.js";

const createTemplate = async (req, res) => {
    try {
        const { subject, content, mailFrom } = req.body;

        if (!subject || !content ) {
            return res.status(400).json({ hasError: true, message: "All fields are required." });
        }

        let signUpTemplate = await SignUpEmailTemplate.findOne();
        
        if (signUpTemplate) {
            signUpTemplate.mailFrom = mailFrom;
            signUpTemplate.subject = subject;
            signUpTemplate.content = content;
        } else {
            signUpTemplate = new SignUpEmailTemplate({ mailFrom: mailFrom , subject, content });
        }

        await signUpTemplate.save();
        res.status(200).json({ hasError: false, message: "SignUp Email template saved successfully!" });

    } catch (error) {
        res.status(500).json({ hasError: true, message: "SignUp Email template Not saved" });
    }
};

export default createTemplate;