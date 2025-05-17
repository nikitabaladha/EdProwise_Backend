import multer from "multer";
import path from "path";
import fs from "fs";

const edprowiseProfileDir = "./Images/EdprowiseProfile";

if (!fs.existsSync(edprowiseProfileDir)) {
  fs.mkdirSync(edprowiseProfileDir, { recursive: true });
}

const edprowiseProfileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, edprowiseProfileDir);
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

  limits: { fileSize: 3 * 100 * 1024 },

  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const mimeType = allowedFileTypes.test(file.mimetype);
    const extName = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimeType && extName) {
      cb(null, true);
    } else {
      cb(
        new Error("Only JPEG, JPG, or PNG files are allowed for Profile Image")
      );
    }
  },
});

// Custom middleware to handle errors with proper messages
export default (req, res, next) => {
  edprowiseProfileUpload.single("edprowiseProfile")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          hasError: true,
          message: "Edprowise profile must be less than 300 MB",
        });
      }
      return res.status(400).json({
        hasError: true,
        message: err.message,
      });
    }
    next();
  });
};
