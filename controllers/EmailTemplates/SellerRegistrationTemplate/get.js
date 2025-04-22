import SellerRegistrationEmailTemplate from "../../../models/EmailTeamplates/SellerRegistrationEmailTemplate.js";
const get = async (req, res) => {
    try {
        const sellerTemplate = await SellerRegistrationEmailTemplate.findOne();
        
        if (!sellerTemplate) {
            return res.status(404).json({ hasError: true, message: "No seller Registration email template found." });
        }

        res.status(200).json({ hasError: false, data: sellerTemplate });
    } catch (err) {
        res.status(500).json({ hasError: true, message: "Internal Server Error", error: err.message });
    }
};

export default get;