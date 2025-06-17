import Blog from "../../../models/Blog/Blogs.js";

const getBlogsByCategoryAndZone = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { blogFor } = req.query;

        if (!categoryId || !blogFor) {
            return res.status(400).json({
                success: false,
                message: "categoryId and blogFor are required"
            });
        }

        const blogs = await Blog.find({
            categories: categoryId,
            blogFor: blogFor,
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
            message: error.message || "Failed to fetch blogs"
        });
    }
};

export default getBlogsByCategoryAndZone;