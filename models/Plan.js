import mongoose from 'mongoose';

const FeatureSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can be boolean or string
        required: true,
    },
    included: {
        type: Boolean,
        default: false,
    },
}, { _id: false });

const PlanSchema = new mongoose.Schema({
    planId: {
        type: String,
        required: true,
        unique: true,
        enum: ['elite', 'premium', 'platinum'],
    },
    name: {
        type: String,
        required: [true, 'Please provide a plan name'],
        enum: ['Elite', 'Premium', 'Platinum'],
    },
    subtitle: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
    },
    currency: {
        type: String,
        default: '₹',
    },
    period: {
        type: String,
        default: '/month',
    },
    description: {
        type: String,
        required: true,
    },
    highlighted: {
        type: Boolean,
        default: false,
    },
    features: [FeatureSchema],
    cta: {
        type: String,
        required: true,
    },
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
PlanSchema.index({ planId: 1 });
PlanSchema.index({ isActive: 1 });
PlanSchema.index({ price: 1 });

export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
