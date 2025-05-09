import multer from "multer";
import path from "path";
import fs from "fs";

const imageDir = "./Images/AdmissionForm";
const pdfDir = "./Documents/AdmissionForm";

[imageDir, pdfDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf") {
      cb(null, pdfDir);
    } else if (ext === ".jpg" || ext === ".jpeg") {
      cb(null, imageDir);
    } else {
      cb(new Error("Invalid file type"), null);
    }
  },
  filename: (req, file, cb) => {
    const name = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    const timestamp = Date.now();
    cb(null, `${name}_${timestamp}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if ((ext === ".jpg" || ext === ".jpeg") && mime === "image/jpeg") {
    return cb(null, true);
  }
  if (ext === ".pdf" && mime === "application/pdf") {
    return cb(null, true);
  }

  return cb(new Error("Only .jpg, .jpeg, and .pdf files are allowed"));
};

export const admissionFileUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter,
}).fields([
  { name: "studentPhoto", maxCount: 1 },
  { name: "aadharPassportFile", maxCount: 1 },
  { name: "castCertificate", maxCount: 1 },
  { name: "tcCertificate", maxCount: 1 },
  { name: "previousSchoolResult", maxCount: 1 },
  { name: "idCardFile", maxCount: 1 },
  { name: "proofOfResidence", maxCount: 1 },
]);
