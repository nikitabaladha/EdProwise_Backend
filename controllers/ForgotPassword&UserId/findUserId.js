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

async function sendVerificationCode(req, res) {
    const { userId } = req.body;
    console.log("User ID received:", userId);
    
    try {
        let user = await Seller.findOne({ userId });
        let userEmail = null;
        
        if (user) {
            const sellerDetails = await SellerProfile.findOne({ sellerId: user._id }); 
            
            if (sellerDetails) {
                userEmail = sellerDetails.emailId;
                console.log("Seller Email:", userEmail);
            }
        } else {
            user = await User.findOne({ userId });  

            if (user) {
                console.log("School User Found:", user);
                const schoolDetails = await School.findOne({ schoolId: user.schoolId }); 
                
                if (schoolDetails) {
                    userEmail = schoolDetails.schoolEmail;
                    console.log("School Email:", userEmail);
                }
            }
        }
        console.log("user Details:", user, "Email :", userEmail);
        
        if (!user || !userEmail) {
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
            <p>Your password reset verification code is: <strong>${verificationCode}</strong></p>
            <p>This code is valid for 1 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `;

        
        await transporter.sendMail({
            from: `"${smtpSettings.mailFromName}" <${smtpSettings.mailFromAddress}>`,
            to: userEmail, 
            subject: "Password Reset Verification Code",
            html: emailContent,
        });

        console.log(`Verification email sent successfully to ${userEmail}.`);

        await VerificationCode.findOneAndUpdate(
            { userId },
            { code: verificationCode, expiresAt: new Date(Date.now() + 1 * 60000) },
            { upsert: true, new: true }
        );

        return res.json({ hasError: false, message: "Verification code sent to registered email.", email:userEmail });



    } catch (error) {
        console.error("Error sending verification email:", error);
        return res.status(500).json({ hasError: true, message: "Failed to send verification code." });
    }
}

export default sendVerificationCode;
