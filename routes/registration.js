import express from "express";
import Middleware from "../middleware/index.js";
import upload from "../controllers/uploadFiles.js";

import {
  createRegistration,
  updateRegistrationById,
  getAllRegistration,
  deleteRegistrationById,
} from "../controllers/Registration/index.js";

const router = express.Router();

// Middleware to handle file uploads
const uploadFiles = (req, res, next) => {
  upload.fields([
    { name: "resultOfPreviousSchoolUrl", maxCount: 1 },
    { name: "tcCertificateUrl", maxCount: 1 },
    { name: "aadharOrPassportUrl", maxCount: 1 },
    { name: "signatureUrl", maxCount: 1 },
    { name: "castCertificateUrl", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "File upload failed", details: err.message });
    }
    next();
  });
};

router.post("/registration", uploadFiles, Middleware, createRegistration);
router.put(
  "/registration/:id",
  uploadFiles,
  Middleware,
  updateRegistrationById
);
router.get("/registration", Middleware, getAllRegistration);
router.delete("/registration/:id", Middleware, deleteRegistrationById);

export default router;

// firstName
// "John"
// middleName
// "A."
// lastName
// "Doe"
// dateOfBirth
// 2000-01-01T00:00:00.000+00:00
// nationality
// "American"
// gender
// "Male"
// masterDefineClass
// "10th Grade"
// masterDefineShift
// "Morning"
// fatherName
// "Richard Doe"
// fatherContactNo
// "1234567890"
// motherName
// "Jane Doe"
// motherContactNo
// "0987654321"
// currentAddress
// "123 Main St"
// cityStateCountry
// "New York, NY, USA"
// pincode
// "123456"
// previousSchool
// "ABC High School"
// previousSchoolBoard
// "State Board"
// addressOfPreviousSchool
// "456 School St"
// caste
// "General"
// howDidYouReachUs
// "Internet"
// aadharOrPassportNo
// "123456789012"
// identityProofType
// "Aadhar Number"
// understanding
// true
// name
// "John Doe"
// paymentOption
// "Online"
// applicationReceivedOn
// 2024-12-17T18:13:54.362+00:00
// registrationFeesReceivedBy
// "Admin"
// transactionOrChequeNo
// "TXN123456"
// receiptNo
// "REC7890"
// registrationNo
// "REG12345"
// resultOfPreviousSchoolUrl
// "/Documents/ResultOfPreviousSchool/_con00001_pdf_1734459232241.pdf"
// tcCertificateUrl
// "/Documents/TcCertificate/_con00001_pdf_1734459229980.pdf"
// aadharOrPassportUrl
// "/Documents/AadharOrPassport/_con00001_pdf_1734459231294.pdf"
// castCertificateUrl
// "/Documents/CastCertificate/_con00001_pdf_1734459233372.pdf"
// signatureUrl
// "/Images/Signature/pixelcut_export_png_1734459229041.png"
// createdAt
// 2024-12-17T18:13:54.377+00:00
// updatedAt
// 2024-12-17T18:13:54.377+00:00
// __v
// 0

// Hide 14 fields

// System StatusAll Good
