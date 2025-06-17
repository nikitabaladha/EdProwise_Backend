import mongoose from 'mongoose';

const BlogTagsSchema = new mongoose.Schema({
    tagName: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });

export default mongoose.model('BlogTags', BlogTagsSchema);
