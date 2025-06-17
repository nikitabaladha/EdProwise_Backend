import Blog from "../../../models/Blog/Blogs.js";
import fs from "fs";
import path from "path";

// Define the blog images directory
const blogImageDir = "./Images/Blogs";
const blogImageBasePath = "/Images/Blogs"; // Base path to store in DB

// Ensure directory exists
if (!fs.existsSync(blogImageDir)) {
    fs.mkdirSync(blogImageDir, { recursive: true });
}

// Create a new blog
const createBlog = async (req, res) => {

    try {
        // Check for existing blog with same title or slug
        const existingBlog = await Blog.findOne({
            $or: [
                { blogSlug: req.body.blogSlug }
            ]
        });

        if (existingBlog) {
            // Delete uploaded file if it exists
            if (req.file) {
                console.log("req.file", req.file);

                const filePath = path.join(blogImageDir, req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(400).json({
                success: false,
                message: "Blog with this title or slug already exists"
            });
        }

        const imagePath = path.join(blogImageBasePath, req.file.filename);

        const {
            blogFor,
            scheduledDate,
            authorName,
            blogTitle,
            blogSlug,
            content,
            excerpt,
            categories,
            tags,
            status
        } = req.body;

        // Parse categories and tags from JSON strings
        const parsedCategories = JSON.parse(categories || '[]');
        const parsedTags = JSON.parse(tags || '[]');

        // Create new blog
        const newBlog = new Blog({
            blogFor,
            scheduledDate: new Date(scheduledDate),
            authorName,
            featuredImage: imagePath, // Store full path
            blogTitle,
            blogSlug,
            content,
            excerpt,
            categories: parsedCategories,
            tags: parsedTags,
            status: status === 'true'
        });

        await newBlog.save();

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: newBlog
        });
    } catch (error) {
        // Delete uploaded file if there was an error
        if (req.file) {
            const filePath = path.join(blogImageDir, req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Handle duplicate key error (unique constraint violation)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Blog with this title or slug already exists"
            });
        }

        res.status(400).json({
            success: false,
            message: error.message || "Failed to create blog"
        });
    }
};

export default createBlog;