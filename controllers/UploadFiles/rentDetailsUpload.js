import multer from "multer";
import path from "path";
import fs from "fs";

const rentDetailsDir = "./Documents/RentDetailsReceipts";

if (!fs.existsSync(rentDetailsDir)) {
  fs.mkdirSync(rentDetailsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, rentDetailsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fieldIndex = file.fieldname.match(/\[(\d+)\]/)?.[1] || 'unknown';
    const filename = `Rent_${req.params.employeeId}_${fieldIndex}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Only JPEG, PNG, or PDF are allowed.`), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter
}).any();

const rentDetailsUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      let message = 'File upload failed';
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = `File size exceeds 2MB limit for ${err.field}`;
      } else if (err.message.includes('Invalid file type')) {
        message = err.message;
      } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = `Unexpected file field received: ${err.field}`;
      } else {
        message = err.message || 'Unknown file upload error';
      }

      console.error('Multer Error:', message, err);
      return res.status(400).json({
        success: false,
        message
      });
    }

    console.log('Multer req.files:', req.files);
    console.log('Multer req.body:', req.body);
    next();
  });
};

export default rentDetailsUpload;