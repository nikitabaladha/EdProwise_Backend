import multer from "multer";
import path from "path";
import fs from "fs";

const noticeFileDir = "./Documents/StudentNoticeFiles";

if (!fs.existsSync(noticeFileDir)) {
  fs.mkdirSync(noticeFileDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, noticeFileDir);
  },
  filename: (req, file, cb) => {
    try {
      const { subject, academicYear, noticeDate } = req.body;

      // sanitize to remove special chars
      const sanitize = (str) =>
        str ? str.replace(/[^a-zA-Z0-9-_]/g, "") : "unknown";

      const safeSubject = sanitize(subject);
      const safeYear = sanitize(academicYear);

      // format date
      let formattedDate = "unknown-date";
      if (noticeDate) {
        const d = new Date(noticeDate);
        formattedDate = d.toISOString().split("T")[0]; 
      }

      const originalName = path.basename(file.originalname);

      const newFilename = `${safeSubject}-${formattedDate}-${safeYear}-${originalName}`;

      cb(null, newFilename);
    } catch (error) {
      cb(new Error("Failed to generate filename"));
    }
  },
});

const studentNoticeUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => cb(null, true), // allow all file types
}).single("file"); // frontend should send file as "file"

export default studentNoticeUpload;
