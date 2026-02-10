
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    jobId: {
        type: String,
        unique: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a job title'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    department: {
        type: String,
        required: [true, 'Please provide a department'],
    },
    location: {
        type: String,
        default: 'Remote',
    },
    type: {
        type: String, // e.g., Full-time, Part-time, Contract
        default: 'Full-time',
    },
    experience: {
        type: String, // e.g., "2-4 years"
    },
    description: {
        type: String,
        required: [true, 'Please provide a job description'],
    },
    requirements: {
        type: [String], // Array of requirement strings
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    sortOrder: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
