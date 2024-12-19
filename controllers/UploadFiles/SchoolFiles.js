import multer from "multer";
import path from "path";
import fs from "fs";

const schoolProfileDir = "./Images/SchoolProfile";
const schoolaffiliationCertificateDir =
  "./Documents/SchoolaffiliationCertificate";
const schoolPanFileDir = "./Documents/SchoolPanFile";

if (!fs.existsSync(schoolProfileDir)) {
  fs.mkdirSync(schoolProfileDir, { recursive: true });
}

if (!fs.existsSync(schoolaffiliationCertificateDir)) {
  fs.mkdirSync(schoolaffiliationCertificateDir, { recursive: true });
}

if (!fs.existsSync(schoolPanFileDir)) {
  fs.mkdirSync(schoolPanFileDir, { recursive: true });
}

const schoolFilesUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "profileImage") {
        cb(null, schoolProfileDir);
      } else if (file.fieldname === "affiliationCertificate") {
        cb(null, schoolaffiliationCertificateDir);
      } else if (file.fieldname === "panFile") {
        cb(null, schoolPanFileDir);
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
        cb(new Error("Failed to generate filename"));
      }
    },
  }),

  limits: { fileSize: 10 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      const allowedFileTypes = /jpeg|jpg|png/;

      const mimeType = allowedFileTypes.test(file.mimetype);

      const extName = allowedFileTypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (mimeType && extName) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only JPEG, JPG, or PNG files are allowed for Profile Image"
          )
        );
      }
    } else if (file.fieldname === "affiliationCertificate") {
      const allowedFileTypes = /application\/pdf/;

      const mimeType = allowedFileTypes.test(file.mimetype);

      if (mimeType) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only PDF files are allowed for School affiliation Certificate"
          )
        );
      }
    } else if (file.fieldname === "panFile") {
      const allowedFileTypes = /application\/pdf/;

      const mimeType = allowedFileTypes.test(file.mimetype);

      if (mimeType) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed for school pan file"));
      }
    } else {
      cb(new Error("Invalid file fieldname"));
    }
  },
});

export default schoolFilesUpload;
