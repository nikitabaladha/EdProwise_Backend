import BlogCategory from '../../models/Blog/BlogCategory.js';

const getCategory = async (req, res) => {
    try {
        const categories = await BlogCategory.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: err.message
        });
    }
};


export default getCategory;