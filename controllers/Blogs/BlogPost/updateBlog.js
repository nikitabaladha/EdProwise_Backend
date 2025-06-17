import Blog from "../../../models/Blog/Blogs.js";
import fs from "fs";
import path from "path";
import { blogImageUpload } from "../../UploadFiles/BlogImage.js";
import { log } from "console";

const blogImageDir = "./Images/Blogs";
const blogImageBasePath = "/Images/Blogs";

const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Blog id", id);
        console.log("🔥 Received Update Request for Blog ID:", id);

        // Log all FormData fields
        console.log("📦 req.body contents:");
        for (const key in req.body) {
            console.log(`→ ${key}:`, req.body[key]);
        }

        // Log uploaded file info if available
        if (req.file) {
            console.log("🖼️ Uploaded File Info:");
            console.log("→ fieldname:", req.file.fieldname);
            console.log("→ originalname:", req.file.originalname);
            console.log("→ filename:", req.file.filename);
            console.log("→ mimetype:", req.file.mimetype);
            console.log("→ size:", req.file.size);
            console.log("→ path:", req.file.path);
        } else {
            console.log("ℹ️ No file uploaded");
        }
        
        // Check if blog exists
        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // Validate and parse the date
        let scheduledDate;
        try {
            scheduledDate = req.body.scheduledDate 
                ? new Date(req.body.scheduledDate)
                : existingBlog.scheduledDate;
            
            if (isNaN(scheduledDate.getTime())) {
                throw new Error("Invalid date format");
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format for scheduledDate"
            });
        }

        // Check for duplicate slug
        const duplicateBlog = await Blog.findOne({
            blogSlug: req.body.blogSlug,
            _id: { $ne: id }
        });

        if (duplicateBlog) {
            return res.status(400).json({
                success: false,
                message: "Blog with this slug already exists"
            });
        }
      console.log(duplicateBlog);
      
        let imagePath = existingBlog.featuredImage;
        console.log("old image path",imagePath);
        
        // Handle new file upload if present
        console.log("file is presend or not",req.file);
        
        if (req.file) {
            // Delete old image if exists
            if (existingBlog.featuredImage) {
                console.log( "existingBlog.featuredImage",path.basename(existingBlog.featuredImage));
                
                const oldImagePath = path.join(blogImageDir, path.basename(existingBlog.featuredImage));
                console.log("old Image Path2", oldImagePath);
                
                console.log("fs.existsSync(oldImagePath)",fs.existsSync(oldImagePath));
                
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log("✅ Old image deleted:", oldImagePath);
                } else {
            console.log("⚠️ Old image not found:", oldImagePath);
        }
            }
            // Upload new image
         imagePath = path.join(blogImageBasePath, req.file.filename);
    console.log("🆕 New image path:", imagePath);
        }
        console.log("end of req.file");
        
        // Parse categories and tags
        const parsedCategories = JSON.parse(req.body.categories || '[]');
        const parsedTags = JSON.parse(req.body.tags || '[]');


        // Update blog
        const updatedBlog = await Blog.findByIdAndUpdate(id, {
            blogFor: req.body.blogFor,
            scheduledDate: req.body.scheduledDate,
            authorName: req.body.authorName,
            featuredImage: imagePath,
            blogTitle: req.body.blogTitle,
            blogSlug: req.body.blogSlug,
            content: req.body.content,
            excerpt: req.body.excerpt,
            categories: parsedCategories,
            tags: parsedTags,
            status: req.body.status === 'true'
        }, { new: true });

        console.log("Update data ", updatedBlog);
        
        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: updatedBlog
        });
    } catch (error) {
        // Delete uploaded file if error occurred
        if (req.file) {
            const filePath = path.join(blogImageDir, req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        res.status(400).json({
            success: false,
            message: error.message || "Failed to update blog"
        });
    }
};

export default updateBlog;