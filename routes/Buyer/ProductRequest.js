import express from "express";
import Middleware from "../../middleware/index.js";
import upload from "../../controllers/UploadFiles/BuyerProductRequestFile.js";

import {
    createRequest,getAll,updateById,deleteById
} from "../../controllers/Buyer/ProductRequest/index.js";

const router = express.Router();

// Middleware to handle file uploads
const uploadFiles = (req, res, next) => {
  upload.fields([
    { name: "productImage", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "File upload failed", details: err.message });
    }
    next();
  });
};

router.post("/request", uploadFiles,Middleware, createRequest);
router.get("/request",Middleware, getAll);
router.put("/request/:id", uploadFiles,Middleware, updateById);
router.delete("/request/:id",Middleware,  deleteById);


export default router;