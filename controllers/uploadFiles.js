const multer = require("multer");
const path = require("path");
const fs = require("fs");
const employeePhotoDir = "./Images/employeePhoto";
const employeeCertificateDir = "./Documents/employeeCertificates";
const employeeResumeDir = "./Documents/employeeResume";

if (!fs.existsSync(employeePhotoDir)) {
  fs.mkdirSync(employeePhotoDir, { recursive: true });
}
if (!fs.existsSync(employeeCertificateDir)) {
  fs.mkdirSync(employeeCertificateDir, { recursive: true });
}
if (!fs.existsSync(employeeResumeDir)) {
  fs.mkdirSync(employeeResumeDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "employeePhotoUrl") {
        cb(null, employeePhotoDir);
      } else if (file.fieldname === "employeeCertificateUrl") {
        cb(null, employeeCertificateDir);
      } else if (file.fieldname === "employeeResumeUrl") {
        cb(null, employeeResumeDir);
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
    if (file.fieldname === "employeePhotoUrl") {
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
            "Only JPEG, JPG, or PNG files are allowed for employee photos"
          )
        );
      }
    } else if (file.fieldname === "employeeCertificateUrl") {
      const allowedFileTypes = /application\/pdf/;
      const mimeType = allowedFileTypes.test(file.mimetype);

      console.log("PDF upload - MIME Type:", file.mimetype);

      if (mimeType) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed for employee certificates"));
      }
    } else if (file.fieldname === "employeeResumeUrl") {
      const allowedFileTypes =
        /application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/;
      const mimeType = allowedFileTypes.test(file.mimetype);

      console.log("Resume upload - MIME Type:", file.mimetype);

      if (mimeType) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only PDF, DOC, or DOCX files are allowed for employee resumes"
          )
        );
      }
    } else {
      cb(new Error("Invalid file fieldname"));
    }
  },
});

module.exports = upload;
