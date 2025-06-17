import Blog from "../../../models/Blog/Blogs.js";

const getEducatorZoneBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({
            blogFor: "Educator Zone",
            status: true
        })
            .populate("categories", "categoryName")
            .populate("tags", "tagName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch Educator Zone blogs"
        });
    }
};
export default getEducatorZoneBlogs