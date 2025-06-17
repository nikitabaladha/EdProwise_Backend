import BlogCategory from '../../models/Blog/BlogCategory.js';

const updateBlogCategory = async (req, res) => {
    const { id } = req.params;
    const { categoryName } = req.body;
    
    // Validation
    if (!categoryName || !categoryName.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'Category name is required' 
        });
    }

    try {
        // Check if category exists
        const category = await BlogCategory.findById(id);
        if (!category) {
            return res.status(404).json({ 
                success: false,
                message: 'Category not found' 
            });
        }

        // Check if new name already exists (excluding current category)
        const existing = await BlogCategory.findOne({ 
            categoryName,
            _id: { $ne: id } // Exclude current category from check
        });
        
        if (existing) {
            return res.status(400).json({ 
                success: false,
                message: 'Category name already exists' 
            });
        }

        // Update category
        category.categoryName = categoryName;
        const updatedCategory = await category.save();
        
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error updating category',
            error: err.message 
        });
    }
};

export default updateBlogCategory;