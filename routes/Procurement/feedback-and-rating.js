import express from "express";
const router = express.Router();

import roleBasedMiddleware from "../../middleware/index.js";

import { giveFeedBackAndRatingByBuyer } from "../../controllers/FeedBackAndRating/index.js";

router.put(
  "/feedback-for-order",
  roleBasedMiddleware("School"),
  giveFeedBackAndRatingByBuyer
);

export default router;
