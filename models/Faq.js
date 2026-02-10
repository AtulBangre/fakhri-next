
import mongoose from 'mongoose';

const FaqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Please provide a question.'],
        maxlength: [2000, 'Question cannot be more than 2000 characters'],
    },
    answer: {
        type: String,
        required: [true, 'Please provide an answer.'],
        maxlength: [5000, 'Answer cannot be more than 5000 characters'],
    },
    category: {
        type: String,
        default: 'General',
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

FaqSchema.index({ category: 1 });
FaqSchema.index({ sortOrder: 1 });
FaqSchema.index({ isActive: 1 });

export default mongoose.models.Faq || mongoose.model('Faq', FaqSchema);
