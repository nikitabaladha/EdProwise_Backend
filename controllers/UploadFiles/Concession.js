import multer from 'multer';
import path from 'path';
import fs from 'fs';

const imageDir = './Images/Concession';
const documentDir = './Documents/Concession';

[imageDir, documentDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
      cb(null, documentDir);
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

  if (file.fieldname === 'studentPhoto') {
    if ((ext === '.jpg' || ext === '.jpeg') && mime === 'image/jpeg') {
      if (file.size > 300 * 1024) return cb(new Error('studentPhoto must be under 300KB'));
      return cb(null, true);
    }
    return cb(new Error('Only JPEG/JPG files are allowed for studentPhoto'));
  }

  if (file.fieldname === 'castOrIncomeCertificate') {
    if ((ext === '.jpg' || ext === '.jpeg') && mime === 'image/jpeg') {
      if (file.size > 300 * 1024) return cb(new Error('castOrIncomeCertificate image must be under 300KB'));
      return cb(null, true);
    }
    if (ext === '.pdf' && mime === 'application/pdf') {
      if (file.size > 2 * 1024 * 1024) return cb(new Error('castOrIncomeCertificate PDF must be under 2MB'));
      return cb(null, true);
    }
    return cb(new Error('Only JPEG/JPG and PDF files are allowed for castOrIncomeCertificate'));
  }

  return cb(new Error('Invalid field name'));
};

export const concessionFileUpload = (req, res, next) => {
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } 
  }).fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'castOrIncomeCertificate', maxCount: 1 }
  ]);

  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        const isImage = err.field === 'studentPhoto';
        return res.status(400).json({
          hasError: true,
          message: isImage 
            ? 'studentPhoto must be under 300KB' 
            : 'castOrIncomeCertificate must be under 2MB for Pdf or 300kb for image'
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