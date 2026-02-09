import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    taskId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a task title'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    // Relationships
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clientName: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    assignedToName: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Task details
    service: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'review', 'completed', 'cancelled', 'on-hold'],
        default: 'pending',
    },
    // Dates
    dueDate: Date,
    startDate: Date,
    completedDate: Date,
    eta: String,
    // Planning
    planForWeek: String,
    isHighPriority: {
        type: Boolean,
        default: false,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    // Progress tracking
    progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    // Time tracking
    estimatedHours: Number,
    actualHours: Number,
    // Files/attachments
    attachments: [{
        name: String,
        url: String,
        type: String,
        size: String,
        uploadedAt: { type: Date, default: Date.now },
    }],
    // Comments history
    lastUpdated: {
        type: String,
        default: 'Just now',
    },
}, {
    timestamps: true,
});

// Indexes
TaskSchema.index({ taskId: 1 });
TaskSchema.index({ client: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ isHighPriority: 1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
