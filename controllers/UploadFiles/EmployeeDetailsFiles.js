import multer from 'multer';
import path from 'path';
import fs from 'fs';

const employeeFilesBaseDir = './Documents/EmployeeFiles';

if (!fs.existsSync(employeeFilesBaseDir)) {
  fs.mkdirSync(employeeFilesBaseDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, employeeFilesBaseDir);
  },
  filename: (req, file, cb) => {
    try {
      const userDetails = req.user || {};
      const schoolId = userDetails.schoolId || 'unknown';
      const employeeId = userDetails.userId || 'unknown';
      const sanitizedFilename = file.originalname
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .split('.')[0];
      const ext = path.extname(file.originalname);
      const uniqueSuffix = `${schoolId}_${employeeId}_${Date.now()}`;
      cb(null, `${sanitizedFilename}_${uniqueSuffix}${ext}`);
    } catch (error) {
      cb(new Error('Failed to generate filename'));
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, or PDF files are allowed'));
  }
};

export const employeeUpdateUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
}).any();
