import multer from "multer";
import path from "path";
import fs from "fs";

const homeworkFileDir = "./Documents/HomeworkFiles";

if (!fs.existsSync(homeworkFileDir)) {
  fs.mkdirSync(homeworkFileDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, homeworkFileDir);
  },
  filename: (req, file, cb) => {
    try {
      const {
        subjectName,
        className,
        sectionName,
        academicYear,
        homeworkDate,
      } = req.body;

      // sanitize to remove special chars
      const sanitize = (str) =>
        str ? str.replace(/[^a-zA-Z0-9-_]/g, "") : "unknown";

      const safeSubject = sanitize(subjectName);
      const safeClass = sanitize(className);
      const safeSection = sanitize(sectionName);
      const safeYear = sanitize(academicYear);

      // format homeworkDate
      let formattedDate = "unknown-date";
      if (homeworkDate) {
        const d = new Date(homeworkDate);
        formattedDate = d.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      const originalName = path.basename(file.originalname);

      const newFilename = `${safeSubject}-${safeClass}-${safeSection}-${safeYear}-${formattedDate}-${originalName}`;

      cb(null, newFilename);
    } catch (error) {
      cb(new Error("Failed to generate filename"));
    }
  },
});

// Allow any file type, still enforce size limit
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const homeworkFileUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
}).any(); // frontend should send each file as "file"

export default homeworkFileUpload;


