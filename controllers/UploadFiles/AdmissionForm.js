import multer from 'multer';
import path from 'path';
import fs from 'fs';

const imageDir = './Images/AdmissionForm';
const pdfDir = './Documents/AdmissionForm';


[imageDir, pdfDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
      cb(null, pdfDir);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      cb(null, imageDir);
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: (req, file, cb) => {
    const name = path.basename(file.originalname, path.extname(file.originalname));
    const timestamp = Date.now();
    cb(null, `${name}_${timestamp}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if ((ext === '.jpg' || ext === '.jpeg') && mime === 'image/jpeg') {
    return cb(null, true);
  }
  if (ext === '.pdf' && mime === 'application/pdf') {
    return cb(null, true);
  }

  return cb(new Error('Only .jpg, .jpeg, and .pdf files are allowed'));
};


export const admissionFileUpload = (req, res, next) => {
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024 
    }
  }).fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'aadharPassportFile', maxCount: 1 },
    { name: 'castCertificate', maxCount: 1 },
    { name: 'tcCertificate', maxCount: 1 },
    { name: 'previousSchoolResult', maxCount: 1 },
    { name: 'idCardFile', maxCount: 1 },
    { name: 'proofOfResidence', maxCount: 1 },
  ]);

  upload(req, res, (err) => {
    if (err) {
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        const isImage = err.field === 'studentPhoto';
        return res.status(400).json({
          hasError: true,
          message: isImage 
            ? 'studentPhoto image must be under 300KB' 
            : `${err.field} PDF must be under 2MB`
        });
      }
      return res.status(400).json({
        hasError: true,
        message: err.message
      });
    }

  
    try {
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          const ext = path.extname(file.originalname).toLowerCase();
          if ((ext === '.jpg' || ext === '.jpeg') && file.size > 300 * 1024) {
            throw new Error(`${file.fieldname} image must be under 300KB`);
          }
          if (ext === '.pdf' && file.size > 2 * 1024 * 1024) {
            throw new Error(`${file.fieldname} PDF must be under 2MB`);
          }
        });
      }
      next();
    } catch (error) {
      return res.status(400).json({
        hasError: true,
        message: error.message
      });
    }
  });
};