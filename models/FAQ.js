import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, enum: ['home', 'pricing', 'dashboard', 'general'], default: 'general' },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.FAQ || mongoose.model('FAQ', FAQSchema);
