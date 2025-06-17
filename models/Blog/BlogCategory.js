import mongoose from 'mongoose';

const BlogCategorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });

export default mongoose.model('BlogCategory', BlogCategorySchema);
