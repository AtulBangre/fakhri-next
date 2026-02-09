import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: 0,
    },
    currency: {
        type: String,
        default: '₹',
    },
    category: {
        type: String,
        required: true,
        enum: ['Content', 'Design', 'Catalog', 'Video', 'SEO', 'Analysis', 'Audit', 'Service', 'Add-on'],
    },
    type: {
        type: String,
        enum: ['subscription', 'one-time', 'add-on'],
        default: 'one-time',
    },
    // For Within 2 Hours services
    isWithin2Hours: {
        type: Boolean,
        default: false,
    },
    // For add-on services
    isAddOn: {
        type: Boolean,
        default: false,
    },
    // Image/icon reference
    icon: String,
    image: String,
    // Features for service-type products
    features: [String],
    benefits: [String],
    // Metadata
    isActive: {
        type: Boolean,
        default: true,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Indexes

ProductSchema.index({ category: 1 });
ProductSchema.index({ type: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ isWithin2Hours: 1 });
ProductSchema.index({ price: 1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
