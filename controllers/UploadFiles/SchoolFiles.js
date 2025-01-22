import multer from "multer";
import path from "path";
import fs from "fs";

const schoolProfileDir = "./Images/SchoolProfile";
const schoolAffiliationCertificateDir =
  "./Documents/SchoolAffiliationCertificate";
const schoolPanFileDir = "./Documents/SchoolPanFile";
const schoolAffiliationImageDir = "./Images/SchoolAffiliationCertificate";
const schoolPanImageDir = "./Images/SchoolPanFile";

if (!fs.existsSync(schoolProfileDir)) {
  fs.mkdirSync(schoolProfileDir, { recursive: true });
}

if (!fs.existsSync(schoolAffiliationCertificateDir)) {
  fs.mkdirSync(schoolAffiliationCertificateDir, { recursive: true });
}

if (!fs.existsSync(schoolPanFileDir)) {
  fs.mkdirSync(schoolPanFileDir, { recursive: true });
}

if (!fs.existsSync(schoolAffiliationImageDir)) {
  fs.mkdirSync(schoolAffiliationImageDir, { recursive: true });
}

if (!fs.existsSync(schoolPanImageDir)) {
  fs.mkdirSync(schoolPanImageDir, { recursive: true });
}

const schoolFilesUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "profileImage") {
        cb(null, schoolProfileDir);
      } else if (file.fieldname === "affiliationCertificate") {
        // Check if the file is an image or a PDF
        if (file.mimetype.startsWith("image/")) {
          cb(null, schoolAffiliationImageDir);
        } else if (file.mimetype === "application/pdf") {
          cb(null, schoolAffiliationCertificateDir);
        } else {
          cb(new Error("Invalid file type for affiliation certificate"));
        }
      } else if (file.fieldname === "panFile") {
        // Check if the file is an image or a PDF
        if (file.mimetype.startsWith("image/")) {
          cb(null, schoolPanImageDir);
        } else if (file.mimetype === "application/pdf") {
          cb(null, schoolPanFileDir);
        } else {
          cb(new Error("Invalid file type for PAN file"));
        }
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

  limits: { fileSize: 2 * 1024 * 1024 },

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
      const allowedImageTypes = /jpeg|jpg|png/;
      const allowedPdfType = /application\/pdf/;

      if (
        allowedImageTypes.test(file.mimetype) ||
        allowedPdfType.test(file.mimetype)
      ) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only JPEG, JPG, PNG, or PDF files are allowed for School Affiliation Certificate"
          )
        );
      }
    } else if (file.fieldname === "panFile") {
      const allowedImageTypes = /jpeg|jpg|png/;
      const allowedPdfType = /application\/pdf/;

      if (
        allowedImageTypes.test(file.mimetype) ||
        allowedPdfType.test(file.mimetype)
      ) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Only JPEG, JPG, PNG, or PDF files are allowed for School PAN file"
          )
        );
      }
    } else {
      cb(new Error("Invalid file fieldname"));
    }
  },
});

export default schoolFilesUpload;

// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const schoolProfileDir = "./Images/SchoolProfile";
// const schoolAffiliationCertificateDir =
//   "./Documents/SchoolAffiliationCertificate";
// const schoolPanFileDir = "./Documents/SchoolPanFile";
// const schoolAffiliationImageDir = "./Images/SchoolAffiliationCertificate";
// const schoolPanImageDir = "./Images/SchoolPanFile";

// if (!fs.existsSync(schoolProfileDir)) {
//   fs.mkdirSync(schoolProfileDir, { recursive: true });
// }

// if (!fs.existsSync(schoolAffiliationCertificateDir)) {
//   fs.mkdirSync(schoolAffiliationCertificateDir, { recursive: true });
// }

// if (!fs.existsSync(schoolPanFileDir)) {
//   fs.mkdirSync(schoolPanFileDir, { recursive: true });
// }

// if (!fs.existsSync(schoolAffiliationImageDir)) {
//   fs.mkdirSync(schoolAffiliationImageDir, { recursive: true });
// }

// if (!fs.existsSync(schoolPanImageDir)) {
//   fs.mkdirSync(schoolPanImageDir, { recursive: true });
// }

// const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
// const MAX_PDF_SIZE = 3 * 1024 * 1024; // 3 MB

// const schoolFilesUpload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       if (file.fieldname === "profileImage") {
//         cb(null, schoolProfileDir);
//       } else if (file.fieldname === "affiliationCertificate") {
//         if (file.mimetype.startsWith("image/")) {
//           cb(null, schoolAffiliationImageDir);
//         } else if (file.mimetype === "application/pdf") {
//           cb(null, schoolAffiliationCertificateDir);
//         } else {
//           cb(new Error("Invalid file type for affiliation certificate"));
//         }
//       } else if (file.fieldname === "panFile") {
//         if (file.mimetype.startsWith("image/")) {
//           cb(null, schoolPanImageDir);
//         } else if (file.mimetype === "application/pdf") {
//           cb(null, schoolPanFileDir);
//         } else {
//           cb(new Error("Invalid file type for PAN file"));
//         }
//       } else {
//         cb(new Error("Invalid file fieldname"));
//       }
//     },

//     filename: (req, file, cb) => {
//       try {
//         const sanitizedFilename = file.originalname
//           .toLowerCase()
//           .replace(/[^a-z0-9]/g, "_")
//           .split(".")[0];
//         cb(
//           null,
//           `${sanitizedFilename}_${Date.now()}${path.extname(file.originalname)}`
//         );
//       } catch (error) {
//         cb(new Error("Failed to generate filename"));
//       }
//     },
//   }),

//   fileFilter: (req, file, cb) => {
//     const isImage = file.mimetype.startsWith("image/");
//     const isPDF = file.mimetype === "application/pdf";

//     if (file.fieldname === "profileImage") {
//       const allowedFileTypes = /jpeg|jpg|png/;
//       const mimeType = allowedFileTypes.test(file.mimetype);
//       const extName = allowedFileTypes.test(
//         path.extname(file.originalname).toLowerCase()
//       );

//       if (mimeType && extName && file.size <= MAX_IMAGE_SIZE) {
//         cb(null, true);
//       } else if (file.size > MAX_IMAGE_SIZE) {
//         cb(new Error("Profile image size must not exceed 2 MB"));
//       } else {
//         cb(
//           new Error(
//             "Only JPEG, JPG, or PNG files are allowed for Profile Image"
//           )
//         );
//       }
//     } else if (
//       file.fieldname === "affiliationCertificate" ||
//       file.fieldname === "panFile"
//     ) {
//       if (isImage && file.size <= MAX_IMAGE_SIZE) {
//         cb(null, true);
//       } else if (isPDF && file.size <= MAX_PDF_SIZE) {
//         cb(null, true);
//       } else if (isImage && file.size > MAX_IMAGE_SIZE) {
//         cb(new Error("Image file size must not exceed 2 MB"));
//       } else if (isPDF && file.size > MAX_PDF_SIZE) {
//         cb(new Error("PDF file size must not exceed 3 MB"));
//       } else {
//         cb(
//           new Error(
//             "Only JPEG, JPG, PNG, or PDF files are allowed for this field"
//           )
//         );
//       }
//     } else {
//       cb(new Error("Invalid file fieldname"));
//     }
//   },
// });

// export default schoolFilesUpload;
