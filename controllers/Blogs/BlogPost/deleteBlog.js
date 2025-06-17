import Blog from "../../../models/Blog/Blogs.js";
import fs from "fs";
import path from "path";

const blogImageDir = "./Images/Blogs";

const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        // Delete associated image if exists
        if (blog.featuredImage) {
            const imagePath = path.join(blogImageDir, path.basename(blog.featuredImage));

            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log("Deleted blog image:", imagePath);
                } catch (err) {
                    console.warn("Failed to delete image:", err.message);
                }
            } else {
                console.log(" Image not found on disk:", imagePath);
            }
        }

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
    } catch (error) {
        console.error(" Error deleting blog:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete blog"
        });
    }
};

export default deleteBlog;
