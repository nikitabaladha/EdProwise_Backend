import multer from "multer";

import path from "path";

import fs from "fs";
 
const signatureDir = "./Images/Signature";

const resultOfPreviousSchoolDir = "./Documents/ResultOfPreviousSchool";

const tcCertificateDir = "./Documents/TcCertificate";

const aadharOrPassportDir = "./Documents/AadharOrPassport";

const castCertificateDir = "./Documents/CastCertificate";
 
if (!fs.existsSync(signatureDir)) {

  fs.mkdirSync(signatureDir, { recursive: true });

}

if (!fs.existsSync(resultOfPreviousSchoolDir)) {

  fs.mkdirSync(resultOfPreviousSchoolDir, { recursive: true });

}

if (!fs.existsSync(tcCertificateDir)) {

  fs.mkdirSync(tcCertificateDir, { recursive: true });

}
 
if (!fs.existsSync(aadharOrPassportDir)) {

  fs.mkdirSync(aadharOrPassportDir, { recursive: true });

}
 
if (!fs.existsSync(castCertificateDir)) {

  fs.mkdirSync(castCertificateDir, { recursive: true });

}
 
const upload = multer({

  storage: multer.diskStorage({

    destination: (req, file, cb) => {

      if (file.fieldname === "signatureUrl") {

        cb(null, signatureDir);

      } else if (file.fieldname === "resultOfPreviousSchoolUrl") {

        cb(null, resultOfPreviousSchoolDir);

      } else if (file.fieldname === "tcCertificateUrl") {

        cb(null, tcCertificateDir);

      } else if (file.fieldname === "aadharOrPassportUrl") {

        cb(null, aadharOrPassportDir);

      } else if (file.fieldname === "castCertificateUrl") {

        cb(null, castCertificateDir);

      } else {

        cb(new Error("Invalid file fieldname"));

      }

    },

    filename: (req, file, cb) => {

      try {

        const sanitizedFilename = file.originalname

          .toLowerCase()

          .replace(/[^a-z0-9]/g, "_")

          .split(".")[0];

        cb(

          null,

          `${sanitizedFilename}_${Date.now()}${path.extname(file.originalname)}`

        );

      } catch (error) {

        console.error("Error generating filename:", error);

        cb(new Error("Failed to generate filename"));

      }

    },

  }),
 
  limits: { fileSize: 10 * 1024 * 1024 },
 
  fileFilter: (req, file, cb) => {

    if (file.fieldname === "signatureUrl") {

      const allowedFileTypes = /jpeg|jpg|png/;

      const mimeType = allowedFileTypes.test(file.mimetype);

      const extName = allowedFileTypes.test(

        path.extname(file.originalname).toLowerCase()

      );

      if (mimeType && extName) {

        cb(null, true);

      } else {

        cb(new Error("Only JPEG, JPG, or PNG files are allowed for Signature"));

      }

    } else if (file.fieldname === "resultOfPreviousSchoolUrl") {

      const allowedFileTypes = /application\/pdf/;

      const mimeType = allowedFileTypes.test(file.mimetype);
 
      if (mimeType) {

        cb(null, true);

      } else {

        cb(

          new Error(

            "Only PDF files are allowed for Previous School Result certificates"

          )

        );

      }

    } else if (file.fieldname === "tcCertificateUrl") {

      const allowedFileTypes =

        /application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/;

      const mimeType = allowedFileTypes.test(file.mimetype);
 
      if (mimeType) {

        cb(null, true);

      } else {

        cb(

          new Error(

            "Only PDF, DOC, or DOCX files are allowed for TC CertificateUrl"

          )

        );

      }

    } else if (file.fieldname === "aadharOrPassportUrl") {

      const allowedFileTypes =

        /application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/;

      const mimeType = allowedFileTypes.test(file.mimetype);
 
      if (mimeType) {

        cb(null, true);

      } else {

        cb(

          new Error(

            "Only PDF, DOC, or DOCX files are allowed for Aadhar Or Passport"

          )

        );

      }

    } else if (file.fieldname === "castCertificateUrl") {

      const allowedFileTypes =

        /application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/;

      const mimeType = allowedFileTypes.test(file.mimetype);
 
      if (mimeType) {

        cb(null, true);

      } else {

        cb(

          new Error(

            "Only PDF, DOC, or DOCX files are allowed for Aadhar Or Passport"

          )

        );

      }

    } else {

      cb(new Error("Invalid file fieldname"));

    }

  },

});
 
export default upload;
 