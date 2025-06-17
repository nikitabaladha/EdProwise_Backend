import express from "express";
import roleBasedMiddleware from "../../middleware/index.js";
import { blogImageUpload } from "../../controllers/UploadFiles/BlogImage.js";
import {
  createCategory,
  getCategory,
  deleteCategory,
updateCategory,

createTags,
getTags,
deleteTags,
updateTags,

createBlog,
getBlog,
getBlogById,
updateBlog,
deleteBlog,

getStudentZoneBlogs, 
getEducatorZoneBlogs,
getBlogsByCategoryAndZone,
getBlogsByTagAndZone
} from "../../controllers/Blogs/index.js";

const router = express.Router();

router.post("/create-category", roleBasedMiddleware("Admin"), createCategory);
router.get("/get-category", roleBasedMiddleware("Admin"), getCategory);
router.put("/update-blog-category/:id", roleBasedMiddleware("Admin"), updateCategory);
router.delete("/delete-blog-category/:id", roleBasedMiddleware("Admin"), deleteCategory);

router.post("/create-tags", roleBasedMiddleware("Admin"), createTags);
router.get("/get-tags", roleBasedMiddleware("Admin"), getTags);
router.put("/update-blog-tags/:id", roleBasedMiddleware("Admin"), updateTags);
router.delete("/delete-blog-tags/:id", roleBasedMiddleware("Admin"), deleteTags);

router.post("/create-blog",blogImageUpload, roleBasedMiddleware("Admin"), createBlog);
router.get("/get-all-blogs", roleBasedMiddleware("Admin"), getBlog);
router.get("/get-blog/:id", getBlogById);
router.put("/update-blog/:id",blogImageUpload, roleBasedMiddleware("Admin"), updateBlog);
router.delete("/delete-blog/:id", roleBasedMiddleware("Admin"), deleteBlog);

router.get("/get-student-blogs", getStudentZoneBlogs);
router.get("/get-educator-blogs", getEducatorZoneBlogs);
router.get("/get-blogs-by-category/:categoryId", getBlogsByCategoryAndZone);
router.get("/get-blogs-by-tag/:tagId", getBlogsByTagAndZone);

export default router;
