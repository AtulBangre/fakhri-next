import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    fileId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a file name'],
    },
    originalName: String,
    // Relationships
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    clientName: String,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    uploadedByName: String,
    // File details
    type: {
        type: String,
        enum: ['pdf', 'excel', 'word', 'image', 'video', 'zip', 'other'],
        default: 'other',
    },
    mimeType: String,
    size: String,
    sizeBytes: Number,
    // Storage
    url: String,
    path: String,
    // Versioning
    version: {
        type: String,
        default: 'v1.0',
    },
    // Related entities
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    // Metadata
    description: String,
    tags: [String],
    // Access control
    isPublic: {
        type: Boolean,
        default: false,
    },
    accessibleTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

// Indexes

FileSchema.index({ client: 1 });
FileSchema.index({ uploadedBy: 1 });
FileSchema.index({ type: 1 });
FileSchema.index({ createdAt: -1 });
FileSchema.index({ tags: 1 });

export default mongoose.models.File || mongoose.model('File', FileSchema);
