// controllers/emailController.js
import School from "../../models/School.js";
import SellerProfile from "../../models/SellerProfile.js";
import AdminUser from "../../models/AdminUser.js";
export const getAllEmails = async (req, res) => {
    try {
        const schoolEmails = await School.find({}, "schoolEmail").lean();
        const sellerEmails = await SellerProfile.find({}, "emailId").lean();
        const adminEmails = await AdminUser.find({}, "email").lean();

        const allEmails = [
            ...schoolEmails.map(obj => obj.schoolEmail),
            ...sellerEmails.map(obj => obj.emailId),
            ...adminEmails.map(obj => obj.email),
        ];

        const uniqueEmails = [...new Set(allEmails.filter(Boolean))]; // remove undefined/null

        res.status(200).json({ hasError: false, data: uniqueEmails });
    } catch (error) {
        res.status(500).json({ hasError: true, message: error.message });
    }
};

export default getAllEmails;