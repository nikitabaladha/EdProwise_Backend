import SellerOrderReceiveEmailTemplate from "../../../models/EmailTeamplates/SellerOrderReceiveEmailTemplate.js";

const createAndUpdateOrderReceive = async (req, res) => {
    try {
        const { subject, content, mailFrom } = req.body;

        if (!subject || !content ) {
            return res.status(400).json({ hasError: true, message: "All fields are required." });
        }

        let emailTemplate = await SellerOrderReceiveEmailTemplate.findOne();
        
        if (emailTemplate) {
            emailTemplate.mailFrom = mailFrom;
            emailTemplate.subject = subject;
            emailTemplate.content = content;
        } else {
            emailTemplate = new SellerOrderReceiveEmailTemplate({ mailFrom: mailFrom , subject, content });
        }

        await emailTemplate.save();
        res.status(200).json({ hasError: false, message: "Order Receive template saved successfully!" });

    } catch (error) {
        res.status(500).json({ hasError: true, message: "Order Receive Email template Not saved" });
    }
};

export default createAndUpdateOrderReceive;