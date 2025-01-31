import express from "express";
const router = express.Router();
import roleBasedMiddleware from "../../middleware/index.js";
import prepareQuoteImageUpload from "../../controllers/UploadFiles/PrepareQuoteProductFiles.js";
import { create } from "../../controllers/PrepareQuote/index.js";

const uploadFiles = (req, res, next) => {
  prepareQuoteImageUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ hasError: true, message: err.message });
    }
    next();
  });
};

router.post(
  "/prepare-quote",
  uploadFiles,
  roleBasedMiddleware("Seller"),
  create
);

export default router;

// import express from "express";
// const router = express.Router();
// import roleBasedMiddleware from "../../middleware/index.js";
// import prepareQuoteImageUpload from "../../controllers/UploadFiles/PrepareQuoteProductFiles.js";
// import { create } from "../../controllers/PrepareQuote/index.js";

// router.post(
//   "/prepare-quote",

//   (req, res, next) => {
//     console.log("Incoming Request Body:", req.body);
//     next();
//   },
//   prepareQuoteImageUpload,
//   roleBasedMiddleware("Seller"),
//   create
// );

// export default router;
