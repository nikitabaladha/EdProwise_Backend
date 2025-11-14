import mongoose from "mongoose";
import StudentRegistration from "../../../../models/FeesModule/RegistrationForm.js";
import { RegistrationPayment } from "../../../../models/FeesModule/RegistrationForm.js";
import { RegistrationCreateValidator } from "../../../../validators/RegistrationValidator/RegistrationValidator.js";
import EaseBuzzData from "../../../../models/EasebuzzData.js";
import crypto from "crypto";
import axios from "axios";




const getFilePath = (file) =>
    file
        ? file.mimetype.startsWith("image/")
            ? `/Images/Registration/${file.filename}`
            : `/Documents/Registration/${file.filename}`
        : "";

const registrationWithOnlinePayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            return res.status(401).json({ hasError: true, message: "Unauthorized: School ID missing" });
        }


        const { error } = RegistrationCreateValidator.validate(req.body);
        if (error) {
            return res.status(400).json({ hasError: true, message: error.details[0].message });
        }


        const {
            firstName,
            lastName,
            email,
            phone,
            finalAmount: finalAmountStr,
            registrationFee: registrationFeeStr,
            concessionAmount: concessionAmountStr,
            academicYear,
        } = req.body;

        if (!firstName || !email || !phone) {
            return res.status(400).json({ hasError: true, message: "Name, email, and phone are required" });
        }

        const finalAmount = Number(finalAmountStr) || 0;
        const registrationFee = Number(registrationFeeStr) || 0;
        const concessionAmount = Number(concessionAmountStr) || 0;

        if (finalAmount <= 0) {
            return res.status(400).json({ hasError: true, message: "Final amount must be greater than 0" });
        }


        const files = req.files || {};
        const studentData = {
            ...req.body,
            schoolId,
            studentPhoto: getFilePath(files.studentPhoto?.[0]),
            tcCertificate: getFilePath(files.tcCertificate?.[0]),
            proofOfResidence: getFilePath(files.proofOfResidence?.[0]),
            aadharPassportFile: getFilePath(files.aadharPassportFile?.[0]),
            castCertificate: getFilePath(files.castCertificate?.[0]),
            idCardFile: getFilePath(files.idCardFile?.[0]),
            previousSchoolResult: getFilePath(files.previousSchoolResult?.[0]),
        };


        const newStudent = new StudentRegistration(studentData);
        await newStudent.save({ session });


        const creds = await EaseBuzzData.findOne({ schoolId }).lean();
        if (!creds || !creds.EASEBUZZ_KEY || !creds.EASEBUZZ_SALT) {
            return res.status(400).json({ hasError: true, message: "Payment gateway not configured" });
        }


        const txnId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`.toUpperCase();


        const productInfo = `Registration Fee - ${academicYear}`;
        const initiateData = {
            key: creds.EASEBUZZ_KEY,
            txnid: txnId,
            amount: finalAmount.toFixed(2),
            productinfo: productInfo,
            firstname: `${firstName} ${lastName || ""}`.trim(),
            email,
            phone,
            surl: `${process.env.BACKEND_URL}/api/payment/success`,
            furl: `${process.env.BACKEND_URL}/api/payment/failure`,
            udf1: newStudent._id,
            udf2: schoolId,
            udf3: academicYear,
            udf4: finalAmount,
            udf5: registrationFee,
            udf6: concessionAmount,
             udf7: '',
           udf8: '',
        udf9: '',
        udf10: '',
        };


        const hashString = `${initiateData.key}|${initiateData.txnid}|${initiateData.amount}|${initiateData.productinfo}|${initiateData.firstname}|${initiateData.email}|${initiateData.udf1}|${initiateData.udf2}|${initiateData.udf3}|${initiateData.udf4}|${initiateData.udf5}|${initiateData.udf6}||||||${creds.EASEBUZZ_SALT}`;
        initiateData.hash = crypto.createHash("sha512").update(hashString).digest("hex");


        const easebuzzUrl =
            process.env.EASEBUZZ_ENV === "prod"
                ? "https://pay.easebuzz.in"
                : "https://testpay.easebuzz.in";

        const apiRes = await axios.post(
            `${easebuzzUrl}/payment/initiateLink`,
            new URLSearchParams(initiateData).toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                timeout: 30000,
            }
        );

        const result = apiRes.data;
        if (result.status !== "1" && result.status !== 1) {
            await session.abortTransaction();
            return res.status(400).json({ hasError: true, message: result.msg || "Payment initiation failed" });
        }

        const accessKey = typeof result.data === "string" ? result.data : result.data?.access_key;
        const paymentUrl = `${easebuzzUrl}/pay/${accessKey}`;


        const pendingPayment = new RegistrationPayment({
            studentId: newStudent._id,
            schoolId,
            academicYear,
            registrationFee,
            concessionAmount,
            finalAmount,
            paymentMode: "Online",
            name: `${firstName} ${lastName || ""}`.trim(),
            status: "Pending",
            easebuzzTxnId: txnId,
            easebuzzResponse: result,
            transactionNumber: txnId,
        });
        await pendingPayment.save({ session });


        await session.commitTransaction();


        return res.json({
            hasError: false,
            message: "Registration successful. Redirecting to payment...",
            paymentUrl,
            txnId,
        });
    } catch (err) {
        await session.abortTransaction();
        console.error("Registration error:", err);
        return res.status(500).json({
            hasError: true,
            message: "Internal server error",
            details: err.message,
        });
    } finally {
        session.endSession();
    }
};

export default registrationWithOnlinePayment;