// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "Images/GroupImages");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) cb(null, true);
//   else cb(new Error("Only images allowed"), false);
// };

// export const uploadGroupImage = multer({ storage, fileFilter });

// middlewares/groupImageUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const groupImageDir = "./Images/GroupImages";

// Create folder if it does not exist
if (!fs.existsSync(groupImageDir)) {
  fs.mkdirSync(groupImageDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, groupImageDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    cb(null, `${name}_${timestamp}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (
    (ext === ".jpg" || ext === ".jpeg" || ext === ".png") &&
    mime.startsWith("image/")
  ) {
    return cb(null, true);
  }
  cb(new Error("Only JPG, JPEG, or PNG images are allowed for group image"));
};

// Limit file size (optional: 2 MB)
const groupImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("groupImage"); 

export default groupImageUpload;
