import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String },
    company: { type: String },
    image: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, default: 5 },
    category: { type: String }
}, { timestamps: true });

export default mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
