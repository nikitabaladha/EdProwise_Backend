import passwordUpdateEmailTemplate from "../../../models/EmailTeamplates/passwordUpdateEmailTemplate.js";
const get = async (req, res) => {
    try {
        const passwordTemplate = await passwordUpdateEmailTemplate.findOne();
        
        if (!passwordTemplate) {
            return res.status(404).json({ hasError: true, message: "No password Template template found." });
        }

        res.status(200).json({ hasError: false, data: passwordTemplate });
    } catch (err) {
        res.status(500).json({ hasError: true, message: "Internal Server Error", error: err.message });
    }
};

export default get;