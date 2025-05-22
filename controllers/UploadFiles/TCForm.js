import multer from "multer";
import path from "path";
import fs from "fs";

const imageDir = "./Images/TCForm";

if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") {
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

  return cb(new Error("Only .jpg and .jpeg files are allowed"));
};

export const tcFileUpload = (req, res, next) => {
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 300 * 1024,
    },
  }).fields([{ name: "studentPhoto", maxCount: 1 }]);

  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          hasError: true,
          message: "studentPhoto image must be under 300KB",
        });
      }
      return res.status(400).json({
        hasError: true,
        message: err.message,
      });
    }

    try {
      if (req.files && req.files.studentPhoto) {
        const file = req.files.studentPhoto[0];
        if (file.size > 300 * 1024) {
          throw new Error("studentPhoto image must be under 300KB");
        }
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
