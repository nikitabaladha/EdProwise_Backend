import multer from "multer";
import path from "path";
import fs from "fs";

const imageDir = "./Images/Registration";
const documentDir = "./Documents/Registration";

[imageDir, documentDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const isImage = (ext === ".jpg" || ext === ".jpeg") && mime === "image/jpeg";
  const isPDF = ext === ".pdf" && mime === "application/pdf";

  if (isImage || isPDF) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg images and .pdf documents are allowed"));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ext === ".jpg" || ext === ".jpeg" ? imageDir : documentDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const originalName = path.basename(file.originalname, ext);
    cb(null, `${originalName}_${timestamp}${ext}`);
  },
});

const validateFileSize = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ((ext === ".jpg" || ext === ".jpeg") && file.size > 300 * 1024) {
    throw new Error(`${file.fieldname} image must be under 300KB`);
  }
  if (ext === ".pdf" && file.size > 2 * 1024 * 1024) {
    throw new Error(`${file.fieldname} PDF must be under 2MB`);
  }
};

export const studentFileUpload = (req, res, next) => {
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  }).fields([
    { name: "studentPhoto", maxCount: 1 },
    { name: "aadharPassportFile", maxCount: 1 },
    { name: "castCertificate", maxCount: 1 },
    { name: "tcCertificate", maxCount: 1 },
    { name: "previousSchoolResult", maxCount: 1 },
  ]);

  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          hasError: true,
          message:
            err.field === "studentPhoto"
              ? "studentPhoto image must be under 300KB"
              : `${err.field} must be under 2MB`,
        });
      }
      return res.status(400).json({
        hasError: true,
        message: err.message,
      });
    }

    try {
      if (req.files) {
        Object.values(req.files)
          .flat()
          .forEach((file) => {
            validateFileSize(file);
          });
      }
      next();
    } catch (error) {
      return res.status(400).json({
        hasError: true,
        message: error.message,
      });
    }
  });
};
