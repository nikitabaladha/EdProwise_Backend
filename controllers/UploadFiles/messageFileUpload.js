import multer from "multer";
import path from "path";
import fs from "fs";

const messageFileDir = "./Documents/MessageFiles";

// Ensure folder exists
if (!fs.existsSync(messageFileDir)) {
  fs.mkdirSync(messageFileDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, messageFileDir);
  },
  filename: (req, file, cb) => {
    try {
      const { conversationId, senderId } = req.body;

      // Sanitize to avoid special characters
      const sanitize = (str) =>
        str ? str.replace(/[^a-zA-Z0-9-_]/g, "") : "unknown";

      const safeConversation = sanitize(conversationId);
      const safeSender = sanitize(senderId);

      // Use timestamp to avoid collisions
      const timestamp = Date.now();

      // Preserve original extension
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);

      const newFilename = `${safeConversation}-${safeSender}-${timestamp}-${baseName}${ext}`;

      cb(null, newFilename);
    } catch (error) {
      console.error("Error generating filename:", error);
      cb(new Error("Failed to generate filename"));
    }
  },
});

// File filter: Allow only images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"));
  }
};

// Multer middleware
const messageFileUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB per file
  fileFilter,
}).single("messageFile"); // expect frontend to send field name "messageFile"

export default messageFileUpload;
