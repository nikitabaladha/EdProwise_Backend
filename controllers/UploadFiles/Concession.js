import multer from 'multer';
import path from 'path';
import fs from 'fs';

const imageDir = './Images/Concession';
const documentDir = './Documents/Concession';


if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
if (!fs.existsSync(documentDir)) fs.mkdirSync(documentDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if ((ext === '.jpg' || ext === '.jpeg') && mime === 'image/jpeg') {
      cb(null, imageDir);
    } else if (ext === '.pdf' && mime === 'application/pdf') {
      cb(null, documentDir);
    } else {
      cb(new Error('Unsupported file type'), '');
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
    if (file.size > 300 * 1024) return cb(new Error('JPEG/JPG must be under 300KB'));
    return cb(null, true);
  }

  if (ext === '.pdf' && mime === 'application/pdf') {
    return cb(null, true);
  }

  return cb(new Error('Only .jpg, .jpeg, and .pdf files are allowed'));
};

export const concessionFileUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter,
}).fields([
  { name: 'castOrIncomeCertificate', maxCount: 1 },
]);
