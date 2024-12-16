const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

const contractAttachmentDir = "./Images/contractAttachmentImages";

if (!fs.existsSync(contractAttachmentDir)) {
  fs.mkdirSync(contractAttachmentDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, contractAttachmentDir);
    },
    filename: async (req, file, cb) => {
      try {
        const userId = req.user.id;

        let sanitizedUserName = "unknown_user";

        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            console.log(`User`, user);
            sanitizedUserName = `${user.firstName}_${user.lastName}`.replace(
              /[^a-zA-Z0-9]/g,
              "_"
            );
          }
        }

        cb(
          null,
          `${sanitizedUserName}_${Date.now()}${path.extname(file.originalname)}`
        );
      } catch (error) {
        console.error("Error fetching user information:", error);
        cb(new Error("Failed to generate filename"));
      }
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const mimeType = allowedFileTypes.test(file.mimetype);
    const extName = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimeType && extName) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG, or PNG files are allowed"));
    }
  },
});

module.exports = upload;
