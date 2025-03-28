import SignUpEmailTemplate from "../../../models/SignUpEmailTemplate.js";

const get = async (req, res) => {
    try {
        const signUpTemplate = await SignUpEmailTemplate.findOne();
        
        if (!signUpTemplate) {
            return res.status(404).json({ hasError: true, message: "No signup email template found." });
        }

        res.status(200).json({ hasError: false, data: signUpTemplate });
    } catch (err) {
        res.status(500).json({ hasError: true, message: "Internal Server Error", error: err.message });
    }
};

export default get;