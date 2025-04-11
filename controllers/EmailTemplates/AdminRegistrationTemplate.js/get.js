import AdminRegistrationEmailTemplate from "../../../models/EmailTeamplates/AdminRegistrationEmailTemplate.js";
const get = async (req, res) => {
    try {
        const adminTemplate = await AdminRegistrationEmailTemplate.findOne();
        
        if (!adminTemplate) {
            return res.status(404).json({ hasError: true, message: "No admin Registration email template found." });
        }

        res.status(200).json({ hasError: false, data: adminTemplate });
    } catch (err) {
        res.status(500).json({ hasError: true, message: "Internal Server Error", error: err.message });
    }
};

export default get;