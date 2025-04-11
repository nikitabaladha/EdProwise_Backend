import nodemailer from "nodemailer";
import SMTPEmailSetting from "../../models/SMTPEmailSetting.js";
import VerificationCode from "../../models/VerificationCode.js";
import SellerProfile from "../../models/SellerProfile.js";
import School from "../../models/School.js";
import User from "../../models/User.js";
import Seller from "../../models/Seller.js";


function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function findUserByEmail(req, res) {
    const { email } = req.body;
    console.log("Email  received:", email);
    
    try {
        let user = await SellerProfile.findOne({emailId: email});
        let userId = null;
        let userEmail = email; 
        if (user) {
            const sellerDetails = await Seller.findOne({ _id: user.sellerId });  
            if (sellerDetails) {
                userId = sellerDetails.userId;
            }
        } else {
            user = await School.findOne({ schoolEmail: email });  

            if (user) {
                
                const schoolDetails = await User.findOne({ schoolId: user.schoolId, role: "School"  });  
                console.log("School Details:",schoolDetails);
                
                if (schoolDetails) {
                    userId = schoolDetails.userId;
                    
                }
            }
        }
        console.log("user Details:", user, "User Id is :", userId);
        
        if (!user || !userId) {
            return res.status(404).json({ hasError: true, message: "User not found or email missing." });
        }

        // Generate a new verification code
        const verificationCode = generateVerificationCode();

        // Store the verification code in the database with an expiration time (5 mins)
        

      
        const smtpSettings = await SMTPEmailSetting.findOne();
        if (!smtpSettings) throw new Error("SMTP settings not found");

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: smtpSettings.mailHost,
            port: smtpSettings.mailPort,
            secure: false,
            auth: {
                user: smtpSettings.mailUsername,
                pass: smtpSettings.mailPassword,
            },
            tls: { rejectUnauthorized: false }
        });

        // Email content
        const emailContent = `
            <p>Hello ${user.userId || "User"},</p>
            <p>Your userId reset verification code is: <strong>${verificationCode}</strong></p>
            <p>This code is valid for 1 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `;

        
        await transporter.sendMail({
            from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
            to: userEmail, 
            subject: "UserId Reset Verification Code",
            html: emailContent,
        });

        console.log(`Verification email sent successfully to ${userEmail}.`);

        await VerificationCode.findOneAndUpdate(
            { userId },
            { code: verificationCode, expiresAt: new Date(Date.now() + 1 * 60000) },
            { upsert: true, new: true }
        );

        return res.json({ hasError: false, message: "Verification code sent to registered email.", userId:userId });



    } catch (error) {
        console.error("Error sending verification email:", error);
        return res.status(500).json({ hasError: true, message: "Failed to send verification code." });
    }
}

export default findUserByEmail;
