import express from "express";
const router = express.Router();
import { create, get,deleteContactForm} from "../../controllers/ContactUsForm/index.js";

// Route to submit a demo request
router.post("/contactus", create);

router.get("/get-contactus",get);

router.delete("/delete-contact-form/:id",deleteContactForm);

export default router;