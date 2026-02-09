import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a service title'],
    },
    shortDescription: {
        type: String,
        required: true,
    },
    fullDescription: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    features: [String],
    benefits: [String],
    // Categorization
    category: {
        type: String,
        enum: ['Account Services', 'Listing & Content', 'Operations', 'Growth'],
    },
    // Pricing (optional - for services with fixed pricing)
    hasFixedPrice: {
        type: Boolean,
        default: false,
    },
    price: Number,
    // Display settings
    isActive: {
        type: Boolean,
        default: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Indexes
ServiceSchema.index({ serviceId: 1 });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ isFeatured: 1 });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
