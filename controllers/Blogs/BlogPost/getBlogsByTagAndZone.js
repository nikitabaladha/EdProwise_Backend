import Blog from "../../../models/Blog/Blogs.js";

const getBlogsByTagAndZone = async (req, res) => {
    try {
        const { tagId } = req.params;
        const { blogFor } = req.query;

        if (!tagId || !blogFor) {
            return res.status(400).json({
                success: false,
                message: "tagId and blogFor are required"
            });
        }

        const blogs = await Blog.find({
            tags: tagId,
            blogFor: blogFor,
            status: true
        })
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

export default getBlogsByTagAndZone;