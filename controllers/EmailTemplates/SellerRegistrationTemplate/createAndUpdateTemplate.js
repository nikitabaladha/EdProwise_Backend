import SellerRegistrationEmailTemplate from "../../../models/EmailTeamplates/SellerRegistrationEmailTemplate.js";
const createAndUpdateTemplate = async (req, res) => {
    try {
        const { subject, content, mailFrom } = req.body;

        if (!subject || !content ) {
            return res.status(400).json({ hasError: true, message: "All fields are required." });
        }

        let sellerTemplate = await SellerRegistrationEmailTemplate.findOne();
        
        if (sellerTemplate) {
            sellerTemplate.mailFrom = mailFrom;
            sellerTemplate.subject = subject;
            sellerTemplate.content = content;
        } else {
            sellerTemplate = new SellerRegistrationEmailTemplate({ mailFrom: mailFrom , subject, content });
        }

        await sellerTemplate.save();
        res.status(200).json({ hasError: false, message: "Seller Registration template saved successfully!" });

    } catch (error) {
        res.status(500).json({ hasError: true, message: "Seller Registration Email template Not saved" });
    }
};

export default createAndUpdateTemplate;