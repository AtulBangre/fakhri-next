
import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: [true, 'Please provide a client name.'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    clientDesignation: {
        type: String,
        maxlength: [100, 'Designation cannot be more than 100 characters'],
    },
    clientCompany: {
        type: String,
        maxlength: [100, 'Company cannot be more than 100 characters'],
    },
    clientImage: {
        type: String,
        // Optional
    },
    content: {
        type: String,
        required: [true, 'Please provide the testimonial content.'],
        maxlength: [1000, 'Content cannot be more than 1000 characters'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    metric: {
        label: String,
        value: String,
    },
    sortOrder: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

TestimonialSchema.index({ isActive: 1 });
TestimonialSchema.index({ sortOrder: 1 });

export default mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
