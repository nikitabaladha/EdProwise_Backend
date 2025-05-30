import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import { giveFeedBackAndRatingByBuyer } from "../../controllers/ProcurementService/FeedBackAndRating/index.js";

router.put(
  "/feedback-for-order",
  roleBasedMiddleware("School"),
  giveFeedBackAndRatingByBuyer
);

export default router;
