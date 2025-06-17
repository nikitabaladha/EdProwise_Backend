import BlogTags from '../../../models/Blog/BlogTags.js';
const getTags = async (req, res) => {
    try {
        const tag = await BlogTags.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: tag
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tags',
            error: err.message
        });
    }
};


export default getTags;