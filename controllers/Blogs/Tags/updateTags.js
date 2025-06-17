import BlogTags from '../../../models/Blog/BlogTags.js';
const updateTags = async (req, res) => {
    const { id } = req.params;
    const { tagName } = req.body;
    
    // Validation
    if (!tagName || !tagName.trim()) {
        return res.status(400).json({ 
            success: false,
            message: 'Tag name is required' 
        });
    }

    try {
        // Check if category exists
        const tag = await BlogTags.findById(id);
        if (!tag) {
            return res.status(404).json({ 
                success: false,
                message: 'Tag not found' 
            });
        }

        // Check if new name already exists 
        const existing = await BlogTags.findOne({ 
            tagName,
            _id: { $ne: id } 
        });
        
        if (existing) {
            return res.status(400).json({ 
                success: false,
                message: 'Tags name already exists' 
            });
        }

        // Update category
        tag.tagName = tagName;
        const updatedTags = await tag.save();
        
        res.status(200).json({
            success: true,
            message: 'Tags updated successfully',
            data:updatedTags,
        });
    } catch (err) {
        console.error('Error updating tag :', err);
        res.status(500).json({ 
            success: false,
            message: 'Error updating tag',
            error: err.message 
        });
    }
};

export default updateTags;