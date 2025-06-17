import BlogCategory from '../../models/Blog/BlogCategory.js';

const createCategory = async (req, res) => {
    const { categoryName } = req.body;
    
    // Validation
    if (!categoryName || !categoryName.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'Category name is required' 
        });
    }

    try {
        // Check for existing category
        const existing = await BlogCategory.findOne({ categoryName });
        if (existing) {
            return res.status(400).json({ 
                success: false,
                message: 'Category already exists' 
            });
        }

        // Create new category
        const category = new BlogCategory({ categoryName });
        await category.save();
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error creating category',
            error: err.message 
        });
    }
};

export default createCategory;
