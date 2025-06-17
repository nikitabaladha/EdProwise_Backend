import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    blogFor: {
        type: String,
        required: true,
        enum: ["Student Zone", "Educator Zone"]
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    featuredImage: {
        type: String,
        required: true
    },
    blogTitle: {
        type: String,
        required: true,
        
    },
    blogSlug: {
        type: String,
        required: true,
        unique: true 
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 150
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogCategory'
    }],
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogTags'
    }],
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


blogSchema.index({ blogSlug: 1 }, { unique: true });

blogSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Blogs = mongoose.model('Blogs', blogSchema);

export default Blogs;