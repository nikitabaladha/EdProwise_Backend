import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";



import {
    createOrUpdateEaseBuzz,
    getEaseBuzzBySchoolId



} from "../../controllers/EasebuzzData/index.js";


const router = express.Router();


router.post(
    "/create-update-easebuzz-data",
    roleBasedMiddleware("Admin", "School"),
    createOrUpdateEaseBuzz
);

router.get(
    "/get-easebuzz-data/:schoolId",
    roleBasedMiddleware("Admin", "School"),
    getEaseBuzzBySchoolId);


export default router;
