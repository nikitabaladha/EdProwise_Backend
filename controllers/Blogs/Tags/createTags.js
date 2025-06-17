import BlogTags from '../../../models/Blog/BlogTags.js';
const createTags = async (req, res) => {
    const { tagName } = req.body;
    
    // Validation
    if (!tagName || !tagName.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'Tags name is required' 
        });
    }

    try {
        // Check for existing category
        const existing = await BlogTags.findOne({ tagName });
        if (existing) {
            return res.status(400).json({ 
                success: false,
                message: 'Tag already exists' 
            });
        }

        // Create new category
        const tag = new BlogTags({ tagName });
        await tag.save();
        
        res.status(201).json({
            success: true,
            message: 'tag created successfully',
            data: tag
        });
    } catch (err) {
        console.error('Error creating tag:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error creating tag',
            error: err.message 
        });
    }
};

export default createTags;
