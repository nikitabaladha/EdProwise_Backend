import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";

import {createAndUpdateOrderPlace,
    createAndUpdateOrderReceive,
    getOrderPlaceTemplate,
    getOrderReceiveTemplate}  from "../../controllers/EmailTemplates/OrderPlaceOrReceiveTemplate/index.js"

const router = express.Router();

router.get("/get-order-place-templates",getOrderPlaceTemplate );
router.post("/post-order-place-templates", createAndUpdateOrderPlace);
router.get("/get-order-receive-templates",getOrderReceiveTemplate );
router.post("/post-order-receive-templates", createAndUpdateOrderReceive);


export default router;