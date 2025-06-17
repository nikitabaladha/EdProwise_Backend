import Blog from "../../../models/Blog/Blogs.js";

const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('categories', 'categoryName')
            .populate('tags', 'tagName');
            
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch blog"
        });
    }
};

export default getBlogById;