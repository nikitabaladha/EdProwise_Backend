import express from "express";
const router = express.Router();
import { create ,getAllRequests,deleteRequest} from "../../controllers/RequestForDemo/index.js";

// Route to submit a demo request
router.post("/request-demo", create);

router.get("/get-request-demo",getAllRequests);

router.delete("/delete-request/:id",deleteRequest)

export default router;