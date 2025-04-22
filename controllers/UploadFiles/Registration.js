import multer from 'multer';
import path from 'path';
import fs from 'fs';


const imageDir = './Images/Registration';
const documentDir = './Documents/Registration';


[imageDir, documentDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;


    if (ext === '.pdf' && mime === 'application/pdf') {
      cb(null, documentDir);
    } else {
  
      cb(null, imageDir);
    }
  },
  filename: (req, file, cb) => {
    const name = path.basename(file.originalname, path.extname(file.originalname));
    const timestamp = Date.now();
    cb(null, `${name}_${timestamp}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (file.fieldname === 'studentPhoto') {
    if ((ext === '.jpg' || ext === '.jpeg') && mime === 'image/jpeg') {
      if (file.size > 300 * 1024) {
        return cb(new Error('Student photo must be under 300KB'));
      }
      return cb(null, true);
    }
    return cb(new Error('Only .jpg or .jpeg images are allowed for student photo'));
  }

  if (ext === '.pdf' && mime === 'application/pdf') {
    return cb(null, true);
  }

  if ((ext === '.jpg' || ext === '.jpeg') && mime === 'image/jpeg') {
    return cb(null, true);
  }

  return cb(new Error('Only .jpg, .jpeg (and .pdf for non-photo fields) files are allowed'));
};


export const studentFileUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter
}).fields([
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'aadharPassportFile', maxCount: 1 },
  { name: 'castCertificate', maxCount: 1 },
  { name: 'tcCertificate', maxCount: 1 },
  { name: 'previousSchoolResult', maxCount: 1 },
]);
