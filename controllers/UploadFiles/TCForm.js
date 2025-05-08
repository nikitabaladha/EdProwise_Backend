import multer from 'multer';
import path from 'path';
import fs from 'fs';

const imageDir = './Images/TCForm';

if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
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

  return cb(new Error('Only .jpg and .jpeg files are allowed'));
};

export const tcFileUpload = multer({
  storage,
  limits: {
    fileSize: 300 * 1024, 
  },
  fileFilter,
}).fields([
  { name: 'studentPhoto', maxCount: 1 },
]);
