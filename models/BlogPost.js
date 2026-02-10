
import mongoose from 'mongoose';

const BlogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this post.'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    excerpt: {
        type: String,
        required: [true, 'Please provide an excerpt for this post.'],
        maxlength: [300, 'Excerpt cannot be more than 300 characters'],
    },
    content: {
        type: String,
        required: [true, 'Please provide the content for this post.'],
    },
    thumbnail: {
        type: String,
        required: [true, 'Please provide a thumbnail URL for this post.'],
    },
    author: {
        type: String,
        required: [true, 'Please provide an author name.'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category for this post.'],
    },
    readTime: String,
    publishDate: {
        type: Date,
        default: Date.now,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    tags: [String],
    viewCount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});


BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ isPublished: 1 });

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
